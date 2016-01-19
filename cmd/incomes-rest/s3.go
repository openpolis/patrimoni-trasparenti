package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/eaigner/s3"
)

// createS3link creates a static url of
// the zip files on S3.
func createS3link(op_id string) string {
	if op_id == "" {
		return ""
	}
	return fmt.Sprintf("%s/%s.zip", conf.ZipUrl, op_id)
}

// DeclarationUploader get a declaration file via POST and
// store it to s3.
func DeclarationUploader(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		DeclarationUploaderPost(w, r)
		return
	case "OPTIONS":
		w.Header().Add("Access-Control-Allow-Methods", "POST")
		w.Header().Add("Access-Control-Allow-Headers", "content-type")
		w.WriteHeader(http.StatusNoContent)
		return
	}
	http.Error(w, http.StatusText(http.StatusNotFound), http.StatusNotFound)
}

func DeclarationUploaderPost(w http.ResponseWriter, r *http.Request) {
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
