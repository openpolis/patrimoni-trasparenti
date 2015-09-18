package main

import (
	"encoding/json"
	"net/http"

	"bitbucket.org/eraclitux/op-incomes"
	"github.com/eraclitux/httph"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

type choice struct {
	Value string `json:"value"`
	ID    string `json:"id"`
}

// Maybe could be usefull for partial match:
// http://stackoverflow.com/questions/20806822/mongo-aggregation-with-relevance-match-multiple-fields
func AutocompleterHandler(w http.ResponseWriter, r *http.Request) {
	sessionInterface, ok := httph.SharedData.Get(r, httph.MongoSession)
	if !ok {
		ErrorLogger.Println("cannot find a db session")
		http.Error(w, http.StatusText(http.StatusServiceUnavailable), http.StatusServiceUnavailable)
		return
	}
	err := r.ParseForm()
	if err != nil {
		ErrorLogger.Println("decoding parameters in url", err)
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}
	textSearch := GetFullTextSearchKey(r)

	session := sessionInterface.(*mgo.Session)
	coll := session.DB(incomes.DeclarationsDb).C(incomes.DeclarationsColl)
	results := []bson.M{}
	pipe := coll.Pipe([]bson.M{
		{"$match": bson.M{"$text": bson.M{"$search": textSearch}}},
		{"$sort": bson.M{"cognome": -1}},
		{"$project": bson.M{"_id": 0, "id": "$_id", "anno": "$anno_dichiarazione", "value": bson.M{"$concat": []string{"$cognome", " ", "$nome"}}}},
		{"$limit": 200},
	})
	iter := pipe.Iter()
	err = iter.All(&results)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("retrieving declarations from db", err)
		return
	}
	err = json.NewEncoder(w).Encode(results)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("encoding choices in json", err)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	return
}
