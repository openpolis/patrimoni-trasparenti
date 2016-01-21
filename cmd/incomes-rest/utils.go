package main

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/eraclitux/stracer"
	"gopkg.in/mgo.v2/bson"
)

func AddYearInJSON(results []bson.M) {
	for _, roles := range results {
		rls := roles["dichiarazioni"].([]interface{})
		for _, role := range rls {
			m := role.(bson.M)
			s := m["dichiarazione"].(string)
			a := m["anno"].(int)
			m["dichiarazione"] = s + strconv.Itoa(a)
		}
	}
}

// assembleMatch create map for "$match" pipe stage for
// MongoDB aggregations.
func assembleMatch(query map[string]string) bson.M {
	match := bson.M{}
	for k, v := range query {
		if v == "" {
			continue
		}
		if k == "anno_dichiarazione" {
			match[k], _ = strconv.Atoi(v)
			continue
		}
		if k == "acronimo_gruppo" {
			match["gruppo.acronym"] = v
			continue
		}
		if k == "anno" {
			match["anno_dichiarazione"], _ = strconv.Atoi(v)
			continue
		}
		if k == "gruppo" {
			match["incarichi.gruppo.acronym"] = v
			continue
		}
		if k == "circoscrizione" {
			match["incarichi.circoscrizione"] = v
			continue
		}
		if k == "istituzione" {
			match["incarichi.istituzione"] = v
			continue
		}
	}
	stracer.Traceln("match assembled:", match)
	return match
}

func quote(s string) string {
	return fmt.Sprintf("\"%s\"", s)
}

func countEmbeddedElements(f []interface{}) string {
	tot := 0
	for _, e := range f {
		v := e.(bson.M)
		if v["persona"] == "dichiarante" {
			tot++
		}
	}
	return strconv.Itoa(tot)
}

func countImmobili(l []interface{}) (f, t string) {
	fI, tI := 0, 0
	for _, e := range l {
		v := e.(bson.M)
		if v["persona"] != "dichiarante" {
			continue
		}
		if v["descrizione"] == "fabbricato" {
			fI++
		} else if v["descrizione"] == "terreno" {
			tI++
		}
	}
	f = strconv.Itoa(fI)
	t = strconv.Itoa(tI)
	return
}

func extractRoles(roles []interface{}) (i, l, g, c string) {
	for _, v := range roles {
		m := v.(bson.M)
		i += m["istituzione"].(string) + ", "
		party := m["partito"].(bson.M)
		group := m["gruppo"].(bson.M)
		l += party["acronym"].(string) + ", "
		g = group["acronym"].(string) + ", "
		c += m["circoscrizione"].(string) + ", "
	}
	i = strings.TrimRight(i, ", ")
	l = strings.TrimRight(l, ", ")
	g = strings.TrimRight(g, ", ")
	c = strings.TrimRight(c, ", ")
	return
}

//    openpolis_id
//    nome (mettere il campo tra apici ")
//    cognome (mettere il campo tra apici ")
//    data_nascita (con formattazione GG/MM/AAAA)
//    professione
//    incarichi. Se l'incarico non è più in corso mettere (incarico cessato il gg/mm/aaa). Per esempio: deputato (incarico cessato il 15/07/2014) (mettere il campo tra apici " - separare i valori con la virgola)
//    lista di elezione/partito (mettere il campo tra apici " - separare i valori con la virgola)
//    gruppo parlamentare (mettere il campo tra apici ")
//    circoscrizione di elezione (mettere il campo tra apici ")
//    totale_730_dichiarante
//    totale_730_coniuge
//    totale_contributi_elettorali
//    totale_spese_elettorali
//    indice_completezza
//    note_completezza (mettere il campo tra apici ")
//    numero fabbricati
//    numero terreni
//    numero beni mobili
//    numero di partecipazioni (azioni/quote) in società
//    numero di incarichi di amministratore di società
func makeCSVHeader() []string {
	return []string{
		"openpolis_id",
		"nome",
		"cognome",
		"data_nascita",
		"professione",
		"incarichi",
		"lista di elezione/partito",
		"gruppo parlamentare",
		"circoscrizione di elezione",
		"totale_730_dichiarante",
		"totale_730_coniuge",
		"totale_contributi_elettorali",
		"totale_spese_elettorali",
		"indice_completezza",
		"note_completezza",
		"numero fabbricati",
		"numero terreni",
		"numero beni mobili",
		"numero di partecipazioni (azioni/quote) in società",
		"numero di incarichi di amministratore di società",
	}
}

func assembleCSVLine(m bson.M) []string {

	l := make([]string, 20)
	l[0] = m["op_id"].(string)
	l[1] = m["nome"].(string)
	l[2] = m["cognome"].(string)
	l[3] = m["data_nascita"].(time.Time).Format("02/01/2006")
	if m["professione"] != nil {
		l[4] = m["professione"].(string)
	}
	if m["incarichi"] != nil {
		l[5], l[6], l[7], l[8] = extractRoles(m["incarichi"].([]interface{}))
	} else {
		stracer.Traceln("[ERROR] no roles found for", l[0])
	}
	f := strconv.FormatFloat(m["totale_730_dichiarante"].(float64), 'f', 1, 32)
	f = strings.Replace(f, ".", ",", -1)
	l[9] = f
	f = strconv.FormatFloat(m["totale_730_coniuge"].(float64), 'f', 1, 64)
	f = strings.Replace(f, ".", ",", -1)
	l[10] = f
	f = strconv.FormatFloat(m["totale_contributi_elettorali"].(float64), 'f', 1, 64)
	f = strings.Replace(f, ".", ",", -1)
	l[11] = f
	f = strconv.FormatFloat(m["totale_spese_elettorali"].(float64), 'f', 1, 64)
	f = strings.Replace(f, ".", ",", -1)
	l[12] = f
	is := strconv.Itoa(m["indice_completezza"].(int))
	l[13] = is
	l[14] = m["note_completezza"].(string)
	l[15], l[16] = countImmobili(m["beni_immobili"].([]interface{}))
	l[17] = countEmbeddedElements(m["beni_mobili"].([]interface{}))
	l[18] = countEmbeddedElements(m["partecipazioni_soc"].([]interface{}))
	l[19] = countEmbeddedElements(m["amministrazioni_soc"].([]interface{}))

	return l
}
