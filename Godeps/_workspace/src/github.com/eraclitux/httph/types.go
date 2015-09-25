// Copyright (c) 2015 Andrea Masi. All rights reserved.
// Use of this source code is governed by a MIT license
// that can be found in the LICENSE.txt file.

package httph

import (
	"errors"
	"net/http"
	"sync"
)

const (
	// MongoSession is used to access shared MongoDb session
	// in SharedData.
	MongoSession = "mongo-session"
)

// SharedData is a threadsafe container that enables
// to share data between http handlers decorators.
var SharedData Sharer

type httpVars map[*http.Request]map[string]interface{}

// TODO drop sessions every x time or memory leak here.
var sessions map[string]struct{} = make(map[string]struct{})

var httpVarsLock sync.RWMutex
var sessionsMut sync.RWMutex

// Sharer interface defines a container to store data
// between net/http handlers.
type Sharer interface {
	Insert(r *http.Request, k string, v interface{})
	Get(r *http.Request, k string) (interface{}, bool)
	Delete(r *http.Request, k string) error
	init(r *http.Request)
	drop(r *http.Request)
}

// Hasher define a way to generalize
// credentials retrieving from different
// backends.
type Hasher interface {
	// GetHash retieve hashed password from
	// backend for user u.
	// It returns error if user is not found.
	GetHash(u string) ([]byte, error)
}

func (m httpVars) init(r *http.Request) {
	httpVarsLock.Lock()
	defer httpVarsLock.Unlock()
	m[r] = map[string]interface{}{}
}

// Insert inserts a key/value pair for a given *http.Request.
func (m httpVars) Insert(r *http.Request, k string, v interface{}) {
	httpVarsLock.Lock()
	defer httpVarsLock.Unlock()
	if _, ok := m[r]; !ok {
		panic("cannot find *http.Request in HTTPRequestSetter, use init() and defer drop()")
	}
	m[r][k] = v
}

// Get retrieves a key/value pair for a given *http.Request
func (m httpVars) Get(r *http.Request, k string) (interface{}, bool) {
	httpVarsLock.RLock()
	defer httpVarsLock.RUnlock()
	if _, ok := m[r]; !ok {
		return nil, false
	}
	v, ok := m[r][k]
	if !ok {
		return nil, false
	}
	return v, true
}

// Delete removes the key/value pair for the provided k.
func (m httpVars) Delete(r *http.Request, k string) error {
	httpVarsLock.Lock()
	defer httpVarsLock.Unlock()
	n, found := m[r]
	if !found {
		return errors.New("request key not found")
	}
	delete(n, k)
	return nil
}

// drop frees memory deleting all key/value pairs for a given
// *http.Request.
func (m httpVars) drop(r *http.Request) {
	httpVarsLock.Lock()
	defer httpVarsLock.Unlock()
	delete(m, r)
}

// newSharer returns a thread safe type for sharing data
// between net/http handlers.
func newSharer() Sharer {
	m := make(httpVars)
	return m
}

func init() {
	// TODO move this to declaration.
	SharedData = newSharer()
}
