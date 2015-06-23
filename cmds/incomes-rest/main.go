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
	"fmt"
	"log"
	"net/http"
	"strconv"

	incomes "bitbucket.org/eraclitux/op-incomes"

	"github.com/eraclitux/httph"
	"github.com/eraclitux/stracer"
	"github.com/gorilla/mux"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		log.Println("[ERROR] parsing query", err)
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
		// FIXME return an error
		log.Println("Error parsing parameters")
		return
	}
	stracer.Traceln("Parsed form from request:", r.Form)
	sessionInterface, ok := httph.SharedData.Get(r, httph.MongoSession)
	if !ok {
		log.Println("[ERROR] cannot find a Mongo session")
		// FIXME Return error
		return
	}
	session := sessionInterface.(*mgo.Session)
	coll := session.DB("dossier_incomes").C("parlamentari")
	results := []incomes.Politician{}
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
	w.Header().Add("Access-Control-Expose-Headers", "X-Total-Count")
	err = query.All(&results)
	if err != nil {
		// FIXME return error
		log.Println("[ERROR] retrieving parlamentari", err)
		return
	}
	err = json.NewEncoder(w).Encode(results)
	if err != nil {
		// FIXME return error
		log.Println("[ERROR] retrieving parlamentari", err)
		return
	}
	return
}

func ParlamentareHandler(w http.ResponseWriter, r *http.Request) {
	sessionInterface, _ := httph.SharedData.Get(r, httph.MongoSession)
	vars := mux.Vars(r)
	stracer.Traceln("Parlamentare id:", vars["id"])
	session := sessionInterface.(*mgo.Session)
	coll := session.DB("dossier_incomes").C("parlamentari")
	result := incomes.Politician{}
	objId := bson.ObjectIdHex(vars["id"])
	err := coll.FindId(objId).One(&result)
	if err != nil {
		// FIXME return error
		log.Println("[ERROR] retrieving", vars["id"], "from MongoDB")
		return
	}
	fmt.Println(result)
	err = json.NewEncoder(w).Encode(result)
	if err != nil {
		// FIXME return error
		log.Println("[ERROR] retrieving", vars["id"], "from MongoDB")
		return
	}
	return
}

func main() {
	stracer.Traceln("Tracing enabled...")
	var mongoHost, httpPort string
	flag.StringVar(&mongoHost, "mongo-host", "localhost", "MongoDB address")
	flag.StringVar(&httpPort, "http-port", "8080", "http port to listen on")
	flag.Parse()
	mongoSession, err := mgo.Dial(mongoHost)
	if err != nil {
		log.Fatal(err)
	}
	defer mongoSession.Close()

	router := mux.NewRouter()
	// Public APIs
	router.HandleFunc("/", HomeHandler)
	//  Pivate APIs
	privateRouter := router.PathPrefix("/p").Subrouter()
	privateRouter.HandleFunc("/", httph.WithCORS(HomeHandler))
	privateRouter.HandleFunc("/parlamentari", httph.WithCORS(httph.WithSharedData(httph.WithMongo(mongoSession, ParlamentariHandler))))
	privateRouter.HandleFunc("/parlamentari/{id}", httph.WithCORS(httph.WithSharedData(httph.WithMongo(mongoSession, ParlamentareHandler))))
	http.Handle("/", router)
	log.Println("Listening on:", httpPort)
	log.Fatal(http.ListenAndServe(":"+httpPort, nil))
}
