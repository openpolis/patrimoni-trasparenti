package incomes

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

// SpesaElettorale modella la singola voce di spesa.
type SpesaElettorale struct {
	NomeSpesa    string `nome-spesa`
	TipoElezione string `tipo-elezione` // ∈ {camera, europa, senato, regione, provincia, comune }
	Importo      int    `importo`
}

// RecordReddito modella la singola voce del modello 730.
type RecordReddito struct {
	Voce        string `voce-730`
	Dichiarante int
	Coniuge     int
	Totale      int
}

// BeneImmobile modella la singola voce della sezione beni immobili.
type BeneImmobile struct {
	Persona     string
	Diritto     string `natura-diritto`
	Descrizione string
	Provincia   string
	Comune      string
	Annotazioni string
}

// Politician models a parliamentary or senator
// public incomes declaration for a given year.
type Politician struct {
	// omitempty to not complain during insert with empty Id,
	// MongoDB will create it anyway.
	Id                bson.ObjectId `bson:"_id,omitempty" json:"id"`
	Nome              string
	Cognome           string
	DataNascita       time.Time         `data-nascita`
	ComuneNascita     string            `bson:"comune-nascita" json:"comune-nascita"`
	ProvinciaNascita  string            `bson:"provincia-nascita"`
	StatoCivile       string            `stato-civile`              // FIXME does this work for bson and json?
	AnnoDichiarazione int               `anno-dichiarazione`        // The year of declaration
	OpId              int               `bson:"op-id" json:"op-id"` // The id in http://api3.openpolis.it
	SpeseElettorali   []SpesaElettorale `bson:"spese-elettorali" json:"spese-elettorali"`
	// FIXME Remove this and calculate it with aggregation?
	TotaleSpesaElettorali int             `totale-spese-elettorali`
	QuotaForfettariaSpese int             `quota-forfettaria-spese`
	RiepilogoRedditi      []RecordReddito `riepilogo-730`
	BeniImmobili          []BeneImmobile  `beni-immobili`

	DichiarazioneElettorale bool   `dichiarazione-elettorale`
	DichiarazioneConiuge    bool   `dichiarazione-coniuge`
	ModelloRedditi          string `modello-redditi`
	QuadriPresentati        string `quadri-presentati`
	Note                    []string
}
