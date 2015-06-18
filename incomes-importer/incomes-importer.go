// Import data from Google docs to MongoDB.
package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"sync"

	"bufio"

	"bitbucket.org/eraclitux/openpolis/incomes"
	"code.google.com/p/goauth2/oauth"
	"github.com/eraclitux/stracer"
	drive "google.golang.org/api/drive/v2"
	"gopkg.in/mgo.v2"
)

// NOTE Use "gid" parameter to get different tabs into same spreadsheet:
// wget -O test.csv https://docs.google.com/spreadsheets/d/1FEZwQG92U89IMydBhP6aFzCadNk2GgGW_OIcD2PWIx4/export?format=csv&gid=11

// Get only files into 'Dichiarazioni' dir.
const queryString = `'0ByZ65N5BuOCtflhXT1psaDFQTkdTSjVOV2pDb3pCbTM5dFd6SkxKSGUwZl8tYWM0bExJc3c' in parents`

var wg sync.WaitGroup

var config = &oauth.Config{
	ClientId:     "106955451643-c82ao8ihbtslp7h08k7ujjrktvu0grun.apps.googleusercontent.com",
	ClientSecret: "",
	Scope:        "https://www.googleapis.com/auth/drive",
	RedirectURL:  "urn:ietf:wg:oauth:2.0:oob",
	AuthURL:      "https://accounts.google.com/o/oauth2/auth",
	TokenURL:     "https://accounts.google.com/o/oauth2/token",
}

// SanitizeFloat parse lines form GDocs csv
// converting float number in a format understandable by
// strconv.ParseFloat() and that is not problematic
// when spitting on commas.
// "12.000,00" --> 12000.00
func SanitizeFloat(line string) string {
	// "12.000,00" --> "12000,00"
	reDot := regexp.MustCompile("([0-9]+)\\.([0-9]+)")
	line = reDot.ReplaceAllString(line, "$1$2")
	// "12000,00" --> "12000.00"
	reComma := regexp.MustCompile("(\"[0-9]+),([0-9]+\")")
	line = reComma.ReplaceAllString(line, "$1.$2")
	// "12000,00" --> 12000.00
	return strings.Replace(line, `"`, ``, -1)

}

// ParseTitle extract Opid Surname and year of declaration
// out of file name.
func ParseTitle(p *incomes.Politician, title string) error {
	values := strings.Split(title, "_")
	p.OpId = values[0]
	p.Cognome = values[2]
	year, err := strconv.Atoi(values[1])
	if err != nil {
		return err
	}
	p.AnnoDichiarazione = year
	return nil
}

// ParseInfo parses data from "Dichiarante" sheet.
// Official API doesn't support multi sheet download so we
// manually add "&gid=11"
func ParseInfo(p *incomes.Politician, exportUrl string) error {
	url := exportUrl + "&gid=11"
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	i := 0
	defer resp.Body.Close()
	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		// Jump first line.
		if i == 0 {
			i++
			continue
		}
		line := scanner.Text()
		values := strings.Split(line, ",")
		switch i {
		case 1:
			p.Cognome = values[1]
		case 2:
			p.Nome = values[1]
		case 3:
			date, err := incomes.ParseDate(values[1])
			if err != nil {
				log.Println("[ERROR] parsing date in line:", line, "for:", p, "today date will be set.")
				stracer.Tracef("invalid value \"%s\"\n", values[1])
			}
			p.DataNascita = date
		case 4:
			p.StatoCivile = values[1]
		case 5:
			p.ComuneNascita, p.ProvinciaNascita = incomes.ExtractDistrict(values[1])
		case 6:
			p.ComuneResidenza, p.ProvinciaResidenza = incomes.ExtractDistrict(values[1])
		}
		i++
	}
	if err := scanner.Err(); err != nil {
		return err
	}
	return nil
}

