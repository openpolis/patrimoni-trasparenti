// Expose dossier 2015 data via rest API.
package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

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
}

func main() {
	router := mux.NewRouter()
	// Public APIs
	router.HandleFunc("/", HomeHandler)
	//  Pivate APIs
	privateRouter := router.PathPrefix("/p").Subrouter()
	privateRouter.HandleFunc("/", HomeHandler)
	privateRouter.HandleFunc("/parlamentari", ParlamentariHandler)
	http.Handle("/", router)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
