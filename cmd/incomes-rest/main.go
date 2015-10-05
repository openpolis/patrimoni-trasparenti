// incomes-rest system daemon that exposes private and public REST APIs for incomes service.
//
// Esempio di utilizzo
//
// Attach output to stdout:
//	incomes-rest -mongo-host mongohost.tld
//
// @APIVersion 0.1.0
// @APITitle Patrimoni Trasparenti RESTapi
// @APIDescription Openpolis Patrimoni trasparenti RESTapi. http://openpolis.it/
// @SubApi TadaBoard API [/tdb]
// @SubApi API politici [/api]
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"

	incomes "bitbucket.org/eraclitux/op-incomes"

	"github.com/eraclitux/cfgp"
	"github.com/eraclitux/httph"
	"github.com/eraclitux/stracer"
	"github.com/gorilla/mux"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// Version is populated at compile time
// with git describe output.
var Version = "unknown-rev"
var BuildTime = "unknown-time"

// InvalidIDError is returned if declaration id is invalid.
var ErrInvalidID = errors.New("invalid declaration id")

// ErrorLogger is used to log error messages.
var ErrorLogger *log.Logger

// InfoLogger is used to log general info events like access log.
var InfoLogger *log.Logger

type daemonConf struct {
	Httpport    string
	Httpaddress string
	Mongohost   string
	S3bucket    string
	S3key       string
	S3secret    string
	S3path      string
	LogFile     string
	Version     bool `cfgp:"v,show version and exit,"`
}

var conf daemonConf

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Please, welcome.")
}

func GetObjectIdHex(s string) (bson.ObjectId, error) {
	if !bson.IsObjectIdHex(s) {
		return "", ErrInvalidID
	}
	return bson.ObjectIdHex(s), nil
}

func GetSortKey(r *http.Request) string {
	sort := "$natural"
	if elem, ok := r.Form["_sort"]; ok {
		sort = elem[0]
		if elem, ok := r.Form["_sortDir"]; ok {
			if elem[0] == "DESC" {
				sort = "-" + sort
			}
		}
	}
	return sort
}

func GetLimit(r *http.Request) int {
	limit := 10
	if elem, ok := r.Form["_end"]; ok {
		limit, _ = strconv.Atoi(elem[0])
	}
	return limit
}
func GetSkip(r *http.Request) int {
	skip := 0
	if elem, ok := r.Form["_start"]; ok {
		skip, _ = strconv.Atoi(elem[0])
	}
	return skip
}

// GetFullTextSearchKey extracts full text serach key from
// url parameters.
func GetFullTextSearchKey(r *http.Request) string {
	q := ""
	if elem, ok := r.Form["q"]; ok {
		q = elem[0]
	}
	return q
}
func DichiarazioniHandlerGet(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		ErrorLogger.Println("decoding parameters in url", err)
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}
	sessionInterface, ok := httph.SharedData.Get(r, httph.MongoSession)
	if !ok {
		ErrorLogger.Println("cannot find a db session")
		http.Error(w, http.StatusText(http.StatusServiceUnavailable), http.StatusServiceUnavailable)
		return
	}
	session := sessionInterface.(*mgo.Session)
	coll := session.DB(incomes.DeclarationsDb).C(incomes.DeclarationsColl)
	results := []incomes.Declaration{}
	textSearch := GetFullTextSearchKey(r)
	var searchKey interface{}
	// Is it a full text search?
	if textSearch != "" {
		// NOTE defining language seems to degradate results quality.
		//searchKey = bson.M{"$text": bson.M{"$search": textSearch, "$language": "it"}}
		searchKey = bson.M{"$text": bson.M{"$search": textSearch}}
		stracer.Traceln("text search key", searchKey)
	}
	query := coll.Find(searchKey).Sort(GetSortKey(r))
	number, _ := query.Count()
	query = query.Skip(GetSkip(r)).Limit(GetLimit(r))
	// Used by ng-admin to paginate.
	w.Header().Set("X-Total-Count", strconv.Itoa(number))
	// Add becouse some decorator could set this
	w.Header().Add("Access-Control-Expose-Headers", "X-Total-Count")
	err = query.All(&results)
	if err != nil {
		ErrorLogger.Println("retrieving declarations from db", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	err = json.NewEncoder(w).Encode(results)
	if err != nil {
		ErrorLogger.Println("encoding declarations in json", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	return
}

func DichiarazioniHandlerPost(w http.ResponseWriter, r *http.Request) {
	sessionInterface, ok := httph.SharedData.Get(r, httph.MongoSession)
	if !ok {
		ErrorLogger.Println("cannot find a db session")
		http.Error(w, http.StatusText(http.StatusServiceUnavailable), http.StatusServiceUnavailable)
		return
	}
	session := sessionInterface.(*mgo.Session)
	coll := session.DB(incomes.DeclarationsDb).C(incomes.DeclarationsColl)
	p := incomes.Declaration{}
	// Using Unmarshall and lowering all received bytes
	// will make date parsing fails:
	// decoding declaration in json parsing time ""2015-07-31t00:00:00z"" as ""2006-01-02T15:04:05Z07:00""
	err := json.NewDecoder(r.Body).Decode(&p)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("decoding declaration in json", err)
		return
	}
	incomes.LowerStruct(&p)
	id := bson.NewObjectId()
	p.Id = id
	err = coll.Insert(p)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("saving declaration", err)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(p)
}

// DichiarazioniHandler hanldes requests for all politicians private
// endpoint.
func DichiarazioniHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		DichiarazioniHandlerGet(w, r)
		return
	case "POST":
		DichiarazioniHandlerPost(w, r)
		return
	case "OPTIONS":
		w.Header().Add("Access-Control-Allow-Methods", "POST,PUT,DELETE")
		w.Header().Add("Access-Control-Allow-Headers", "content-type")
		w.WriteHeader(http.StatusNoContent)
		return
	}
	http.Error(w, http.StatusText(http.StatusNotFound), http.StatusNotFound)

}

