package incomes

import (
	"errors"
	"reflect"
	"strconv"
	"strings"
	"time"

	"github.com/eraclitux/stracer"
)

// ParseDate converts a string date in the format
// dd-MM-yyyy in a time.Time.
func ParseDateFromBackend(d string) (time.Time, error) {
	// How reference date "Mon Jan 2 15:04:05 MST 2006 (MST is GMT-0700)" will be
	// formatted our way?
	// http://stackoverflow.com/a/6590606
	format := "02-01-2006"
	date, err := time.Parse(format, d)
	if err != nil {
		return time.Now(), err
	}
	return date, nil
}

// ParseDate converts a string date in the format
// dd/mm/yyyy in a time.Time.
func ParseDate(d string) (time.Time, error) {
	// How reference date "Mon Jan 2 15:04:05 MST 2006 (MST is GMT-0700)" will be
	// formatted our way?
	// http://stackoverflow.com/a/6590606
	format := "02/01/2006"
	date, err := time.Parse(format, d)
	if err != nil {
		return time.Now(), err
	}
	return date, nil
}

// ParseFloat extends string.ParseFloat returnig 0.0
// in case of empty string.
// FIXME return error
func ParseFloat(s string) float32 {
	value, err := strconv.ParseFloat(s, 32)
	if err != nil {
		// Empty string is zero for us not an error.
		if e, ok := err.(*strconv.NumError); ok && e.Num == "" {
			return 0
		}
		stracer.Traceln("error converting to float", s, err)
		return 0
	}
	return float32(value)
}

// Atoi extends strconv.Atoi returning 0 in case of empty string.
func Atoi(s string) (int, error) {
	n, err := strconv.Atoi(s)
	if err != nil {
		// Empty string is zero for us not an error.
		if e, ok := err.(*strconv.NumError); ok && e.Num == "" {
			return 0, nil
		} else {
			return 0, err
		}
	}
	return n, nil
}

// ExtractDistrict takes a string in the format "City (dst)"
// and returns city and district as two strings.
func ExtractDistrict(s string) (city, district string) {
	if !strings.Contains(s, "(") {
		city = s
		district = s
		return
	}
	a := strings.Split(s, " (")
	city = a[0]
	district = strings.TrimRight(a[1], ")")
	return
}

// LowerStruct change string field to lower case
// of the passed struct.
func LowerStruct(strPtr interface{}) error {
	str := reflect.ValueOf(strPtr)
	if str.Kind() != reflect.Ptr {
		return errors.New("pointer to struct expected")
	}
	v := str.Elem()
	for i := 0; i < v.NumField(); i++ {
		fieldValue := v.Field(i)
		if fieldValue.CanSet() && fieldValue.Kind() == reflect.String {
			s := fieldValue.String()
			fieldValue.SetString(strings.ToLower(s))
		}
	}
	return nil
}
