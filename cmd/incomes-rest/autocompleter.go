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
	// Find roles.
	roleResults := []bson.M{}
	rgx := []bson.M{
		{"name": bson.M{"$regex": bson.RegEx{textSearch, "i"}}},
	}
	pipe := coll.Pipe([]bson.M{
		{"$unwind": "$incarichi"},
		{"$group": bson.M{
			"_id":  "$incarichi.istituzione",
			"name": bson.M{"$last": "$incarichi.istituzione"},
		},
		},
		{"$match": bson.M{"$or": rgx}},
		{"$sort": bson.M{"name": 1}},
		{"$project": bson.M{"_id": 0, "id": "$_id", "value": "$name", "istitution": "$name"}},
	})
	iter := pipe.Iter()
	err = iter.All(&roleResults)
	// Find parties.
	partiesResults := []bson.M{}
	rgx = []bson.M{
		{"name": bson.M{"$regex": bson.RegEx{textSearch, "i"}}},
		{"acronym": bson.M{"$regex": bson.RegEx{textSearch, "i"}}},
	}
	pipe = coll.Pipe([]bson.M{
		{"$unwind": "$incarichi"},
		{"$group": bson.M{
			"_id":     "$incarichi.gruppo.name",
			"name":    bson.M{"$last": "$incarichi.gruppo.name"},
			"acronym": bson.M{"$last": "$incarichi.gruppo.acronym"},
		},
		},
		{"$match": bson.M{"$or": rgx}},
		{"$sort": bson.M{"acronym": 1}},
		{"$project": bson.M{"_id": 0, "id": "$_id", "value": bson.M{"$concat": []string{"$acronym", " - ", "$name"}}, "acronym": "$acronym"}},
	})
	iter = pipe.Iter()
	err = iter.All(&partiesResults)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("retrieving declarations from db", err)
		return
	}
	// Find districts.
	districtsResults := []bson.M{}
	rgx = []bson.M{
		{"name": bson.M{"$regex": bson.RegEx{textSearch, "i"}}},
	}
	pipe = coll.Pipe([]bson.M{
		{"$unwind": "$incarichi"},
		{"$group": bson.M{
			"_id":  "$incarichi.circoscrizione",
			"name": bson.M{"$last": "$incarichi.circoscrizione"},
			"type": bson.M{"$last": "$incarichi.tipo_elezione"},
		},
		},
		{"$match": bson.M{"$or": rgx}},
		{"$sort": bson.M{"name": 1}},
		{"$project": bson.M{"_id": 0, "id": "$_id", "district": "$name", "value": bson.M{"$concat": []string{"$name", " (", "$type", ")"}}}},
	})
	iter = pipe.Iter()
	err = iter.All(&districtsResults)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("retrieving declarations from db", err)
		return
	}
	// Find people
	peopleResults := []bson.M{}
	peopleRgx := []bson.M{
		{"nome": bson.M{"$regex": bson.RegEx{textSearch, "i"}}},
		{"cognome": bson.M{"$regex": bson.RegEx{textSearch, "i"}}},
	}
	pipe = coll.Pipe([]bson.M{
		{"$group": bson.M{
			"_id":     "$op_id",
			"nome":    bson.M{"$last": "$nome"},
			"cognome": bson.M{"$last": "$cognome"},
		},
		},
		{"$match": bson.M{"$or": peopleRgx}},
		{"$sort": bson.M{"cognome": 1}},
		{"$project": bson.M{"_id": 0, "id": "$_id", "value": bson.M{"$concat": []string{"$cognome", " ", "$nome"}}}},
		{"$limit": 150},
	})
	iter = pipe.Iter()
	err = iter.All(&peopleResults)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("retrieving declarations from db", err)
		return
	}
	results := make([]bson.M, 0, len(roleResults)+len(partiesResults)+len(peopleResults))
	results = append(results, roleResults...)
	results = append(results, partiesResults...)
	results = append(results, districtsResults...)
	results = append(results, peopleResults...)
	err = json.NewEncoder(w).Encode(results)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("encoding choices in json", err)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	return
}
