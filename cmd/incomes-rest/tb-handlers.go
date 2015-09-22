package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"bitbucket.org/eraclitux/op-incomes"
	"github.com/eraclitux/httph"
	"github.com/eraclitux/stracer"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// assembleMatch create map for "$match" pipe stage for
// MongoDB aggregations.
func assembleMatch(query map[string]string) bson.M {
	match := bson.M{}
	for k, v := range query {
		if k == "anno_dichiarazione" {
			match[k], _ = strconv.Atoi(v)
			continue
		}
		match[k] = v
	}
	stracer.Traceln("match assembled:", match)
	return match
}

func makeIncaricoList(coll *mgo.Collection) incomes.TBItem {
	data := make([]interface{}, 0)
	results := []bson.M{}
	pipe := coll.Pipe([]bson.M{
		{"$group": bson.M{
			"_id": "$incarico",
		},
		},
		{"$sort": bson.M{"_id": -1}},
	})
	iter := pipe.Iter()
	err := iter.All(&results)
	if err != nil {
		ErrorLogger.Println("querying mongo", err)
		return incomes.TBItem{}
	}
	for _, e := range results {
		role := e["_id"].(string)
		data = append(data, map[string]string{"id": role, "label": role})
	}
	return incomes.TBItem{
		ID:   "1",
		Tip:  "Incarico",
		Data: data,
	}
}
func makeAnnoList(coll *mgo.Collection) incomes.TBItem {
	data := make([]interface{}, 0)
	results := []bson.M{}
	pipe := coll.Pipe([]bson.M{
		{"$group": bson.M{
			"_id": "$anno_dichiarazione",
		},
		},
		{"$sort": bson.M{"_id": -1}},
	})
	iter := pipe.Iter()
	err := iter.All(&results)
	if err != nil {
		ErrorLogger.Println("querying mongo", err)
		return incomes.TBItem{}
	}
	for _, e := range results {
		year := strconv.Itoa(e["_id"].(int))
		data = append(data, map[string]string{"id": year, "label": year})
	}
	return incomes.TBItem{
		ID:   "9",
		Tip:  "Anno dichiarazione",
		Data: data,
	}
}

func makeGruppoList(coll *mgo.Collection) incomes.TBItem {
	data := make([]interface{}, 0)
	results := []bson.M{}
	pipe := coll.Pipe([]bson.M{
		{"$group": bson.M{
			"_id":  "$gruppo.acronym",
			"name": bson.M{"$last": "$gruppo.name"},
		},
		},
		{"$sort": bson.M{"_id": -1}},
	})
	iter := pipe.Iter()
	err := iter.All(&results)
	if err != nil {
		ErrorLogger.Println("querying mongo", err)
		return incomes.TBItem{}
	}
	for _, e := range results {
		acronym := e["_id"].(string)
		name := e["name"].(string)
		data = append(data, map[string]string{"id": acronym, "label": name})
	}
	return incomes.TBItem{
		ID:   "8",
		Tip:  "Gruppo",
		Data: data,
	}
}

func makeCompletezzaPie(query map[string]string, coll *mgo.Collection) incomes.TBItem {
	results := []bson.M{}
	pipe := coll.Pipe([]bson.M{
		{"$match": assembleMatch(query)},
		{"$group": bson.M{
			"_id":   "$indice_completezza",
			"total": bson.M{"$sum": 1},
		},
		},
		{"$sort": bson.M{"total": -1}},
	})
	iter := pipe.Iter()
	err := iter.All(&results)
	if err != nil {
		ErrorLogger.Println("querying mongo", err)
		return incomes.TBItem{}
	}
	if len(results) == 0 {
		stracer.Traceln("empty results from mongo")
		return incomes.TBItem{}
	}
	puntiWg1 := []interface{}{
		incomes.TBPolarPoint{ID: "0", Value: float64(results[0]["total"].(int)), Category: "Ignota"},
		incomes.TBPolarPoint{ID: "1", Value: 33, Category: "Insufficiente"},
		incomes.TBPolarPoint{ID: "2", Value: 60, Category: "Bassa"},
		incomes.TBPolarPoint{ID: "3", Value: 20, Category: "Bene"},
		incomes.TBPolarPoint{ID: "4", Value: 20, Category: "Ottima"},
	}
	return incomes.TBItem{
		ID:   "4",
		Tip:  "Completezza",
		Data: puntiWg1,
	}
}

