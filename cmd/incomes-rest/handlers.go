package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"bitbucket.org/eraclitux/op-incomes"
	"github.com/eraclitux/httph"
	"github.com/eraclitux/stracer"
	"github.com/gorilla/mux"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Please, welcome.")
}

func PoliticoUIHandlerGet(w http.ResponseWriter, r *http.Request) {
	sessionInterface, ok := httph.SharedData.Get(r, httph.MongoSession)
	if !ok {
		ErrorLogger.Println("cannot find a db session")
		http.Error(w, http.StatusText(http.StatusServiceUnavailable), http.StatusServiceUnavailable)
		return
	}
	vars := mux.Vars(r)
	session := sessionInterface.(*mgo.Session)
	coll := session.DB(incomes.DeclarationsDb).C(incomes.DeclarationsColl)
	//results := []bson.M{}
	results := []incomes.DeclarationPolitical{}
	sQuery := bson.M{"op_id": vars["op_id"]}
	err := coll.Find(sQuery).Sort("-anno_dichiarazione").All(&results)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("retrieving declarations from db", err)
		return
	}
	enhancedResults := make([]incomes.DeclarationEnhanced, len(results))
	for i, d := range results {
		enhancedResults[i] = incomes.DeclarationEnhanced{
			DeclarationPolitical: d,
			UrlFileOrig:          createS3link(d.File),
			UrlFileRect:          createS3link(d.FileRectification),
		}
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	err = json.NewEncoder(w).Encode(enhancedResults)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("encoding declarations in json", err)
		return
	}
	return
}

func ListHandlerGet(w http.ResponseWriter, r *http.Request) {
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
		{"$sort": bson.M{"anno_dichiarazione": 1}},
		{"$unwind": "$incarichi"},
		{"$group": bson.M{
			"_id":               "$op_id",
			"nome":              bson.M{"$last": "$nome"},
			"cognome":           bson.M{"$last": "$cognome"},
			"data_nascita":      bson.M{"$last": "$data_nascita"},
			"gruppo":            bson.M{"$addToSet": "$incarichi.gruppo.name"},
			"gruppo_acronym":    bson.M{"$addToSet": "$incarichi.gruppo.acronym"},
			"istituzioni":       bson.M{"$addToSet": "$incarichi.istituzione"},
			"circoscrizioni":    bson.M{"$addToSet": "$incarichi.circoscrizione"},
			"professione":       bson.M{"$last": "$professione"},
			"ultimo_reddito":    bson.M{"$last": "$totale_730_dichiarante"},
			"tot_reddito":       bson.M{"$sum": "$totale_730_dichiarante"},
			"tot_completezza":   bson.M{"$sum": "$indice_completezza"},
			"num_dichiarazioni": bson.M{"$sum": 1},
		},
		},
		{"$match": bson.M{vars["type"]: vars["key"]}},
		{"$sort": bson.M{"cognome": 1}},
		{"$project": bson.M{
			"_id":               0,
			"op_id":             "$_id",
			"cognome":           "$cognome",
			"nome":              "$nome",
			"data_nascita":      "$data_nascita",
			"istituzioni":       "$istituzioni",
			"professione":       "$professione",
			"gruppo_acronym":    "$gruppo_acronym",
			"ultimo_reddito":    1,
			"reddito_medio":     bson.M{"$divide": []string{"$tot_reddito", "$num_dichiarazioni"}},
			"completezza_media": bson.M{"$divide": []string{"$tot_completezza", "$num_dichiarazioni"}},
		},
		},
		//{"$limit": 150},
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

func DownloadAllGet(w http.ResponseWriter, r *http.Request) {
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
	year, err := strconv.Atoi(vars["year"])
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("decoding year", err)
		return
	}
	pipe := coll.Pipe([]bson.M{
		{"$match": bson.M{"anno_dichiarazione": year}},
	})
	iter := pipe.Iter()
	err = iter.All(&results)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("retrieving declarations from db", err)
		return
	}
	stracer.Traceln(year)
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Content-Disposition", "attachment; filename=\""+vars["year"]+".json\"")
	err = json.NewEncoder(w).Encode(results)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("encoding declarations in json", err)
		return
	}
	return
}
