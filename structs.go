package incomes

import (
	"fmt"
	"time"

	"gopkg.in/mgo.v2/bson"
)

const (
	DeclarationsDb   = "declarations"
	DeclarationsColl = "all"
)

// RecordReddito modella la singola voce del modello 730.
type VoceReddito struct {
	Voce        string  `bson:"voce_730" json:"voce_730"`
	Dichiarante float32 `bson:"dichiarante" json:"dichiarante"`
	Coniuge     float32 `bson:"coniuge" json:"coniuge"`
	Totale      float32 `bson:"totale" json:"totale"`
}

// BeneImmobile modella la singola voce della sezione beni immobili.
type BeneImmobile struct {
	Persona            string  `bson:"persona" json:"persona"`
	Diritto            string  `bson:"natura_diritto" json:"natura_diritto"`
	Descrizione        string  `bson:"descrizione" json:"descrizione"`
	Provincia          string  `bson:"provincia" json:"provincia"`
	Comune             string  `bson:"comune" json:"comune"`
	RenditaCatastale   float32 `bson:"rendita_catastale" json:"rendita_catastale"`
	CategoriaCatastale string  `bson:"categoria_catastale" json:"categoria_catastale"`
	Annotazioni        string  `bson:"annotazioni" json:"annotazioni"`
}

// BeneMobile modella la singola voce della sezione beni mobili.
type BeneMobile struct {
	Persona              string `bson:"persona" json:"persona"`
	Tipologia            string `bson:"tipologia" json:"tipologia"`
	CavalliFiscali       string `bson:"cavalli_fiscali" json:"cavalli_fiscali"`
	AnnoImmatricolazione int    `bson:"anno_immatricolazione" json:"anno_immatricolazione"`
	Annotazioni          string `bson:"annotazioni" json:"annotazioni"`
}

// Sede è una struct utilizzata da altri oggetti.
type Sede struct {
	CittaSede     string `bson:"citta_sede" json:"citta_sede"`
	ProvinciaSede string `bson:"provincia_sede" json:"provincia_sede"`
}

// Partecipazione modella la singola participazioe societaria.
type Partecipazione struct {
	Sede            `bson:",inline"`
	Persona         string  `bson:"persona" json:"persona"`
	Denominazione   string  `bson:"denominazione" json:"denominazione"`
	NumeroQuote     string  `bson:"numero_azioni_quote" json:"numero_azioni_quote"`
	ValoreEconomico float32 `bson:"valore_economico" json:"valore_economico"`
	Annotazioni     string  `bson:"annotazioni" json:"annotazioni"`
}

// Ruolo modella il sigolo ruolo di amministrazione di società.
type Ruolo struct {
	Sede           `bson:",inline"`
	Persona        string `bson:"persona" json:"persona"`
	Denominazione  string `bson:"denominazione" json:"denominazione"`
	NaturaIncarico string `bson:"natura_incarico" json:"natura_incarico"`
	Annotazioni    string `bson:"annotazioni" json:"annotazioni"`
}

// Contributo modella il singolo contributo/spesa elettorale.
type Contributo struct {
	Fonte        string  `bson:"fonte" json:"fonte"`
	TipoElezione string  `bson:"tipo_elezione" json:"tipo_elezione"`
	Anno         int     `bson:"anno" json:"anno"`
	Importo      float32 `bson:"importo" json:"importo"`
}