func makeAutomobiliMean(query map[string]string, coll *mgo.Collection) incomes.TBItem {
	results := []bson.M{}
	pipe := coll.Pipe([]bson.M{
		{"$match": assembleMatch(query)},
		{"$unwind": "$beni_mobili"},
		{"$group": bson.M{
			"_id":   "$indice_completezza",
			"total": bson.M{"$sum": 1},
		},
		},
		{"$sort": bson.M{"total": -1}},
	})
	iter := pipe.Iter()
	err := iter.All(&results)
	if err != nil {
		ErrorLogger.Println("querying mongo", err)
		return incomes.TBItem{}
	}
	if len(results) == 0 {
		stracer.Traceln("empty results from mongo")
		return incomes.TBItem{}
	}
	puntiWg1 := []interface{}{
		incomes.TBPolarPoint{ID: "0", Value: float64(results[0]["total"].(int)), Category: "Ignota"},
		incomes.TBPolarPoint{ID: "1", Value: 33, Category: "Insufficiente"},
		incomes.TBPolarPoint{ID: "2", Value: 60, Category: "Bassa"},
		incomes.TBPolarPoint{ID: "3", Value: 20, Category: "Bene"},
		incomes.TBPolarPoint{ID: "4", Value: 20, Category: "Ottima"},
	}
	return incomes.TBItem{
		ID:   "44444",
		Tip:  "Auto",
		Data: puntiWg1,
	}
}

func makeMediaReddito(query map[string]string, coll *mgo.Collection) incomes.TBItem {
	results := []bson.M{}
	err := coll.Find(assembleMatch(query)).All(&results)
	if err != nil {
		ErrorLogger.Println("querying mongo", err)
		return incomes.TBItem{}
	}
	if len(results) == 0 {
		return incomes.TBItem{}
	}
	var mean, sum float64
	total := len(results)
	for _, e := range results {
		sum += e["totale_730"].(float64)
	}
	if total > 0 {
		mean = sum / float64(total)
	}
	data := map[string]float64{"value": mean}
	return incomes.TBItem{
		ID:   "17",
		Tip:  "Reddito medio",
		Data: data,
	}
}

// initQuery checks if query is empty and populates
// it with default values otherway.
func initQuery(q map[string]string) bool {
	if len(q) == 0 {
		q["anno_dichiarazione"] = "2014"
		stracer.Traceln("empty query modified:", q)
		return true
	}
	return false
}

func decodeBody(r *http.Request, v interface{}) error {
	defer r.Body.Close()
	//b, _ := ioutil.ReadAll(r.Body)
	//stracer.Traceln(string(b))
	return json.NewDecoder(r.Body).Decode(v)
}

// @Title Test dashboard
// @Description Un endpoint per testare il funzionamento di TB
// @Accept json
// @Param kind query string true "Un parametro"
// @Param kind2 query string true "Un altro parametro"
// @Success 200 {object} incomes.TBDashTest
// @Failure 401 {object} string "Access denied"
// @Failure 404 {object} string "Not Found"
// @Failure 500 {object} string "Mhm, something went wrong"
// @Resource /tdb
// @Router /api/tdb/test [get]
func TadaBoardHandlerTest(w http.ResponseWriter, r *http.Request) {
	sessionInterface, ok := httph.SharedData.Get(r, httph.MongoSession)
	if !ok {
		ErrorLogger.Println("cannot find a db session")
		http.Error(w, http.StatusText(http.StatusServiceUnavailable), http.StatusServiceUnavailable)
		return
	}
	session := sessionInterface.(*mgo.Session)
	coll := session.DB(incomes.DeclarationsDb).C(incomes.DeclarationsColl)

	// FIXME can be eliminated if not used
	err := r.ParseForm()
	if err != nil {
		ErrorLogger.Println("decoding parameters in url", err)
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}
	stracer.Traceln("query elems:", r.Form)

	tbReq := incomes.TBReq{}
	decodeBody(r, &tbReq)
	stracer.Tracef("decoded tbreq: %+v\n", tbReq)

	retQuery := make(map[string]string)
	if initQuery(tbReq.Query) {
		// Select default year when TB is loaded for the first time.
		retQuery = tbReq.Query
	}

	stracer.Traceln("returning:", retQuery)
	result := &incomes.TBDashTest{
		Timestamp: time.Now().Unix(),
		Query:     retQuery,
		Items: []incomes.TBItem{
			makeAnnoList(coll),
			makeIncaricoList(coll),
			makeGruppoList(coll),
			makeCompletezzaPie(tbReq.Query, coll),
			makeMediaReddito(tbReq.Query, coll),
		},
	}

	httph.HeaderJSON(w)
	err = json.NewEncoder(w).Encode(result)
	if err != nil {
		ErrorLogger.Println("encoding data", err)
		status := http.StatusInternalServerError
		http.Error(w, http.StatusText(status), status)
		return
	}
	stracer.Tracef("returned data: %+v", result)
}
