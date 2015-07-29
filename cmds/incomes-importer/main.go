// Import data from Google docs to MongoDB.
// Usage example:
//	incomes-importer -client-secret XXXX
// where client-secret is taken following https://developers.google.com/drive/web/auth/web-client
//
// Warning
//
// Data structure changed from declarations with name starting with "N".
//
// NOTE Official APIs don't support spreadsheets with multiple sheets.
// Use "gid" parameter to get different tabs into same spreadsheet:
// 	wget -O test.csv https://docs.google.com/spreadsheets/d/1FEZwQG92U89IMydBhP6aFzCadNk2GgGW_OIcD2PWIx4/export?format=csv&gid=11
package main

import (
	"errors"
	"flag"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"sync"

	"bufio"

	incomes "bitbucket.org/eraclitux/op-incomes"
	"code.google.com/p/goauth2/oauth"
	"github.com/eraclitux/stracer"
	drive "google.golang.org/api/drive/v2"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

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

func getNamesFromNote(field string) (name, surname string) {
	v := strings.Split(field, " ")
	name = v[1]
	surname = v[0]
	return
}

func getDichiarazioneFromNote(field string) bool {
	y := regexp.MustCompile("SI")
	return y.MatchString(field)
}

func getDichiarazioneConiuge(field string) bool {
	y := regexp.MustCompile("SI")
	return y.MatchString(field)
}

func ParseNoteFile(exportUrl string, year int, mSession *mgo.Session) (er error) {
	defer func() {
		if r := recover(); r != nil {
			log.Println("[ERROR] Fatal error in ParseNotes", r)
			er = r.(error)
		}
	}()
	session := mSession.Copy()
	defer session.Close()
	coll := session.DB(incomes.DeclarationsDb).C(incomes.ParliamentariansCollection)

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
		values := strings.Split(line, ",")
		stracer.Traceln("splitted line", values)
		n, s := getNamesFromNote(values[0])
		sQuery := bson.M{"nome": n, "cognome": s, "anno_dichiarazione": year}
		uQuery := bson.M{"$set": bson.M{
			"dichiarazione_elettorale": getDichiarazioneFromNote(values[1]),
			"documenti_appello":        values[2],
			"dichiarazione_coniuge":    getDichiarazioneConiuge(values[3]),
			"modello_redditi":          values[4],
			"quadri_presentati":        values[5],
			"dichiarazioni_incomplete": values[6],
			"note": values[7],
		},
		}
		err = coll.Update(sQuery, uQuery)
		if err != nil {
			log.Println("[ERROR] updating notes in declaration:", n, s, year, err)
		}
	}
	if err := scanner.Err(); err != nil {
		return err
	}
	return nil
}