// Declaration models public incomes declaration for a politician (a parliamentary or senator) for a given year.
type Declaration struct {
	// omitempty to not complain during insert with empty Id,
	// MongoDB will create it anyway.
	//
	// NOTE Mongo' unwind is cool but total fields are NOT consistent!
	// We have inserted totals !=0 even if single voices are zero.
	// We cannot remove totals fields and calculate them with aggregation.
	Id                           bson.ObjectId    `bson:"_id,omitempty" json:"id"`
	Nome                         string           `bson:"nome" json:"nome"`
	Cognome                      string           `bson:"cognome" json:"cognome"`
	DataNascita                  time.Time        `bson:"data_nascita" json:"data_nascita"`
	ComuneNascita                string           `bson:"comune_nascita" json:"comune_nascita"`
	ProvinciaNascita             string           `bson:"provincia_nascita" json:"provincia_nascita"`
	ComuneResidenza              string           `bson:"comune_residenza" json:"comune_residenza"`
	ProvinciaResidenza           string           `bson:"provincia_residenza" json:"provincia_residenza"`
	StatoCivile                  string           `bson:"stato_civile" json:"stato_civile"`
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
	TotaleSpeseElettorali        float32          `bson:"totale_spese_elettorali" json:"totale_spese_elettorali"`
	QuotaForfettariaSpese        float32          `bson:"quota_forfettaria_spese" json:"quota_forfettaria_spese"`

	DichiarazioneElettorale bool   `bson:"dichiarazione_elettorale" json:"dichiarazione_elettorale"`
	DocumentiAppello        bool   `bson:"documenti_appello" json:"documenti_appello"`
	DichiarazioneConiuge    bool   `bson:"dichiarazione_coniuge" json:"dichiarazione_coniuge"`
	DichiaraziniIncomplete  string `bson:"dichiarazioni_incomplete" json:"dichiarazioni_incomplete"`
	ModelloRedditi          string `bson:"modello_redditi" json:"modello_redditi"`
	QuadriPresentati        string `bson:"quadri_presentati" json:"quadri_presentati"`
	Variazioni              bool   `bson:"variazioni" json:"variazioni"`
	Note                    string `bson:"note" json:"note"`

	// This is the original file name for delcaration.
	// Not intended to be modified.
	File string `bson:"filename" json:"filename"`
	// This is the rectification file name for declaration.
	// Intended to be modified.
	FileRectification string `bson:"filename_rectification" json:"filename_rectification"`
}

func (p Declaration) String() string {
	return fmt.Sprintf("Declaration: %s %s %s %d", p.OpId, p.Nome, p.Cognome, p.AnnoDichiarazione)
}

type DeclarationVersioned struct {
	Declaration `bson:",inline"`
	// Different versions of this document as document ids in a different collection.
	Versions []bson.ObjectId `bson:"versions" json:"versions"`
}

// DeclarationEnhanced extends Declaration
// to include download link for declarations.
// Not intended to be stored in db.
type DeclarationEnhanced struct {
	Declaration
	UrlFileOrig string `json:"filename_url"`
	UrlFileRect string `json:"filename_rectification_url"`
}

// TBRPolarPoint models a single point in a polar pie widget.
// It can be passed also for other pies (radius is ignored).
// Different categories have different color but different IDs in same category haven't.
type TBPolarPoint struct {
	Value    int    `json:"value"`
	Radius   int    `json:"radius"`
	Category string `json:"category"`
	ID       string `json:"id"`
}

// TBItem models a single TB item aka a widget.
type TBItem struct {
	ID   string         `json:"id"`
	Tip  string         `json:"tip"`
	Data []TBPolarPoint `json:"data"`
}

// TBDashTest models JSON response for TadaBoard test dashboard.
// required tag is used by swagger for documentation.
type TBDashTest struct {
	Status    bool              `json:"status,required"`
	Error     error             `json:"error"`
	Timestamp int64             `json:"timestamp"`
	Query     map[string]string `json:"query"`
	Item      []TBItem          `json:"item"`
}

// TBReq models single request made by TB.
//[STRACER] 09:59:29.513576 {"method":"GET","customQuery":"","url":"http://patrimoni.staging.openpolis.it/api/tdb/test","query":{"provincia_residenza":"0"},"token":""}
type TBReq struct {
	ID          string            `json:"id"`
	Method      string            `json:"method"`
	CustomQuery string            `json:"customQuery"`
	URL         string            `json:"url"`
	Query       map[string]string `json:"query"`
	Token       string            `json:"token"`
}

//{
//  "status": true,
//  "error": null,
//  "timestamp": 1441789290944,
//  "query": {
//    "provincia_residenza": null,
//    "comune_residenza": null
//  },
//  "item": [
//    {
//      "id": "1",
//      "tip": "a test widget",
//      "data": [
//        {
//          "value": 1821,
//          "radius": 293,
//          "category": "A",
//          "id": 0
//        },
//        {
//          "value": 1590,
//          "radius": 253,
//          "category": "B",
//          "id": 1
//        }
//      ]
//    },
//    {
//      "id": "2",
//      "tip": "another widget",
//      "data": [
//        {
//          "x": "A",
//          "y": 4426,
//          "category": "groupA",
//          "id": 0
//        },
//        {
//          "x": "B",
//          "y": 5026,
//          "category": "groupA",
//          "id": 1
//        },
//        {
//          "x": "C",
//          "y": 4475,
//          "category": "groupA",
//          "id": 2
//        },
//        {
//          "x": "D",
//          "y": 6471,
//          "category": "groupA",
//          "id": 3
//        },
//        {
//          "x": "E",
//          "y": 6146,
//          "category": "groupA",
//          "id": 4
//        }
//      ]
//    }
//  ]
//}
