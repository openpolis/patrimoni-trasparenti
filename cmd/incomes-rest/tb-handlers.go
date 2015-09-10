package main

import (
	"encoding/json"
	"net/http"
	"time"

	"bitbucket.org/eraclitux/op-incomes"
	"github.com/eraclitux/httph"
	"github.com/eraclitux/stracer"
)

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

	puntiWg1 := []incomes.TBPolarPoint{
		incomes.TBPolarPoint{ID: "roma", Value: 100, Category: "Lazio"},
		incomes.TBPolarPoint{ID: "viterbo", Value: 60, Category: "Lazio"},
		incomes.TBPolarPoint{ID: "milano", Value: 20, Category: "Lombardia"},
	}
	widget1 := incomes.TBItem{
		ID:   "1",
		Tip:  "didascalia widget province",
		Data: puntiWg1,
	}
	result := &incomes.TBDashTest{
		Timestamp: time.Now().Unix(),
		Query:     map[string]string{"key": "value"},
		Item:      []incomes.TBItem{widget1},
	}

	httph.HeaderJSON(w)
	err = json.NewEncoder(w).Encode(result)
	if err != nil {
		ErrorLogger.Println("encoding data", err)
		status := http.StatusInternalServerError
		http.Error(w, http.StatusText(status), status)
		return
	}
}