// ParseInfo parses data from "Dichiarante" sheet.
// Official API doesn't support multi sheet download so we
// manually add "&gid=11"
func ParseInfo(p *incomes.Declaration, exportUrl string) (er error) {
	defer func() {
		if r := recover(); r != nil {
			log.Println("[ERROR] Fatal error in ParseInfo", r)
			er = r.(error)
		}
	}()
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
				log.Println("[ERROR] parsing date in line:", line, "for:", p, "today date it will be set.")
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
func ParseVociReddito(p *incomes.Declaration, exportUrl string) (er error) {
	defer func() {
		if r := recover(); r != nil {
			log.Println("[ERROR] Fatal error in ParseVociReddito", r)
			er = r.(error)
		}
	}()
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
		// Jump invalid lines.
		if i == 0 || i == 6 {
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

func ParseBeniImmobili(p *incomes.Declaration, exportUrl string) (er error) {
	defer func() {
		if r := recover(); r != nil {
			log.Println("[ERROR] Fatal error in ParseBeniImmobili", r)
			er = r.(error)
		}
	}()
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
		line = SanitizeString(line)
		line = SanitizeFloat(line)
		fields := strings.Split(line, ",")
		var bene incomes.BeneImmobile
		// Data format has changed, fields were added.
		if len(fields) == 6 {
			bene = incomes.BeneImmobile{
				Persona:     fields[0],
				Diritto:     fields[1],
				Descrizione: fields[2],
				Provincia:   fields[3],
				Comune:      fields[4],
				Annotazioni: fields[5],
			}
		} else {
			// New format has 8 fields
			bene = incomes.BeneImmobile{
				Persona:            fields[0],
				Diritto:            fields[1],
				Descrizione:        fields[2],
				Provincia:          fields[3],
				Comune:             fields[4],
				RenditaCatastale:   incomes.ParseFloat(fields[5]),
				CategoriaCatastale: fields[6],
				Annotazioni:        fields[7],
			}
		}
		beni = append(beni, bene)
		i++
	}
	p.BeniImmobili = beni
	return nil
}

func ParseBeniMobili(p *incomes.Declaration, exportUrl string) (er error) {
	defer func() {
		if r := recover(); r != nil {
			log.Println("[ERROR] Fatal error in ParseBeniMobili", r)
			er = r.(error)
		}
	}()
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
		line = SanitizeString(line)
		fields := strings.Split(line, ",")
		year, err := incomes.Atoi(fields[3])
		if err != nil {
			log.Println("[ERROR] converting to int 'AnnoImmatricolazione' for", p, err, "it will be zero.")
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

func ParsePartecipazioni(p *incomes.Declaration, exportUrl string) (er error) {
	defer func() {
		if r := recover(); r != nil {
			log.Println("[ERROR] Fatal error in ParsePartecipazioni", r)
			er = r.(error)
		}
	}()
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
		line = SanitizeString(line)
		line = SanitizeFloat(line)
		fields := strings.Split(line, ",")
		var ruolo incomes.Partecipazione
		// Data format has changed, fields were added.
		if len(fields) < 7 {
			ruolo = incomes.Partecipazione{
				Sede:          incomes.Sede{CittaSede: fields[2], ProvinciaSede: fields[3]},
				Persona:       fields[0],
				Denominazione: fields[1],
				NumeroQuote:   fields[4],
				Annotazioni:   fields[5],
			}
		} else {
			// New format has 8 fields
			ruolo = incomes.Partecipazione{
				Sede:            incomes.Sede{CittaSede: fields[2], ProvinciaSede: fields[3]},
				Persona:         fields[0],
				Denominazione:   fields[1],
				NumeroQuote:     fields[4],
				ValoreEconomico: incomes.ParseFloat(fields[5]),
				Annotazioni:     fields[6],
			}
		}
		ruoli = append(ruoli, ruolo)
		i++
	}
	p.Partecipazioni = ruoli
	return nil
}

func ParseAmmministrazioni(p *incomes.Declaration, exportUrl string) (er error) {
	defer func() {
		if r := recover(); r != nil {
			log.Println("[ERROR] Fatal error in ParseAmmministrazioni", r)
			er = r.(error)
		}
	}()
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

func ParseContributiElettorali(p *incomes.Declaration, exportUrl string) (er error) {
	defer func() {
		if r := recover(); r != nil {
			log.Println("[ERROR] Fatal error in ParseContributiElettorali", r)
			er = r.(error)
		}
	}()
	voci := make([]incomes.Contributo, 0, 5)
	url := exportUrl + "&gid=7"
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
		line = SanitizeFloat(line)
		fields := strings.Split(line, ",")
		// Skip empty lines
		if fields[0] == "" {
			i++
			continue
		}
		if fields[0] == "TOTALE" {
			i++
			p.TotaleContributiElettorali = incomes.ParseFloat(fields[3])
			break
		}
		year, err := incomes.Atoi(fields[2])
		if err != nil {
			log.Println("[ERROR] converting to int 'Anno' for", p, err, "it will be zero.")
		}
		voce := incomes.Contributo{
			Fonte:        fields[0],
			TipoElezione: fields[1],
			Anno:         year,
			Importo:      incomes.ParseFloat(fields[3]),
		}
		voci = append(voci, voce)
		i++
	}
	p.ContributiElettorali = voci
	return nil
}

func ParseSpeseElettorali(p *incomes.Declaration, exportUrl string) (er error) {
	defer func() {
		if r := recover(); r != nil {
			log.Println("[ERROR] Fatal error in ParseSpeseElettorali", r)
			er = r.(error)
		}
	}()
	voci := make([]incomes.Contributo, 0, 5)
	url := exportUrl + "&gid=8"
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	scanner := bufio.NewScanner(resp.Body)
	i := 0
	for scanner.Scan() {
		// Jump invalid lines.
		if i <= 1 {
			i++
			continue
		}
		line := scanner.Text()
		line = SanitizeFloat(line)
		fields := strings.Split(line, ",")
		// Skip empty lines
		if fields[0] == "" {
			i++
			continue
		}
		if fields[0] == "TOTALE PARZIALE" {
			i++
			continue
		}
		if fields[0] == "Quota forfettaria spese" {
			i++
			p.QuotaForfettariaSpese = incomes.ParseFloat(fields[3])
			continue
		}
		if fields[0] == "TOTALE GENERALE" {
			i++
			p.TotaleSpeseElettorali = incomes.ParseFloat(fields[3])
			break
		}
		year, err := incomes.Atoi(fields[2])
		if err != nil {
			log.Println("[ERROR] converting to int 'Anno' for", p, err, "it will be zero.")
		}
		voce := incomes.Contributo{
			Fonte:        fields[0],
			TipoElezione: fields[1],
			Anno:         year,
			Importo:      incomes.ParseFloat(fields[3]),
		}
		voci = append(voci, voce)
		i++
	}
	p.SpeseElettorali = voci
	return nil
}

func DownloadAndParseDeclaration(file *drive.File) (poli incomes.Declaration, er error) {
	defer func() {
		if r := recover(); r != nil {
			log.Println("[ERROR] Fatal error", r)
			er = errors.New("Fatal error parsing")
		}
	}()
	// XXX It seems that once read value are zeroed O.o
	fileName := file.Title
	exportUrl := file.ExportLinks["text/csv"]
	politician := incomes.Declaration{}
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
	err = ParseContributiElettorali(&politician, exportUrl)
	if err != nil {
		return politician, err
	}
	err = ParseSpeseElettorali(&politician, exportUrl)
	if err != nil {
		return politician, err
	}
	return politician, nil
}

func getNotesYear(fName string) (int, error) {
	s := strings.Split(fName, "_")[1]
	i, err := strconv.Atoi(s)
	if err != nil {
		return 0, err
	}
	return i, nil
}

func DownloadAndParseNote(file *drive.File, session *mgo.Session) (er error) {
	defer func() {
		if r := recover(); r != nil {
			log.Println("[ERROR] Fatal error", r)
			er = errors.New("error parsing notes")
		}
	}()
	// XXX It seems that once read value are zeroed O.o
	fileName := file.Title
	year, err := getNotesYear(fileName)
	if err != nil {
		return err
	}
	exportUrl := file.ExportLinks["text/csv"]
	err = ParseNoteFile(exportUrl, year, session)
	if err != nil {
		return err
	}
	return
}

func GetFilesFromDrive(d *drive.Service) ([]*drive.File, error) {
	var fs []*drive.File
	pageToken := ""
	for {
		q := d.Files.List()
		q.Corpus("DOMAIN")
		// If we have a pageToken set, apply it to the query
		if pageToken != "" {
			stracer.Traceln("pageToken:", pageToken)
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
	stracer.Traceln("Number of files to retrieve:", len(fs))
	return fs, nil
}

// SendToMongo insert a single Declaration{} into db.
func SendToMongo(mSession *mgo.Session, p incomes.Declaration) {
	session := mSession.Copy()
	defer session.Close()
	coll := session.DB(incomes.DeclarationsDb).C(incomes.ParliamentariansCollection)
	err := coll.Insert(p)
	if err != nil {
		log.Println("Error inserting", p, "into MongoDB:", err)
		return
	}
	log.Println(p, "sended to Mongo.")
}

func dNameIsValid(title string) bool {
	if strings.HasPrefix(title, "Note") {
		return true
	}
	if strings.HasPrefix(title, "Master") {
		return true
	}
	return false
}

func NoteNameIsValid(title string) bool {
	if !strings.HasPrefix(title, "Note") {
		return false
	}
	return true
}

func ParseDeclarations(files []*drive.File, session *mgo.Session) {
	for _, f := range files {
		log.Println("Parsing:", f.Title)
		if dNameIsValid(f.Title) {
			continue
		}
		politician, err := DownloadAndParseDeclaration(f)
		if err != nil {
			log.Println("[ERROR] parsing", politician, err)
			continue
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

func ParseNotes(files []*drive.File, session *mgo.Session) {
	for _, f := range files {
		log.Println("Parsing:", f.Title)
		if !NoteNameIsValid(f.Title) {
			continue
		}
		err := DownloadAndParseNote(f, session)
		if err != nil {
			log.Println("[ERROR] parsing notes", err)
			continue
		}
	}
}

func main() {
	var pKeyFlag, mongoHost string
	var parseNotes bool
	flag.StringVar(&pKeyFlag, "client-secret", "", "API Client secret")
	flag.StringVar(&mongoHost, "mongo-host", "localhost", "MongoDB address")
	flag.BoolVar(&parseNotes, "parse-notes", false, "Parse notes file (instead of declarations)")
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
	files, _ := GetFilesFromDrive(service)
	if parseNotes {
		log.Println("Preparing for note parsing")
		ParseNotes(files, session)
	} else {
		ParseDeclarations(files, session)
	}
}
