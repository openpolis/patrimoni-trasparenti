package main

import "testing"

func TestSanitizeFloat(t *testing.T) {
	res := SanitizeFloat(`TOTALE,"3.233.190,00","0,00","3.233.190,00"`)
	if res != `TOTALE,3233190.00,0.00,3233190.00` {
		t.Fatal("unexpected result:", res)
	}
}
