// Copyright (c) 2015 Andrea Masi. All rights reserved.
// Use of this source code is governed by a MIT license
// that can be found in the LICENSE.txt file.

package httph_test

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/eraclitux/httph"
)

func barHanlder(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello bar")
}

func fooHanlder(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello foo")
}

// This example shows how to log requests for different handlers.
func ExampleWithLog() {
	InfoLogger := log.New(os.Stdout, "[INFO] ", log.Ldate|log.Ltime)

	http.HandleFunc("/bar", httph.WithLog(InfoLogger, barHanlder))
	http.HandleFunc("/foo", httph.WithLog(InfoLogger, fooHanlder))
	log.Fatal(http.ListenAndServe(":8080", nil))
}
