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

func makeProfessioneList(coll *mgo.Collection) incomes.TBItem {
	data := make([]interface{}, 0)
	results := []bson.M{}
	pipe := coll.Pipe([]bson.M{
		{"$group": bson.M{
			"_id": "$professione",
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
		name := e["_id"].(string)
		data = append(data, map[string]string{"id": name, "label": name})
	}
	return incomes.TBItem{
		ID:   "11",
		Tip:  "Professione",
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

func makeSessoList() incomes.TBItem {
	data := make([]interface{}, 0)
	data = append(data, map[string]string{"id": "m", "label": "Uomo"})
	data = append(data, map[string]string{"id": "f", "label": "Donna"})
	return incomes.TBItem{
		ID:   "12",
		Tip:  "Sesso",
		Data: data,
	}
}

func makeCompletezzaPie(match bson.M, coll *mgo.Collection) incomes.TBItem {
	results := []bson.M{}
	pipe := coll.Pipe([]bson.M{
		{"$match": match},
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

func makeRedditoMeanBar(match bson.M, coll *mgo.Collection) incomes.TBItem {
	results := []bson.M{}
	punti := make([]interface{}, 0, 14)
	pipe := coll.Pipe([]bson.M{
		{"$match": match},
		{"$group": bson.M{
			"_id":   "$gruppo.acronym",
			"total": bson.M{"$sum": 1},
			"sum":   bson.M{"$sum": "$totale_730"},
			"name":  bson.M{"$last": "$gruppo.name"},
		},
		},
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
	for _, v := range results {
		m := map[string]interface{}{}
		m["id"] = v["_id"]
		m["x"] = v["_id"]
		// total cannot be zero, right? :)
		mean := v["sum"].(float64) / float64(v["total"].(int))
		m["y"] = mean
		m["category"] = v["name"]
		punti = append(punti, m)
	}
	return incomes.TBItem{
		ID:   "15",
		Tip:  "Valori di reddito medio per ogni gruppo parlamentare",
		Data: punti,
	}
}

func makeAutomobiliMean(match bson.M, coll *mgo.Collection) incomes.TBItem {
	results := []bson.M{}
	pipe := coll.Pipe([]bson.M{
		{"$match": match},
		{"$unwind": "$beni_mobili"},
		{"$group": bson.M{
			//"_id":   "$beni_mobili.tipologia",
			"_id":   "$op_id",
			"total": bson.M{"$sum": 1},
		},
		},
	})
	iter := pipe.Iter()
	err := iter.All(&results)
	if err != nil {
		ErrorLogger.Println("querying mongo", err)
		return incomes.TBItem{}
	}
	if len(results) == 0 {
		return incomes.TBItem{}
	}
	var mean float64
	var sum int
	total := len(results)
	// This summs all, "motocicli, imbarcazioni etc"
	for _, e := range results {
		sum += e["total"].(int)
	}
	if total > 0 {
		mean = float64(sum) / float64(total)
	}
	data := map[string]float64{"value": mean}
	return incomes.TBItem{
		ID:   "20",
		Tip:  "Media automobili",
		Data: data,
	}
}

func makeImmobiliMean(match bson.M, coll *mgo.Collection) incomes.TBItem {
	results := []bson.M{}
	pipe := coll.Pipe([]bson.M{
		{"$match": match},
		{"$unwind": "$beni_immobili"},
		{"$match": bson.M{"beni_immobili.descrizione": "fabbricato"}},
		{"$group": bson.M{
			"_id":   "$op_id",
			"total": bson.M{"$sum": 1},
		},
		},
	})
	iter := pipe.Iter()
	err := iter.All(&results)
	if err != nil {
		ErrorLogger.Println("querying mongo", err)
		return incomes.TBItem{}
	}
	if len(results) == 0 {
		return incomes.TBItem{}
	}
	var mean float64
	var sum int
	total := len(results)
	for _, e := range results {
		sum += e["total"].(int)
	}
	if total > 0 {
		mean = float64(sum) / float64(total)
	}
	data := map[string]float64{"value": mean}
	return incomes.TBItem{
		ID:   "19",
		Tip:  "Media immobili",
		Data: data,
	}
}

func makeRedditoMean(match bson.M, coll *mgo.Collection) incomes.TBItem {
	results := []bson.M{}
	err := coll.Find(match).All(&results)
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
		q = make(map[string]string)
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

	match := assembleMatch(tbReq.Query)

	stracer.Traceln("returning:", retQuery)
	result := &incomes.TBDashTest{
		Timestamp: time.Now().Unix(),
		Query:     retQuery,
		Items: []incomes.TBItem{
			makeAnnoList(coll),
			makeIncaricoList(coll),
			makeGruppoList(coll),
			makeProfessioneList(coll),
			makeSessoList(),
			makeCompletezzaPie(match, coll),
			makeRedditoMean(match, coll),
			makeAutomobiliMean(match, coll),
			makeImmobiliMean(match, coll),
			makeRedditoMeanBar(match, coll),
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
