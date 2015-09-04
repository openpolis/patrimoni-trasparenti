package main

import (
	"regexp"
	"strconv"
	"strings"

	"bitbucket.org/eraclitux/op-incomes"
	"github.com/eraclitux/stracer"
)

// SanitizeFloat parse lines form GDocs csv
// converting float number in a format understandable by
// strconv.ParseFloat() and that is not problematic
// when spitting on commas.
// "12.000,00" --> 12000.00
func SanitizeFloat(line string) string {
	reDot := regexp.MustCompile(`([0-9]+).([0-9]{3})`)
	reDotMilion := regexp.MustCompile(`([0-9]+)\.([0-9]{3})\.([0-9]{3}),`)
	if reDotMilion.MatchString(line) {
		stracer.Traceln("SanitizeFloat match long:", line)
		// "12.000.000,00" --> "12000000,00"
		line = reDotMilion.ReplaceAllString(line, "$1$2$3,")
		stracer.Traceln("SanitizeFloat after inside:", line)
	} else if reDot.MatchString(line) {
		// "12.000,00" --> "12000,00"
		line = reDot.ReplaceAllString(line, "$1$2")
		stracer.Traceln("SanitizeFloat after inside redot", line)
	}
	reComma := regexp.MustCompile("(\"[0-9]+),([0-9]+\")")
	// "12000,00" --> "12000.00"
	line = reComma.ReplaceAllString(line, "$1.$2")
	// "12000,00" --> 12000.00
	return strings.Replace(line, `"`, ``, -1)
}

// SanitizeString removes any commas into double quotes
// so no problem when splitting on commas.
// "50% pari a € 50.100,00" --> 50% pari a € 50.100.00
func SanitizeString(line string) string {
	reComma := regexp.MustCompile("(\".+),(.+\")")
	line = reComma.ReplaceAllString(line, "$1.$2")
	return strings.Replace(line, `"`, ``, -1)
}

// ParseTitle extract Opid Surname and year of declaration
// out of file name.
// It also populate File field with pdf name on s3 which
// is the original declaration file.
func ParseTitle(p *incomes.Declaration, title string) error {
	values := strings.Split(title, "_")
	p.OpId = values[0]
	p.Cognome = values[2]
	year, err := strconv.Atoi(values[1])
	if err != nil {
		return err
	}
	p.AnnoDichiarazione = year
	p.File = p.OpId + "_" + values[1] + ".pdf"
	return nil
}
