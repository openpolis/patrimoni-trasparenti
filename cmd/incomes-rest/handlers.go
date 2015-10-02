package main

import (
	"encoding/json"
	"net/http"

	"bitbucket.org/eraclitux/op-incomes"
	"github.com/eraclitux/httph"
	"github.com/gorilla/mux"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func PoliticoHandlerGet(w http.ResponseWriter, r *http.Request) {
	sessionInterface, ok := httph.SharedData.Get(r, httph.MongoSession)
	if !ok {
		ErrorLogger.Println("cannot find a db session")
		http.Error(w, http.StatusText(http.StatusServiceUnavailable), http.StatusServiceUnavailable)
		return
	}
	vars := mux.Vars(r)
	session := sessionInterface.(*mgo.Session)
	coll := session.DB(incomes.DeclarationsDb).C(incomes.DeclarationsColl)
	results := []bson.M{}
	sQuery := bson.M{"op_id": vars["op_id"]}
	err := coll.Find(sQuery).Sort("-anno_dichiarazione").All(&results)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("retrieving declarations from db", err)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	err = json.NewEncoder(w).Encode(results)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("encoding declarations in json", err)
		return
	}
	return
}

func GruppoHandlerGet(w http.ResponseWriter, r *http.Request) {
	sessionInterface, ok := httph.SharedData.Get(r, httph.MongoSession)
	if !ok {
		ErrorLogger.Println("cannot find a db session")
		http.Error(w, http.StatusText(http.StatusServiceUnavailable), http.StatusServiceUnavailable)
		return
	}
	vars := mux.Vars(r)
	session := sessionInterface.(*mgo.Session)
	coll := session.DB(incomes.DeclarationsDb).C(incomes.DeclarationsColl)
	results := []bson.M{}
	pipe := coll.Pipe([]bson.M{
		{"$group": bson.M{
			"_id":         "$op_id",
			"nome":        bson.M{"$last": "$nome"},
			"cognome":     bson.M{"$last": "$cognome"},
			"gruppo":      bson.M{"$last": "$gruppo.name"},
			"acronym":     bson.M{"$last": "$gruppo.acronym"},
			"incarico":    bson.M{"$last": "$incarico"},
			"professione": bson.M{"$last": "$professione"},
		},
		},
		{"$match": bson.M{"acronym": vars["acronym"]}},
		{"$sort": bson.M{"cognome": 1}},
		{"$project": bson.M{
			"_id": 0, "op_id": "$_id",
			"cognome":     "$cognome",
			"nome":        "$nome",
			"incarico":    "$incarico",
			"professione": "$professione",
		}},
		{"$limit": 150},
	})
	iter := pipe.Iter()
	err := iter.All(&results)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("retrieving declarations from db", err)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	err = json.NewEncoder(w).Encode(results)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("encoding declarations in json", err)
		return
	}
	return
}
