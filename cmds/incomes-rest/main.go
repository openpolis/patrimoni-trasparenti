// incomes-rest system daemon that exposes private and public REST APIs for incomes service.
//
// Example usage
//
// Attach output to stdout:
//	incomes-rest -mongo-host mongohost.tld
//
// Private APIs
//
// Endpoints not intended for public use.
//
// 	/p/parlamentari
//
package main

import (
	"encoding/json"
	"flag"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"

	incomes "bitbucket.org/eraclitux/op-incomes"

	"github.com/eraclitux/httph"
	"github.com/eraclitux/stracer"
	"github.com/gorilla/mux"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// ErrorLogger is used to log error messages.
var ErrorLogger *log.Logger

// InfoLogger is used to log general info events like access log.
var InfoLogger *log.Logger

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		ErrorLogger.Println("parsing query", err)
	}
	log.Println(r.Form)
	log.Println(r)
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

// ParlamentariHandler hanldes request for 'parlamentari' private
// endpoint.
func ParlamentariHandler(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		ErrorLogger.Println("decoding parameters in url", err)
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}
	stracer.Traceln("Parsed form from request:", r.Form)
	sessionInterface, ok := httph.SharedData.Get(r, httph.MongoSession)
	if !ok {
		ErrorLogger.Println("cannot find a db session")
		http.Error(w, http.StatusText(http.StatusServiceUnavailable), http.StatusServiceUnavailable)
		return
	}
	session := sessionInterface.(*mgo.Session)
	coll := session.DB(incomes.DeclarationsDb).C(incomes.ParliamentariansCollection)
	results := []incomes.Declaration{}
	textSearch := GetFullTextSearchKey(r)
	var searchKey interface{}
	// Is it a full text search?
	if textSearch != "" {
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
		ErrorLogger.Println("retrieving parliamentarians from db", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	err = json.NewEncoder(w).Encode(results)
	if err != nil {
		ErrorLogger.Println("encoding parliamentarians in json", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	return
}

func ParlamentareHandler(w http.ResponseWriter, r *http.Request) {
	sessionInterface, ok := httph.SharedData.Get(r, httph.MongoSession)
	if !ok {
		ErrorLogger.Println("cannot find a db session")
		// FIXME Return error
		return
	}
	vars := mux.Vars(r)
	session := sessionInterface.(*mgo.Session)
	coll := session.DB(incomes.DeclarationsDb).C(incomes.ParliamentariansCollection)
	result := incomes.Declaration{}
	objId := bson.ObjectIdHex(vars["id"])
	err := coll.FindId(objId).One(&result)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("retrieving parliamentarian from db", err)
		return
	}
	err = json.NewEncoder(w).Encode(result)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("encoding parliamentarian in json", err)
		return
	}
	return
}

func SetupLoggers(o io.Writer) {
	ErrorLogger = log.New(o, "[ERROR] ", log.Ldate|log.Ltime)
	InfoLogger = log.New(o, "[INFO] ", log.Ldate|log.Ltime)
}

func main() {
	var mongoHost, httpPort string
	flag.StringVar(&mongoHost, "mongo-host", "localhost", "MongoDB address")
	flag.StringVar(&httpPort, "http-port", "8080", "http port to listen on")
	flag.Parse()

	SetupLoggers(os.Stderr)

	mongoSession, err := mgo.Dial(mongoHost)
	if err != nil {
		ErrorLogger.Fatal(err)
	}
	defer mongoSession.Close()

	router := mux.NewRouter()
	// Public APIs
	router.HandleFunc("/", HomeHandler)
	//  Pivate APIs
	privateRouter := router.PathPrefix("/p").Subrouter()
	privateRouter.HandleFunc("/", httph.WithCORS(HomeHandler))
	privateRouter.HandleFunc("/parlamentari",
		httph.WithLog(InfoLogger,
			httph.WithCORS(
				httph.WithSharedData(
					httph.WithMongo(mongoSession, ParlamentariHandler)))))
	privateRouter.HandleFunc("/parlamentari/{id}",
		httph.WithLog(InfoLogger,
			httph.WithCORS(
				httph.WithSharedData(
					httph.WithMongo(mongoSession, ParlamentareHandler)))))
	http.Handle("/", router)
	log.Println("Listening on:", httpPort)
	log.Fatal(http.ListenAndServe(":"+httpPort, nil))
}
