package main

import (
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/eaigner/s3"
)

func createS3link(fileName string) string {
	if fileName == "" {
		return ""
	}
	s3c := &s3.S3{
		Bucket:    conf.S3bucket,
		AccessKey: conf.S3key,
		Secret:    conf.S3secret,
		Path:      conf.S3path,
	}
	obj := s3c.Object(fileName)
	url, err := obj.ExpiringURL(time.Minute * 60)
	if err != nil {
		ErrorLogger.Println("unable to generate s3 url:", err)
	}
	return url.String()
}

// ParlamentariUploadHandler get a declaration file via POST and
// store it to s3.
func ParlamentariUploadHandler(w http.ResponseWriter, r *http.Request) {
	s3c := &s3.S3{
		Bucket:    conf.S3bucket,
		AccessKey: conf.S3key,
		Secret:    conf.S3secret,
		Path:      conf.S3path,
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("retrieving file:", err)
		return
	}
	defer file.Close()
	name := time.Now().UTC().Format("20060102150405") + "_" + header.Filename
	obj := s3c.Object(name)
	out := obj.Writer()
	defer out.Close()
	_, err = io.Copy(out, file)
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		ErrorLogger.Println("copying file to S3:", err)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	result := map[string]string{"filename": name}
	json.NewEncoder(w).Encode(result)
	InfoLogger.Println("file sended to s3:", name)
}