// ParseVociReddito create diffent entries for "VociReddito".
// Official API doesn't support multi sheet download so we
// manually add "&gid=11"
func ParseVociReddito(p *incomes.Politician, exportUrl string) error {
	redditi := make([]incomes.VoceReddito, 0, 5)
	url := exportUrl + "&gid=0"
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	scanner := bufio.NewScanner(resp.Body)
	i := 0
	for scanner.Scan() {
		// Jump first line.
		if i == 0 {
			i++
			continue
		}
		line := scanner.Text()
		line = SanitizeFloat(line)
		fields := strings.Split(line, ",")
		if i == 7 {
			p.TotaleVociRedditoDichiarante = incomes.ParseFloat(fields[1])
			p.TotaleVociRedditoConiuge = incomes.ParseFloat(fields[2])
			p.TotaleVociReddito = incomes.ParseFloat(fields[3])
			break
		}
		dichiarante := incomes.ParseFloat(fields[1])
		coniuge := incomes.ParseFloat(fields[2])
		totale := incomes.ParseFloat(fields[3])
		voceReddito := incomes.VoceReddito{
			Voce:        fields[0],
			Dichiarante: dichiarante,
			Coniuge:     coniuge,
			Totale:      totale,
		}
		redditi = append(redditi, voceReddito)
		i++
	}
	if err := scanner.Err(); err != nil {
		return err
	}
	p.VociReddito = redditi
	return nil
}

func ParseBeniImmobili(p *incomes.Politician, exportUrl string) error {
	beni := make([]incomes.BeneImmobile, 0, 5)
	url := exportUrl + "&gid=1"
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	scanner := bufio.NewScanner(resp.Body)
	i := 0
	for scanner.Scan() {
		// Jump first lines.
		if i <= 1 {
			i++
			continue
		}
		line := scanner.Text()
		fields := strings.Split(line, ",")
		bene := incomes.BeneImmobile{
			Persona:     fields[0],
			Diritto:     fields[1],
			Descrizione: fields[2],
			Provincia:   fields[3],
			Comune:      fields[4],
			Annotazioni: fields[5],
		}
		beni = append(beni, bene)
		i++
	}
	p.BeniImmobili = beni
	return nil
}

func ParseBeniMobili(p *incomes.Politician, exportUrl string) error {
	beni := make([]incomes.BeneMobile, 0, 5)
	url := exportUrl + "&gid=2"
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	scanner := bufio.NewScanner(resp.Body)
	i := 0
	for scanner.Scan() {
		// Jump first lines.
		if i <= 1 {
			i++
			continue
		}
		line := scanner.Text()
		fields := strings.Split(line, ",")
		year, err := incomes.Atoi(fields[3])
		if err != nil {
			log.Println("[ERROR] converting to int 'AnnoImmatricolazione' for", p, err, "will be zero.")
		}
		bene := incomes.BeneMobile{
			Persona:              fields[0],
			Tipologia:            fields[1],
			CavalliFiscali:       fields[2],
			AnnoImmatricolazione: year,
			Annotazioni:          fields[4],
		}
		beni = append(beni, bene)
		i++
	}
	p.BeniMobili = beni
	return nil
}

func ParsePartecipazioni(p *incomes.Politician, exportUrl string) error {
	ruoli := make([]incomes.Partecipazione, 0, 5)
	url := exportUrl + "&gid=3"
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	scanner := bufio.NewScanner(resp.Body)
	i := 0
	for scanner.Scan() {
		// Jump first lines.
		if i <= 1 {
			i++
			continue
		}
		line := scanner.Text()
		fields := strings.Split(line, ",")
		ruolo := incomes.Partecipazione{
			Sede:          incomes.Sede{CittaSede: fields[2], ProvinciaSede: fields[3]},
			Persona:       fields[0],
			Denominazione: fields[1],
			NumeroQuote:   fields[4],
			Annotazioni:   fields[5],
		}
		ruoli = append(ruoli, ruolo)
		i++
	}
	p.Partecipazioni = ruoli
	return nil
}

func ParseAmmministrazioni(p *incomes.Politician, exportUrl string) error {
	ruoli := make([]incomes.Ruolo, 0, 5)
	url := exportUrl + "&gid=4"
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	scanner := bufio.NewScanner(resp.Body)
	i := 0
	for scanner.Scan() {
		// Jump first lines.
		if i <= 1 {
			i++
			continue
		}
		line := scanner.Text()
		fields := strings.Split(line, ",")
		ruolo := incomes.Ruolo{
			Sede:           incomes.Sede{CittaSede: fields[2], ProvinciaSede: fields[3]},
			Persona:        fields[0],
			Denominazione:  fields[1],
			NaturaIncarico: fields[4],
			Annotazioni:    fields[5],
		}
		ruoli = append(ruoli, ruolo)
		i++
	}
	p.Amministrazioni = ruoli
	return nil
}

