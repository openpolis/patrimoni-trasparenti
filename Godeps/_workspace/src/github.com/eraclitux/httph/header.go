package httph

import "net/http"

// HeaderJSON sets http header for json.
func HeaderJSON(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
}
