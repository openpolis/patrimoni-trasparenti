// incomes-images-resizer retrieves images, resizes them to these formats:
// these formats:
// - 165x(~228)px
// than upload them into S3.
//
// Aspect ratio is mantained on width => heigth could be != 228px
package main

import (
	"image/jpeg"
	"log"
	"net/http"

	"bitbucket.org/eraclitux/op-incomes"

	"github.com/eaigner/s3"
	"github.com/eraclitux/cfgp"
	"github.com/nfnt/resize"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

// Version is populated at compile time
// with git describe output.
var Version = "unknown-rev"
var BuildTime = "unknown-time"

type Conf struct {
	Mongohost       string
	S3PictureBucket string
	S3key           string
	S3secret        string
	Version         bool `cfgp:"v,show version and exit,"`
}

var conf Conf

func GetOpIDList(session *mgo.Session) ([]map[string]string, error) {
	s := session.Copy()
	defer s.Close()
	results := []map[string]string{}
	coll := session.DB(incomes.DeclarationsDb).C(incomes.DeclarationsColl)
	pipe := coll.Pipe([]bson.M{
		{"$group": bson.M{
			"_id":     "$op_id",
			"nome":    bson.M{"$last": "$nome"},
			"cognome": bson.M{"$last": "$cognome"},
		},
		},
	})
	iter := pipe.Iter()
	err := iter.All(&results)
	if err != nil {
		return nil, err
	}
	return results, nil
}

func GetAndUpload(list []map[string]string) error {
	s3c := &s3.S3{
		Bucket:    conf.S3PictureBucket,
		AccessKey: conf.S3key,
		Secret:    conf.S3secret,
		Path:      "big",
	}
	for _, e := range list {
		log.Println("processing:", e["_id"], e["nome"], e["cognome"])
		resp, err := http.Get("http://politici.openpolis.it/politician/picture?content_id=" + e["_id"])
		if err != nil {
			log.Println("[ERROR] in http req:", err)
			continue
		}

		// decode jpeg into image.Image
		img, err := jpeg.Decode(resp.Body)
		if err != nil {
			log.Println("[ERROR] decoding:", err)
			continue
		}

		// Adapt height to width
		m := resize.Resize(165, 0, img, resize.Lanczos3)

		// put new image into a bucket.
		obj := s3c.Object(e["_id"] + ".jpg")
		out := obj.Writer()
		err = jpeg.Encode(out, m, nil)
		if err != nil {
			out.Close()
			resp.Body.Close()
			return err
		}
		out.Close()
		resp.Body.Close()
	}
	return nil
}

func main() {
	err := cfgp.Parse(&conf)
	if err != nil {
		log.Fatalln("parsing conf", err)
	}

	if conf.Version {
		log.Fatalf("%s %s", Version, BuildTime)
	}
	mongoSession, err := mgo.Dial(conf.Mongohost)
	if err != nil {
		log.Fatal("connecting to MongoDB", err)
	}
	defer mongoSession.Close()
	list, err := GetOpIDList(mongoSession)
	if err != nil {
		log.Fatal(err)
	}
	err = GetAndUpload(list)
	if err != nil {
		log.Fatal(err)
	}
}
