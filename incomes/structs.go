package incomes

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

// RecordReddito modella la singola voce del modello 730.
type VoceReddito struct {
	Voce        string `voce_730`
	Dichiarante float32
	Coniuge     float32
	Totale      float32
}

// BeneImmobile modella la singola voce della sezione beni immobili.
type BeneImmobile struct {
	Persona     string
	Diritto     string `natura_diritto`
	Descrizione string
	Provincia   string
	Comune      string
	Annotazioni string
}

// BeneMobile modella la singola voce della sezione beni mobili.
type BeneMobile struct {
	Persona              string
	Tipologia            string
	CavalliFiscali       string `cv_fiscali`
	AnnoImmatricolazione int    `anno_immatricolazione`
	Annotazioni          string
}

// Sede è una struct utilizzata da altri oggetti.
type sede struct {
	CittaSede     string `citta_sede`
	ProvinciaSede string `provincia_sede`
}

// Partecipazione modella la singola participazioe societaria.
type Partecipazione struct {
	sede
	Persona       string
	Denominazione string
	NumeroQuote   int `numero_azioni`
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
	DataNascita                time.Time        `data_nascita`
	ComuneNascita              string           `comune_nascita`
	ProvinciaNascita           string           `provincia_nascita`
	StatoCivile                string           `stato_civile`       // FIXME does this work for bson and json?
	AnnoDichiarazione          int              `anno_dichiarazione` // The year of declaration
	OpId                       string           `op_id`              // The id in http://api3.openpolis.it
	VociReddito                []VoceReddito    `reddito_730`
	BeniImmobili               []BeneImmobile   `beni_immobili`
	BeniMobili                 []BeneMobile     `beni_mobili`
	Partecipazioni             []Partecipazione `partecipazioni_soc`
	Amministrazioni            []Ruolo          `amministrazioni_soc`
	ContributiElettorali       []Contributo     `contributi_elettorali`
	TotaleContributiElettorali int              `totale_contributi_elettorali`
	SpeseElettorali            []Contributo     `spese_elettorali`
	// FIXME Remove this and calculate it with aggregation?
	TotaleSpeseElettorali int `totale_spese_elettorali`
	QuotaForfettariaSpese int `quota_forfettaria_spese`

	DichiarazioneElettorale bool   `dichiarazione_elettorale`
	DichiarazioneConiuge    bool   `dichiarazione_coniuge`
	ModelloRedditi          string `modello_redditi`
	QuadriPresentati        string `quadri_presentati`
	Note                    []string
}

type PoliticianVerioned struct {
	Politician
	// Different versions of this document as document ids in a different collection.
	Versions []bson.ObjectId `versions`
}
