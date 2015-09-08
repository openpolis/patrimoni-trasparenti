// Copyright (c) 2015 Andrea Masi. All rights reserved.
// Use of this source code is governed by a MIT license
// that can be found in the LICENSE.txt file.

package httph

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestWithCORS(t *testing.T) {
	handler := func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello world")
	}
	h := WithCORS(handler)
	testServer := httptest.NewServer(http.HandlerFunc(h))
	defer testServer.Close()
	res, err := http.Get(testServer.URL)
	if err != nil {
		t.Fatal(err)
	}
	if v, ok := res.Header["Access-Control-Allow-Origin"]; ok {
		if v[0] != "*" {
			t.Fatal("invalid header")
		}
	} else {
		t.Fatal("CORS header not present")
	}
}

func TestWithSharedData(t *testing.T) {
	innerHandler := func(w http.ResponseWriter, r *http.Request) {
		if _, ok := SharedData.Get(r, "test-key"); !ok {
			t.Fatal("test-key not present")
		}
		fmt.Fprintf(w, "Hello world")
	}
	outerHandler := func(fn http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			SharedData.Insert(r, "test-key", struct{}{})
			defer SharedData.Delete(r, "test-key")
			fn(w, r)
		}
	}
	h := WithSharedData(outerHandler(innerHandler))
	testServer := httptest.NewServer(http.HandlerFunc(h))
	defer testServer.Close()
	res, err := http.Get(testServer.URL)
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()
	message, err := ioutil.ReadAll(res.Body)
	if err != nil {
		t.Fatal(err)
	}
	if string(message) != "Hello world" {
		t.Fatal("unexpected message")
	}
}
