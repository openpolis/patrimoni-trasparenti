package incomes

import (
	"fmt"
	"time"

	"gopkg.in/mgo.v2/bson"
)

// RecordReddito modella la singola voce del modello 730.
type VoceReddito struct {
	Voce        string `bson:"voce_730" json:"voce_730"`
	Dichiarante float32
	Coniuge     float32
	Totale      float32
}

// BeneImmobile modella la singola voce della sezione beni immobili.
type BeneImmobile struct {
	Persona     string
	Diritto     string `bson:"natura_diritto" json:"natura_diritto"`
	Descrizione string
	Provincia   string
	Comune      string
	Annotazioni string
}

// BeneMobile modella la singola voce della sezione beni mobili.
type BeneMobile struct {
	Persona              string
	Tipologia            string
	CavalliFiscali       string `bson:"cavalli_fiscali" json:"cavalli_fiscali"`
	AnnoImmatricolazione int    `bson:"anno_immatricolazione" json:"anno_immatricolazione"`
	Annotazioni          string
}

// Sede è una struct utilizzata da altri oggetti.
type Sede struct {
	CittaSede     string `bson:"citta_sede" json:"citta_sede"`
	ProvinciaSede string `bson:"provincia_sede" json:"provincia_sede"`
}

// Partecipazione modella la singola participazioe societaria.
type Partecipazione struct {
	Sede          `bson:",inline"`
	Persona       string
	Denominazione string
	NumeroQuote   string `bson:"numero_azioni_quote" json:"numero_azioni_quote"`
	Annotazioni   string
}

// Ruolo modella il sigolo ruolo di amministrazione di società.
type Ruolo struct {
	Sede           `bson:",inline"`
	Persona        string
	Denominazione  string
	NaturaIncarico string `bson:"natura_incarico" json:"natura_incarico"`
	Annotazioni    string
}

// Contributo modella il singolo contributo/spesa elettorale.
type Contributo struct {
	Fonte        string
	TipoElezione string `bson:"tipo_elezione" json:"tipo_elezione"`
	Anno         int
	Importo      float32
}

// Politician models a parliamentary or senator
// public incomes declaration for a given year.
type Politician struct {
	// omitempty to not complain during insert with empty Id,
	// MongoDB will create it anyway.
	Id                           bson.ObjectId    `bson:"_id,omitempty" json:"id"`
	Nome                         string           `bson:"nome" json:"nome"`
	Cognome                      string           `bson:"cognome" json:"cognome"`
	DataNascita                  time.Time        `bson:"data_nascita" json:"data_nascita"`
	ComuneNascita                string           `bson:"comune_nascita" json:"comune_nascita"`
	ProvinciaNascita             string           `bson:"provincia_nascita" json:"provincia_nascita"`
	ComuneResidenza              string           `bson:"comune_residenza" json:"comune_residenza"`
	ProvinciaResidenza           string           `bson:"provincia_residenza" json:"provincia_residenza"`
	StatoCivile                  string           `bson:"stato_civile" json:"stato_civile"`             // FIXME does this work for bson and json?
	AnnoDichiarazione            int              `bson:"anno_dichiarazione" json:"anno_dichiarazione"` // The year of declaration
	OpId                         string           `bson:"op_id" json:"op_id"`                           // The id in http://api3.openpolis.it
	VociReddito                  []VoceReddito    `bson:"reddito_730" json:"reddito_730"`
	TotaleVociRedditoDichiarante float32          `bson:"totale_730_dichiarante" json:"totale_730_dichiarante"`
	TotaleVociRedditoConiuge     float32          `bson:"totale_730_coniuge" json:"totale_730_coniuge"`
	TotaleVociReddito            float32          `bson:"totale_730" json:"totale_730"`
	BeniImmobili                 []BeneImmobile   `bson:"beni_immobili" json:"beni_immobili"`
	BeniMobili                   []BeneMobile     `bson:"beni_mobili" json:"beni_mobili"`
	Partecipazioni               []Partecipazione `bson:"partecipazioni_soc" json:"partecipazioni_soc"`
	Amministrazioni              []Ruolo          `bson:"amministrazioni_soc" json:"amministrazioni_soc"`
	ContributiElettorali         []Contributo     `bson:"contributi_elettorali" json:"contributi_elettorali"`
	TotaleContributiElettorali   float32          `bson:"totale_contributi_elettorali" json:"totale_contributi_elettorali"`
	SpeseElettorali              []Contributo     `bson:"spese_elettorali" json:"spese_elettorali"`
	TotaleSpeseElettorali        float32          `bson:"totale_spese_elettorali" json:"totale_spese_elettorali"` // FIXME Remove this and calculate it with aggregation?
	QuotaForfettariaSpese        float32          `bson:"quota_forfettaria_spese" json:"quota_forfettaria_spese"`

	DichiarazioneElettorale bool   `bson:"dichiarazione_elettorale" json:"dichiarazione_elettorale"`
	DichiarazioneConiuge    bool   `bson:"dichiarazione_coniuge" json:"dichiarazione_coniuge"`
	ModelloRedditi          string `bson:"modello_redditi" json:"modello_redditi"`
	QuadriPresentati        string `bson:"quadri_presentati" json:"quadri_presentati"`
	Note                    []string
}

func (p Politician) String() string {
	return fmt.Sprintf("Politician(%s): %s %s", p.OpId, p.Nome, p.Cognome)
}

type PoliticianVersioned struct {
	Politician `bson:",inline"`
	// Different versions of this document as document ids in a different collection.
	Versions []bson.ObjectId `bson:"versions" json:"versions"`
}