func DownloadAndParsePolitician(file *drive.File) (incomes.Politician, error) {
	// XXX It seems that once read value are zeroed O.o
	fileName := file.Title
	exportUrl := file.ExportLinks["text/csv"]
	stracer.Traceln("Parsing:", fileName, exportUrl)
	politician := incomes.Politician{}
	err := ParseTitle(&politician, fileName)
	if err != nil {
		return politician, err
	}
	err = ParseInfo(&politician, exportUrl)
	if err != nil {
		return politician, err
	}
	err = ParseVociReddito(&politician, exportUrl)
	if err != nil {
		return politician, err
	}
	err = ParseBeniImmobili(&politician, exportUrl)
	if err != nil {
		return politician, err
	}
	err = ParseBeniMobili(&politician, exportUrl)
	if err != nil {
		return politician, err
	}
	err = ParsePartecipazioni(&politician, exportUrl)
	if err != nil {
		return politician, err
	}
	err = ParseAmmministrazioni(&politician, exportUrl)
	if err != nil {
		return politician, err
	}
	return politician, nil
}

func GetDeclarations(d *drive.Service) ([]*drive.File, error) {
	var fs []*drive.File
	pageToken := ""
	for {
		q := d.Files.List()
		// If we have a pageToken set, apply it to the query
		if pageToken != "" {
			q = q.PageToken(pageToken)
		}
		q.Q(queryString)
		r, err := q.Do()
		if err != nil {
			return fs, err
		}
		fs = append(fs, r.Items...)
		pageToken = r.NextPageToken
		if pageToken == "" {
			break
		}
	}
	return fs, nil
}

// SendToMongo insert a single Politician{} into db.
func SendToMongo(mSession *mgo.Session, p incomes.Politician) {
	session := mSession.Copy()
	defer session.Close()
	coll := session.DB("dossier_incomes").C("parlamentari")
	err := coll.Insert(p)
	if err != nil {
		log.Println("Error inserting", p, "into MongoDB:", err)
		return
	}
	log.Println(p, "sended to Mongo.")
}

func fileIsInvalid(title string) bool {
	if strings.HasPrefix(title, "Note") {
		return true
	}
	if strings.HasPrefix(title, "Master") {
		return true
	}
	return false
}

func main() {
	var pKeyFlag, mongoHost string
	flag.StringVar(&pKeyFlag, "client-secret", "", "API Client secret")
	flag.StringVar(&mongoHost, "mongo-host", "mongo30", "MongoDB address")
	flag.Parse()
	if flag.NFlag() == 0 {
		log.Fatal("client-secret is mandatory")
	}
	config.ClientSecret = pKeyFlag
	session, err := mgo.Dial(mongoHost)
	if err != nil {
		log.Fatal(err)
	}
	defer session.Close()

	// Generate a URL to visit for authorization.
	authUrl := config.AuthCodeURL("state")
	log.Printf("Go to the following link in your browser: %v\n", authUrl)
	t := &oauth.Transport{
		Config:    config,
		Transport: http.DefaultTransport,
	}

	// Read the code, and exchange it for a token.
	log.Printf("Enter verification code: ")
	var code string
	fmt.Scanln(&code)
	_, err = t.Exchange(code)
	if err != nil {
		log.Fatalf("An error occurred exchanging the code: %v\n", err)
	}

	// Create a new authorized Drive client.
	service, err := drive.New(t.Client())
	if err != nil {
		log.Fatalf("An error occurred creating Drive client: %v\n", err)
	}
	files, _ := GetDeclarations(service)
	for _, f := range files[:20] {
		if fileIsInvalid(f.Title) {
			continue
		}
		politician, err := DownloadAndParsePolitician(f)
		if err != nil {
			log.Println("Error parsing", politician)
			stracer.Traceln("Error parsing Politician{}:", politician, err)
		}
		log.Println("Parsed:", politician)
		wg.Add(1)
		go func() {
			defer wg.Done()
			SendToMongo(session, politician)
		}()
	}
	wg.Wait()
}
