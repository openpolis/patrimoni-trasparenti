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

func ClassificheHandlerImmobiliTot(w http.ResponseWriter, r *http.Request) {
	sessionInterface, ok := httph.SharedData.Get(r, httph.MongoSession)
	if !ok {
		ErrorLogger.Println("cannot find a db session")
		http.Error(w, http.StatusText(http.StatusServiceUnavailable), http.StatusServiceUnavailable)
		return
	}
	session := sessionInterface.(*mgo.Session)
	coll := session.DB(incomes.DeclarationsDb).C(incomes.DeclarationsColl)
	results := []bson.M{}
	pipe := coll.Pipe([]bson.M{
		{"$unwind": "$beni_immobili"},
		{"$group": bson.M{
			"_id":     "$op_id",
			"total":   bson.M{"$sum": 1},
			"nome":    bson.M{"$last": "$nome"},
			"cognome": bson.M{"$last": "$cognome"},
		},
		},
		{"$sort": bson.M{"total": -1}},
		{"$limit": 20},
	})
	iter := pipe.Iter()
	err := iter.All(&results)
	if err != nil {
		ErrorLogger.Println("retrieving data", err)
		status := http.StatusInternalServerError
		http.Error(w, http.StatusText(status), status)
		return
	}
	//w.Header().Set("Content-Type", "application/json; charset=utf-8")
	httph.HeaderJSON(w)
	err = json.NewEncoder(w).Encode(results)
	if err != nil {
		ErrorLogger.Println("encoding data", err)
		status := http.StatusInternalServerError
		http.Error(w, http.StatusText(status), status)
		return
	}
}
func ClassificheHandlerImmobiliConiuge(w http.ResponseWriter, r *http.Request) {
	sessionInterface, ok := httph.SharedData.Get(r, httph.MongoSession)
	if !ok {
		ErrorLogger.Println("cannot find a db session")
		http.Error(w, http.StatusText(http.StatusServiceUnavailable), http.StatusServiceUnavailable)
		return
	}
	session := sessionInterface.(*mgo.Session)
	coll := session.DB(incomes.DeclarationsDb).C(incomes.DeclarationsColl)
	results := []bson.M{}
	pipe := coll.Pipe([]bson.M{
		{"$unwind": "$beni_immobili"},
		{"$match": bson.M{"beni_immobili.persona": "coniuge"}},
		{"$group": bson.M{
			"_id":     "$op_id",
			"total":   bson.M{"$sum": 1},
			"nome":    bson.M{"$last": "$nome"},
			"cognome": bson.M{"$last": "$cognome"},
		},
		},
		{"$sort": bson.M{"total": -1}},
		{"$limit": 20},
	})
	iter := pipe.Iter()
	err := iter.All(&results)
	if err != nil {
		ErrorLogger.Println("retrieving data", err)
		status := http.StatusInternalServerError
		http.Error(w, http.StatusText(status), status)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	err = json.NewEncoder(w).Encode(results)
	if err != nil {
		ErrorLogger.Println("encoding data", err)
		status := http.StatusInternalServerError
		http.Error(w, http.StatusText(status), status)
		return
	}
}

// @Title Classifiche
// @Description Varie classifiche sui patrimoni dei parlamentari
// @Accept json
// @Param kind path string true "Tipo della classifica desiderata {beni-immobili-totali|beni-immobili-coniuge}"
// @Success 200 {object} string "Success"
// @Failure 401 {object} string "Access denied"
// @Failure 404 {object} string "Not Found"
// @Failure 500 {object} string "Mhm, something went wrong"
// @Router /api/dichiarazioni/classifiche/{kind} [get]
func ClassificheHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	switch vars["kind"] {
	case "beni-immobili-totali":
		ClassificheHandlerImmobiliTot(w, r)
	case "beni-immobili-coniuge":
		ClassificheHandlerImmobiliConiuge(w, r)
	default:
		ErrorLogger.Println("bad charts request", vars)
		status := http.StatusBadRequest
		http.Error(w, http.StatusText(status), status)
		return
	}
}
