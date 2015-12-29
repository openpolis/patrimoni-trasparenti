package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	"bitbucket.org/eraclitux/op-incomes"
	"github.com/eraclitux/httph"
	"github.com/eraclitux/stracer"
	"github.com/gorilla/mux"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func GetFilters(r *http.Request) map[string]string {
	values := []string{"gruppo", "organo", "circoscrizione", "anno"}
	filters := make(map[string]string)
	for _, k := range values {
		if elem, ok := r.Form[k]; ok {
			filters[k] = elem[0]
		}
	}
	return filters
}

func JSONErrorW(w http.ResponseWriter, m string, code int) {
	w.WriteHeader(code)
	msg := map[string]string{"error": m}
	json.NewEncoder(w).Encode(msg)
	return
}

func PoliticoHandlerGet(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	sessionInterface, ok := httph.SharedData.Get(r, httph.MongoSession)
	if !ok {
		msg := "cannot find a db session"
		ErrorLogger.Println(msg)
		JSONErrorW(w, msg, http.StatusInternalServerError)
		return
	}
	err := r.ParseForm()
	if err != nil {
		msg := "decoding parameters in url"
		ErrorLogger.Println(msg, err)
		JSONErrorW(w, msg, http.StatusBadRequest)
		return
	}
	filters := GetFilters(r)
	vars := mux.Vars(r)
	session := sessionInterface.(*mgo.Session)
	coll := session.DB(incomes.DeclarationsDb).C(incomes.DeclarationsColl)
	results := []bson.M{}
	sQuery := bson.M{"op_id": vars["op_id"]}
	if _, ok := filters["anno"]; ok {
		v, err := strconv.Atoi(filters["anno"])
		if err == nil {
			sQuery["anno_dichiarazione"] = v
		}
	}
	stracer.Traceln(sQuery)
	err = coll.Find(sQuery).Sort("-anno_dichiarazione").All(&results)
	if err != nil {
		msg := "retrieving declarations from db"
		ErrorLogger.Println(msg, err)
		JSONErrorW(w, msg, http.StatusInternalServerError)
		return
	}
	err = json.NewEncoder(w).Encode(results)
	if err != nil {
		msg := "encoding declarations in json"
		ErrorLogger.Println(msg, err)
		JSONErrorW(w, msg, http.StatusInternalServerError)
		return
	}
	return
}

func AllPoliticiHandlerGet(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	sessionInterface, ok := httph.SharedData.Get(r, httph.MongoSession)
	if !ok {
		msg := "cannot find a db session"
		ErrorLogger.Println(msg)
		JSONErrorW(w, msg, http.StatusInternalServerError)
		return
	}
	err := r.ParseForm()
	if err != nil {
		msg := "decoding parameters in url"
		ErrorLogger.Println(msg, err)
		JSONErrorW(w, msg, http.StatusBadRequest)
		return
	}
	filters := GetFilters(r)
	session := sessionInterface.(*mgo.Session)
	coll := session.DB(incomes.DeclarationsDb).C(incomes.DeclarationsColl)
	results := []bson.M{}
	baseQuery := []bson.M{
		{"$match": assembleMatch(filters)},
		{"$sort": bson.M{"anno_dichiarazione": 1}},
		{"$unwind": "$incarichi"},
		{"$group": bson.M{
			"_id":          "$op_id",
			"nome":         bson.M{"$last": "$nome"},
			"cognome":      bson.M{"$last": "$cognome"},
			"data_nascita": bson.M{"$last": "$data_nascita"},
			"dichiarazioni": bson.M{"$push": bson.M{
				"anno":           "$anno_dichiarazione",
				"gruppo_acronym": "$incarichi.gruppo.acronym",
				"istituzione":    "$incarichi.istituzione",
				"circoscrizione": "$incarichi.circoscrizione",
				"dichiarazione":  bson.M{"$concat": []string{"http://" + conf.DomainName + "/api/politici/", "$op_id", "?anno="}},
			}},
		},
		},
		{"$sort": bson.M{"cognome": 1}},
	}
	pipe := coll.Pipe(baseQuery)
	iter := pipe.Iter()
	err = iter.All(&results)
	if err != nil {
		msg := "retrieving declarations from db"
		ErrorLogger.Println(msg, err)
		JSONErrorW(w, msg, http.StatusInternalServerError)
		return
	}
	AddYearInJSON(results)
	err = json.NewEncoder(w).Encode(results)
	if err != nil {
		msg := "encoding declarations in json"
		ErrorLogger.Println(msg, err)
		JSONErrorW(w, msg, http.StatusInternalServerError)
		return
	}
	return
}
