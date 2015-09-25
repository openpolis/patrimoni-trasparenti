// Copyright (c) 2015 Andrea Masi. All rights reserved.
// Use of this source code is governed by a MIT license
// that can be found in the LICENSE.txt file.

// Package httph exposes functions & types usefull
// when dealing with net/http.
package httph

import (
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/eraclitux/stracer"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/mgo.v2"
)

// WithCORS is a decorator function that adds relevant headers to response
// to permit CORS requests.
func WithCORS(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		fn(w, r)
	}
}

// WithSharedData is a decorator function that initializes SharedData
// for the given http.Request freeing memory when possible.
func WithSharedData(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		SharedData.init(r)
		defer SharedData.drop(r)
		fn(w, r)
	}
}

// WithMongo is a decorator function that let passed HandlerFunc
// to use a session to MongoDB.
func WithMongo(session *mgo.Session, fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		s := session.Copy()
		defer s.Close()
		SharedData.Insert(r, MongoSession, s)
		defer SharedData.Delete(r, MongoSession)
		fn(w, r)
	}
}

// WithLog is a decorator that calls Println method
// of provided logger to log received requests.
// Format is:
// <http method> <remote addr> <requested url>
// If X-Real-IP is found in headers it is used as <remote addr>
// with (X-Real-IP) added.
func WithLog(logger *log.Logger, fn http.HandlerFunc) http.HandlerFunc {
	//TODO use constants to define format like in log package.
	return func(w http.ResponseWriter, r *http.Request) {
		remoteAddr := r.Header.Get("X-Real-IP")
		if remoteAddr == "" {
			remoteAddr = r.RemoteAddr
		} else {
			remoteAddr += " (X-Real-IP)"
		}
		logger.Println(r.Method, remoteAddr, r.URL)
		fn(w, r)
	}
}

func MustAuth(cookieName string, a Hasher, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(cookieName)
		if err == nil && cookie != nil {
			sessionsMut.Lock()
			_, ok := sessions[cookie.Value]
			sessionsMut.Unlock()
			if ok {
				next.ServeHTTP(w, r)
				return
			}
		}

		error := func() {
			time.Sleep(time.Duration(rand.Intn(100)+100) * time.Millisecond)
			w.Header().Set("WWW-Authenticate", "Basic realm=\"Authorization Required\"")
			http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
		}

		username, passwd, ok := r.BasicAuth()
		if !ok {
			error()
			return
		}
		stracer.Traceln(username, passwd)

		hash, err := a.GetHash(username)
		if err != nil {
			error()
			return
		}
		if err := bcrypt.CompareHashAndPassword(hash, []byte(passwd)); err != nil {
			error()
			return
		}

		sessionid := randomString(32)
		sessionsMut.Lock()
		sessions[sessionid] = struct{}{}
		sessionsMut.Unlock()
		http.SetCookie(w, &http.Cookie{
			Name:   cookieName,
			Value:  sessionid,
			MaxAge: 0,
		})

		next.ServeHTTP(w, r)
	})
}
