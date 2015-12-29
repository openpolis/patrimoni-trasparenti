package main

import (
	"strconv"

	"github.com/eraclitux/stracer"
	"gopkg.in/mgo.v2/bson"
)

func AddYearInJSON(results []bson.M) {
	for _, roles := range results {
		rls := roles["dichiarazioni"].([]interface{})
		for _, role := range rls {
			m := role.(bson.M)
			s := m["dichiarazione"].(string)
			a := m["anno"].(int)
			m["dichiarazione"] = s + strconv.Itoa(a)
		}
	}
}

// assembleMatch create map for "$match" pipe stage for
// MongoDB aggregations.
func assembleMatch(query map[string]string) bson.M {
	match := bson.M{}
	for k, v := range query {
		if v == "" {
			continue
		}
		if k == "anno_dichiarazione" {
			match[k], _ = strconv.Atoi(v)
			continue
		}
		if k == "acronimo_gruppo" {
			match["gruppo.acronym"] = v
			continue
		}
		if k == "anno" {
			match["anno_dichiarazione"], _ = strconv.Atoi(v)
			continue
		}
		if k == "gruppo" {
			match["incarichi.gruppo.acronym"] = v
			continue
		}
		if k == "circoscrizione" {
			match["incarichi.circoscrizione"] = v
			continue
		}
		if k == "organo" {
			match["incarichi.istituzione"] = v
			continue
		}
	}
	stracer.Traceln("match assembled:", match)
	return match
}
