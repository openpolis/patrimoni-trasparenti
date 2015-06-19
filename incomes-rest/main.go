// Expose dossier 2015 data via rest API.
package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/http"

	"github.com/eraclitux/gtypes"
	"github.com/gorilla/mux"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

var sharedData gtypes.HTTPRequestSetter = gtypes.NewHTTPMap()

func withCORS(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Expose-Headers", "Location")
		fn(w, r)
	}
}

func withMongo(session *mgo.Session, fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		s := session.Copy()
		defer s.Close()
		k := "mongo-session"
		sharedData.Insert(r, k, s)
		defer sharedData.Delete(r, k)
		fn(w, r)
	}
}

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		log.Println("[ERROR] parsing query", err)
	}
	log.Println(r.Form)
	log.Println(r)
}

// Risponde all'indirizzo:
//	/p/parlamentari
func ParlamentariHandler(w http.ResponseWriter, r *http.Request) {
	sessionInterface, ok := sharedData.Get(r, "mongo-session")
	if !ok {
		log.Println("[ERROR] cannot find a Mongo session")
		// FIXME Return error
		return
	}
	session := sessionInterface.(*mgo.Session)
	coll := session.DB("dossier_incomes").C("parlamentari")
	results := []bson.M{}
	_ = coll.Find(nil).All(&results)
	json.NewEncoder(w).Encode(results)
	return
}

func main() {
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
	privateRouter.HandleFunc("/", withCORS(HomeHandler))
	privateRouter.HandleFunc("/parlamentari", withMongo(mongoSession, ParlamentariHandler))
	http.Handle("/", router)
	log.Fatal(http.ListenAndServe(":"+httpPort, nil))
}
