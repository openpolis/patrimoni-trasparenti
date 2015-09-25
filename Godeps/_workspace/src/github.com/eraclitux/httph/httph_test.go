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

	"github.com/eraclitux/stracer"
	"golang.org/x/crypto/bcrypt"
)

type store struct {
	H []byte
}

func (s *store) GetHash(u string) ([]byte, error) {
	return s.H, nil
}

func createHasher(p string) Hasher {
	h, _ := bcrypt.GenerateFromPassword([]byte(p), bcrypt.DefaultCost)
	return &store{H: h}
}

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

func TestMustAuth(t *testing.T) {
	ts := []struct {
		User         string
		Passwd       string
		ExpectedCode int
	}{
		{"pippo", "XXXYYYzzz", 200},
		{"pippo", "xxxyyyZZZ", 401},
		{"carl", "", 401},
	}
	passwd := "XXXYYYzzz"
	cookieName := "my-cookie-name"
	innerHandler := func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(cookieName)
		if err == nil && cookie != nil {
			http.Error(w, "no coockies found :(", http.StatusUnauthorized)
			return
		}
		fmt.Fprintf(w, "you are authenticated...")
	}
	h := MustAuth(cookieName, createHasher(passwd), http.HandlerFunc(innerHandler))
	testServer := httptest.NewServer(h)
	defer testServer.Close()

	for i, r := range ts {
		req, err := http.NewRequest("GET", testServer.URL, nil)
		if err != nil {
			t.Fatal(err)
		}

		req.SetBasicAuth(r.User, r.Passwd)
		c := http.Client{}
		res, err := c.Do(req)
		if err != nil {
			t.Fatal(err)
		}
		defer res.Body.Close()
		message, err := ioutil.ReadAll(res.Body)
		if err != nil {
			t.Fatal(err)
		}
		stracer.Traceln("resp from server:", string(message))
		if res.StatusCode != r.ExpectedCode {
			t.Logf("case %d: %+v", i, r)
			t.Fatal("expected:", r.ExpectedCode, "received:", res.Status, "body:", string(message))
		}
	}
}

func TestRandomString(t *testing.T) {
	a := randomString(32)
	b := randomString(32)
	if testing.Verbose() {
		fmt.Println("random strings:", a, b)
	}
	if a == b {
		t.Fatal("not random!")
	}
}
