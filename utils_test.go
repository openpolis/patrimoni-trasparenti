package incomes

import (
	"fmt"
	"reflect"
	"strings"
	"testing"
	"time"
)

func TestLowerStruct(t *testing.T) {
	d := Declaration{
		Nome:          "Mario",
		Cognome:       "ROSSI",
		ComuneNascita: "RoMa",
		DataNascita:   time.Now(),
	}
	err := LowerStruct(&d)
	if err != nil {
		t.Fatal(err)
	}

	fmt.Printf("%+v\n", d.DataNascita)

	v := reflect.ValueOf(d)
	for i := 0; i < v.NumField(); i++ {
		fieldValue := v.Field(i)
		if fieldValue.Kind() == reflect.String {
			s := fieldValue.String()
			l := strings.ToLower(s)
			if s != l {
				t.Fatalf("strings are different: \"%s\" \"%s\"", s, l)
			}
		}
	}
}
