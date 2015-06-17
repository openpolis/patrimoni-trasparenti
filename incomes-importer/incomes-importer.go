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
	defer resp.Body.Close()
	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		fmt.Println(line)
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
		dichiarante, err := strconv.ParseFloat(fields[1], 32)
		if err != nil {
			return err
		}
		coniuge, err := strconv.ParseFloat(fields[2], 32)
		if err != nil {
			return err
		}
		totale, err := strconv.ParseFloat(fields[3], 32)
		if err != nil {
			return err
		}
		voceReddito := incomes.VoceReddito{
			Voce:        fields[0],
			Dichiarante: float32(dichiarante),
			Coniuge:     float32(coniuge),
			Totale:      float32(totale),
		}
		redditi = append(redditi, voceReddito)
		fmt.Println(fields)
		i++
		if i == 6 {
			break
		}
	}
	if err := scanner.Err(); err != nil {
		return err
	}
	p.VociReddito = redditi
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
			fmt.Printf("An error occurred: %v\n", err)
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
	for _, f := range files[:10] {
		if strings.HasPrefix(f.Title, "Note") {
			continue
		}
		politician, err := DownloadAndParsePolitician(f)
		if err != nil {
			stracer.Traceln("Error parsing Politician{}:", err)
		}
		stracer.Traceln("Parsed Politician{}:", politician)
	}
}
