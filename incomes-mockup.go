package main

import (
	"fmt"
	"log"

	"bitbucket.org/eraclitux/openpolis/incomes"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func main() {
	// Main session, use Copy() to use it aronud.
	session, err := mgo.Dial("mongo30")
	if err != nil {
		log.Fatal(err)
	}
	defer session.Close()
	coll := session.DB("testing").C("test")
	// Create a politician
	exps := make([]incomes.SpesaElettorale, 0)
	exp := incomes.SpesaElettorale{"biglietti da visità", "camera", 10}
	exps = append(exps, exp)
	notes := []string{"una nota", "due note"}
	mystruct := incomes.Politician{
		ComuneNascita: "Pisa",
		//OpId:          213,
		DichiarazioneElettorale: true,
		SpeseElettorali:         exps,
		Note:                    notes,
	}
	err = coll.Insert(mystruct)
	if err != nil {
		log.Fatal(err)
	}

	// Add an element to an array field
	exp = incomes.SpesaElettorale{"spese pazzè", "camera", 19000}
	err = coll.Update(bson.M{"op-id": 214}, bson.M{"$push": bson.M{"spese-elettorali": exp}})
	if err != nil {
		fmt.Println(err)
	}

	// Remove an element to an array field
	exp = incomes.SpesaElettorale{"spese pazzè", "camera", 19000}
	err = coll.Update(bson.M{"op-id": 213}, bson.M{"$pull": bson.M{"spese-elettorali": exp}})
	if err != nil {
		fmt.Println(err)
	}

	// Retrieve politicians and put into Politician{}
	results := []incomes.Politician{}
	err = coll.Find(bson.M{"dichiarazione-elettorale": true}).All(&results)
	if err != nil {
		log.Fatal(err)
	}
	for _, v := range results {
		fmt.Println("result:", v)
	}

	// Retrieve all fields
	mgoRes := bson.M{}
	iter := coll.Find(nil).Iter()
	for iter.Next(&mgoRes) {
		fmt.Println("Result:", mgoRes["_id"])
	}
	if err := iter.Close(); err != nil {
		log.Fatal(err)
	}

	// Add/remove a field to all docs.
	// This only works with update operators: http://docs.mongodb.org/manual/reference/operator/update/
	_, err = coll.UpdateAll(nil, bson.M{"$unset": bson.M{"key": ""}})
	if err != nil {
		fmt.Println(err)
	}
}