// DichiarazioniHandlerPost return a single declaration.
// OLD
func DichiarazioneHandlerGet(w http.ResponseWriter, r *http.Request) {
	sessionInterface, ok := httph.SharedData.Get(r, httph.MongoSession)
	if !ok {
		ErrorLogger.Println("cannot find a db session")
		http.Error(w, http.StatusText(http.StatusServiceUnavailable), http.StatusServiceUnavailable)
		return
	}
	vars := mux.Vars(r)
	session := sessionInterface.(*mgo.Session)
	coll := session.DB(incomes.DeclarationsDb).C(incomes.DeclarationsColl)
	result := incomes.DeclarationPolitical{}
	objId, err := GetObjectIdHex(vars["id"])
	if err != nil {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		ErrorLogger.Println("invalid id", err)
		return
	}
	err = coll.FindId(objId).One(&result)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("retrieving declaration from db", err)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	enhancedResult := incomes.DeclarationEnhanced{
		DeclarationPolitical: result,
		UrlFileOrig:          createS3link(result.File),
		UrlFileRect:          createS3link(result.FileRectification),
	}
	err = json.NewEncoder(w).Encode(enhancedResult)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("encoding declaration in json", err)
		return
	}
	return
}

func DichiarazioneHandlerPut(w http.ResponseWriter, r *http.Request) {
	sessionInterface, ok := httph.SharedData.Get(r, httph.MongoSession)
	if !ok {
		ErrorLogger.Println("cannot find a db session")
		http.Error(w, http.StatusText(http.StatusServiceUnavailable), http.StatusServiceUnavailable)
		return
	}
	vars := mux.Vars(r)
	session := sessionInterface.(*mgo.Session)
	coll := session.DB(incomes.DeclarationsDb).C(incomes.DeclarationsColl)
	p := incomes.Declaration{}
	err := json.NewDecoder(r.Body).Decode(&p)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("decoding declaration in json", err)
		return
	}
	incomes.LowerStruct(&p)
	objId, err := GetObjectIdHex(vars["id"])
	if err != nil {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		ErrorLogger.Println("invalid id", err)
		return
	}
	// Avoid "saving declaration Mod on _id not allowed"
	// thanks to "omitempty" in tag.
	p.Id = bson.ObjectId("")
	uQuery := bson.M{
		"$set":         p,
		"$currentDate": bson.M{"ultima_modifica": true},
	}
	err = coll.UpdateId(objId, uQuery)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("saving declaration", err)
		return
	}
	w.WriteHeader(http.StatusAccepted)
}

func DichiarazioneHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		DichiarazioneHandlerGet(w, r)
		return
	case "PUT":
		DichiarazioneHandlerPut(w, r)
		return
	case "OPTIONS":
		w.Header().Add("Access-Control-Allow-Methods", "POST,PUT,DELETE")
		w.Header().Add("Access-Control-Allow-Headers", "content-type")
		w.WriteHeader(http.StatusNoContent)
		return
	}
	http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
}

func SetupLoggers(o io.Writer) {
	ErrorLogger = log.New(o, "[ERROR] ", log.Ldate|log.Ltime)
	InfoLogger = log.New(o, "[INFO] ", log.Ldate|log.Ltime)
}

func main() {
	conf = daemonConf{
		Httpport:  "8080",
		Mongohost: "localhost",
	}
	err := cfgp.Parse(&conf)
	if err != nil {
		log.Fatalln("parsing conf", err)
	}
	if conf.Version {
		log.Fatalf("%s %s", Version, BuildTime)
	}
	if conf.LogFile != "" {
		f, err := os.OpenFile(conf.LogFile, os.O_WRONLY|os.O_APPEND|os.O_CREATE, 0644)
		if err != nil {
			log.Fatalln("opening log file:", err)
		}
		defer f.Close()
		SetupLoggers(f)
	} else {
		SetupLoggers(os.Stdout)
	}

	mongoSession, err := mgo.Dial(conf.Mongohost)
	if err != nil {
		ErrorLogger.Fatalln("connecting to MongoDB", err)
	}
	defer mongoSession.Close()
	InfoLogger.Println("connected to mongo:", conf.Mongohost)

	router := mux.NewRouter()
	// ===== Public APIs
	router.HandleFunc("/", httph.WithLog(InfoLogger, HomeHandler))
	router.HandleFunc("/api/list/{type}/{key}",
		httph.WithLog(InfoLogger,
			httph.WithCORS(
				httph.WithSharedData(
					httph.WithMongo(mongoSession, ListHandlerGet))))).Methods("GET")
	// FIXME old, delete it.
	router.HandleFunc("/api/politici/{op_id}",
		httph.WithLog(InfoLogger,
			httph.WithCORS(
				httph.WithSharedData(
					httph.WithMongo(mongoSession, PoliticoHandlerGet))))).Methods("GET")
	router.HandleFunc("/api/autocompleter",
		httph.WithLog(InfoLogger,
			httph.WithCORS(
				httph.WithSharedData(
					httph.WithMongo(mongoSession, AutocompleterHandler))))).Methods("GET")
	router.HandleFunc("/api/dichiarazioni/{id}",
		httph.WithLog(InfoLogger,
			httph.WithCORS(
				httph.WithSharedData(
					httph.WithMongo(mongoSession, DichiarazioneHandlerGet))))).Methods("GET")
	router.HandleFunc("/api/dichiarazioni/classifiche/{kind}",
		httph.WithLog(InfoLogger,
			httph.WithCORS(
				httph.WithSharedData(
					httph.WithMongo(mongoSession, ClassificheHandler)))))
	router.HandleFunc("/api/tdb/test",
		httph.WithLog(InfoLogger,
			httph.WithCORS(
				httph.WithSharedData(
					httph.WithMongo(mongoSession, TadaBoardHandlerTest)))))
	// ===== Pivate APIs
	privateRouter := router.PathPrefix("/api/p").Subrouter()
	privateRouter.HandleFunc("/", httph.WithCORS(HomeHandler))
	privateRouter.HandleFunc("/file/upload",
		httph.WithLog(InfoLogger,
			httph.WithCORS(DeclarationUploader)))
	privateRouter.HandleFunc("/dichiarazioni",
		httph.WithLog(InfoLogger,
			httph.WithCORS(
				httph.WithSharedData(
					httph.WithMongo(mongoSession, DichiarazioniHandler)))))
	privateRouter.HandleFunc("/dichiarazioni/{id}",
		httph.WithLog(InfoLogger,
			httph.WithCORS(
				httph.WithSharedData(
					httph.WithMongo(mongoSession, DichiarazioneHandler)))))
	http.Handle("/", router)
	InfoLogger.Println("listening on:", conf.Httpaddress, ":", conf.Httpport)
	log.Fatalln(http.ListenAndServe(conf.Httpaddress+":"+conf.Httpport, nil))
}
