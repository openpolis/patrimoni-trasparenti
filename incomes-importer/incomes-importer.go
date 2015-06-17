// Import data from Google docs to MongoDB.
package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"code.google.com/p/goauth2/oauth"
	drive "google.golang.org/api/drive/v2"
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

func DownloadFile(file drive.File) (string, error) {
	resp, err := http.Get(file.ExportLinks["text/csv"])
	if err != nil {
		fmt.Printf("An error occurred: %v\n", err)
		return "", err
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("An error occurred: %v\n", err)
		return "", err
	}
	fmt.Println(string(body))
	return string(body), nil

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
	var pKeyFlag string
	flag.StringVar(&pKeyFlag, "client-secret", "", "API Client secret")
	flag.Parse()
	if flag.NFlag() == 0 {
		flag.Usage()
		os.Exit(2)
	}
	config.ClientSecret = pKeyFlag

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
	_, err := t.Exchange(code)
	if err != nil {
		log.Fatalf("An error occurred exchanging the code: %v\n", err)
	}

	// Create a new authorized Drive client.
	service, err := drive.New(t.Client())
	if err != nil {
		log.Fatalf("An error occurred creating Drive client: %v\n", err)
	}
	files, _ := GetDeclarations(service)
	for _, f := range files {
		fmt.Println(f.Title, f.ExportLinks["text/csv"])
	}
	DownloadFile(*files[0])

}
