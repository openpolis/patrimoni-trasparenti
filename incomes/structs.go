package incomes

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

// RecordReddito modella la singola voce del modello 730.
type VoceReddito struct {
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

// BeneMobile modella la singola voce della sezione beni mobili.
type BeneMobile struct {
	Persona              string
	Tipologia            string
	CavalliFiscali       string `cv-fiscali`
	AnnoImmatricolazione int    `anno-immatricolazione`
	Annotazioni          string
}

// Sede è una struct utilizzata da altri oggetti.
type sede struct {
	CittaSede     string `citta-sede`
	ProvinciaSede string `provincia-sede`
}

// Partecipazione modella la singola participazioe societaria.
type Partecipazione struct {
	sede
	Persona       string
	Denominazione string
	NumeroQuote   int `numero-azioni`
	Annotazioni   string
}

// Ruolo modella il sigolo ruolo di amministrazione di società.
type Ruolo struct {
	sede
	Persona        string
	Denominazione  string
	NaturaIncarico string
	Annotazioni    string
}

// Contributo modella il singolo contributo/spesa elettorale.
type Contributo struct {
	Fonte        string
	TipoElezione string
	Anno         int
	Importo      int
}

// Politician models a parliamentary or senator
// public incomes declaration for a given year.
type Politician struct {
	// omitempty to not complain during insert with empty Id,
	// MongoDB will create it anyway.
	Id                         bson.ObjectId `bson:"_id,omitempty" json:"id"`
	Nome                       string
	Cognome                    string
	DataNascita                time.Time        `data-nascita`
	ComuneNascita              string           `bson:"comune-nascita" json:"comune-nascita"`
	ProvinciaNascita           string           `bson:"provincia-nascita"`
	StatoCivile                string           `stato-civile`              // FIXME does this work for bson and json?
	AnnoDichiarazione          int              `anno-dichiarazione`        // The year of declaration
	OpId                       string           `bson:"op-id" json:"op-id"` // The id in http://api3.openpolis.it
	VociReddito                []VoceReddito    `reddito-730`
	BeniImmobili               []BeneImmobile   `beni-immobili`
	BeniMobili                 []BeneMobile     `beni-mobili`
	Partecipazioni             []Partecipazione `partecipazioni-soc`
	Amministrazioni            []Ruolo          `amministrazioni-soc`
	ContributiElettorali       []Contributo     `contributi-elettorali`
	TotaleContributiElettorali int              `totale-contributi-elettorali`
	SpeseElettorali            []Contributo     `spese-elettorali`
	// FIXME Remove this and calculate it with aggregation?
	TotaleSpeseElettorali int `totale-spese-elettorali`
	QuotaForfettariaSpese int `quota-forfettaria-spese`

	DichiarazioneElettorale bool   `dichiarazione-elettorale`
	DichiarazioneConiuge    bool   `dichiarazione-coniuge`
	ModelloRedditi          string `modello-redditi`
	QuadriPresentati        string `quadri-presentati`
	Note                    []string
}
