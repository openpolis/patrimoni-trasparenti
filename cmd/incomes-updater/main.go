package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"bitbucket.org/eraclitux/op-incomes"

	"github.com/eraclitux/cfgp"
	"github.com/eraclitux/stracer"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// Version is populated at compile time
// with git describe output.
var Version = "unknown-rev"
var BuildTime = "unknown-time"

type daemonConf struct {
	//RemoteApi string
	Mongohost string
	LogFile   string
	Version   bool `cfgp:"v,show version and exit,"`
}

// ErrorLogger is used to log error messages.
var ErrorLogger *log.Logger

// InfoLogger is used to log general info events like access log.
var InfoLogger *log.Logger

var mSession *mgo.Session

var conf daemonConf

func SetupLoggers(o io.Writer) {
	ErrorLogger = log.New(o, "[ERROR] ", log.Ldate|log.Ltime)
	InfoLogger = log.New(o, "[INFO] ", log.Ldate|log.Ltime)
}

func PoliticiansList(mSession *mgo.Session) ([]incomes.Declaration, error) {
	session := mSession.Copy()
	defer session.Close()
	coll := session.DB(incomes.DeclarationsDb).C(incomes.DeclarationsColl)
	var results []incomes.Declaration
	// FIXME return 0 ?
	err := coll.Find(nil).Distinct("op_id", &results)
	if err != nil {
		return nil, err
	}
	n, err := coll.Find(nil).Count()
	InfoLogger.Println(len(results), n, err)
	return results, nil
}

func GetPoliticalData(opId string) incomes.PoliticalData {
	return incomes.PoliticalData{}
}

// UpdateMongo updates all declarations with a given Openpolis id
// with political data.
func UpdateMongo(opId string, d incomes.PoliticalData) error {
	session := mSession.Copy()
	defer session.Close()
	coll := session.DB(incomes.DeclarationsDb).C(incomes.DeclarationsColl)
	uQuery := bson.M{
		"$set": d,
	}
	fQuery := bson.M{"op_id": opId}
	_, err := coll.UpdateAll(fQuery, uQuery)
	if err != nil {
		ErrorLogger.Println("updating", opId, err)
		return err
	}
	InfoLogger.Println(opId, "processed")
	return nil
}

func UpdateData(r incomes.OpResponse, role string) error {
	// FIXME better way?
	for _, r := range r.Results {
		sdata := r["politician"].(map[string]interface{})
		// OpId is not present :(
		// We'll take it from image_uri
		image_uri := sdata["image_uri"].(string)
		sex := sdata["sex"].(string)
		sex = strings.ToLower(sex)
		op_id := strings.Split(image_uri, "=")[1]
		sdata = r["group"].(map[string]interface{})
		var name, acronym string
		if sdata["name"] != nil {
			name = sdata["name"].(string)
		}
		if sdata["acronym"] != nil {
			acronym = sdata["acronym"].(string)
		}
		name = strings.ToLower(name)
		acronym = strings.ToLower(acronym)
		group := incomes.Group{
			Name:    name,
			Acronym: acronym,
		}
		sdata = r["politician"].(map[string]interface{})
		// FIXME I don't like this.
		occupation := sdata["profession"].(map[string]interface{})["description"].(string)
		stracer.Traceln("op api results, op_id:", op_id, "group:", group, "occupation:", occupation, "sex:", sex)
		role = strings.ToLower(role)
		occupation = strings.ToLower(occupation)
		d := incomes.PoliticalData{
			Role:       role,
			Group:      group,
			Occupation: occupation,
			Sex:        sex,
		}
		UpdateMongo(op_id, d)
	}
	return nil
}

type data struct {
	next string
	// Counts number of pages retrieved.
	counter int
	Role    string
	Target  string
}

func (d *data) Next() bool {
	if d.next != "" {
		return true
	}
	return false
}

func (d *data) Get() error {
	var a string
	if d.next == "" {
		a = d.Target
	} else {
		a = d.next
	}
	resp, err := http.Get(a)
	r := incomes.OpResponse{}
	stracer.Traceln("target addr:", a)
	err = json.NewDecoder(resp.Body).Decode(&r)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	d.next = r.Next
	stracer.Traceln("op api next:", r.Next)
	// No error checking because one day it
	// will run in its own goroutine.
	UpdateData(r, d.Role)
	return nil
}

func updateSingle(ep string) {
	var target string
	InfoLogger.Println("retrieve data for", ep)
	switch ep {
	case "parlamentare":
		target = incomes.OpApi + "/politici/instcharges?institution_id=4&started_after=2010-01-16"
	case "senatore":
		target = incomes.OpApi + "/politici/instcharges?institution_id=5&started_after=2010-01-16"
	case "membro":
		target = incomes.OpApi + "/politici/instcharges?institution_id=3&started_after=2010-01-16"
	default:
		ErrorLogger.Println("unknown politician type", ep)
		return
	}
	data := data{
		Target: target,
		Role:   ep,
	}
	err := data.Get()
	if err != nil {
		ErrorLogger.Println("getting remote data", err)
		return
	}
	for data.Next() {
		err := data.Get()
		if err != nil {
			ErrorLogger.Println("getting remote data", err)
			return
		}
	}
}

func updateAll() {
	updateSingle("parlamentare")
	updateSingle("senatore")
	updateSingle("membro")
}

func main() {
	conf = daemonConf{
		Mongohost: "localhost",
	}
	err := cfgp.Parse(&conf)
	if err != nil {
		log.Fatalln("parsing conf", err)
	}
	if conf.Version {
		log.Fatalf("%s %s", Version, BuildTime)
	}
	if conf.LogFile != "" {
		f, err := os.OpenFile(conf.LogFile, os.O_WRONLY|os.O_APPEND|os.O_CREATE, 0644)
		if err != nil {
			log.Fatalln("opening log file:", err)
		}
		defer f.Close()
		SetupLoggers(f)
	} else {
		SetupLoggers(os.Stdout)
	}

	mSession, err = mgo.Dial(conf.Mongohost)
	if err != nil {
		ErrorLogger.Fatalln("connecting to MongoDB", err)
	}
	defer mSession.Close()
	InfoLogger.Println("connected to mongo:", conf.Mongohost)
	updateAll()
}