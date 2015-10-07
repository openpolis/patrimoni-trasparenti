package incomes

import (
	"fmt"
	"time"

	"gopkg.in/mgo.v2/bson"
)

const (
	DeclarationsDb   = "declarations"
	DeclarationsColl = "all"
	OpApi            = "http://api3.openpolis.it"
)

// RecordReddito modella la singola voce del modello 730.
type VoceReddito struct {
	Voce        string  `bson:"voce_730" json:"voce_730"`
	Dichiarante float32 `bson:"dichiarante" json:"dichiarante"`
	Coniuge     float32 `bson:"coniuge" json:"coniuge"`
	Totale      float32 `bson:"totale" json:"totale"`
}

type codiceUtilizzo struct {
	Codice string `bson:"codice" json:"codice"`
	Giorni int    `bson:"giorni" json:"giorni"`
}

// BeneImmobile modella la singola voce della sezione beni immobili.
type BeneImmobile struct {
	Persona          string  `bson:"persona" json:"persona"`
	Diritto          string  `bson:"natura_diritto" json:"natura_diritto"`
	Descrizione      string  `bson:"descrizione" json:"descrizione"`
	Provincia        string  `bson:"provincia" json:"provincia"`
	Comune           string  `bson:"comune" json:"comune"`
	RenditaCatastale float32 `bson:"rendita_catastale" json:"rendita_catastale"`
	//CodiceUtilizzo     []codiceUtilizzo `bson:"codice_utilizzo" json:"codice_utilizzo"`
	CodiceUtilizzo     string  `bson:"codice_utilizzo" json:"codice_utilizzo"`
	RedditoDom         float32 `bson:"reddito_dominicale" json:"reddito_dominicale"`
	RedditoAgrario     float32 `bson:"reddito_agrario" json:"reddito_agrario"`
	CategoriaCatastale string  `bson:"categoria_catastale" json:"categoria_catastale"`
	QuotaPossesso      float32 `bson:"quota_posseso" json:"quota_posseso"`
	Annotazioni        string  `bson:"annotazioni" json:"annotazioni"`
}

// BeneMobile modella la singola voce della sezione beni mobili.
type BeneMobile struct {
	Persona              string `bson:"persona" json:"persona"`
	Tipologia            string `bson:"tipologia" json:"tipologia"`
	CavalliFiscali       string `bson:"cavalli_fiscali" json:"cavalli_fiscali"`
	Modello              string `bson:"modello" json:"modello"`
	Marca                string `bson:"marca" json:"marca"`
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
	AttPrevalente   string  `bson:"attivita_prevalente" json:"attivita_prevalente"`
	NumeroQuote     string  `bson:"numero_azioni_quote" json:"numero_azioni_quote"`
	ValoreEconomico float32 `bson:"valore_economico" json:"valore_economico"`
	Annotazioni     string  `bson:"annotazioni" json:"annotazioni"`
}

// Ruolo modella il sigolo ruolo di amministrazione di società.
type Ruolo struct {
	Sede           `bson:",inline"`
	Persona        string `bson:"persona" json:"persona"`
	Denominazione  string `bson:"denominazione" json:"denominazione"`
	AttPrevalente  string `bson:"attivita_prevalente" json:"attivita_prevalente"`
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

	DichiarazioneElettorale bool `bson:"dichiarazione_elettorale" json:"dichiarazione_elettorale"`
	DocumentiAppello        bool `bson:"documenti_appello" json:"documenti_appello"`
	DichiarazioneConiuge    bool `bson:"dichiarazione_coniuge" json:"dichiarazione_coniuge"`
	// XXX no more used, it can be removed
	DichiaraziniIncomplete string `bson:"dichiarazioni_incomplete" json:"dichiarazioni_incomplete"`
	ModelloRedditi         string `bson:"modello_redditi" json:"modello_redditi"`
	// XXX no more used, it can be removed
	//QuadriPresentati string `bson:"quadri_presentati" json:"quadri_presentati"`
	ComplettezzaRedditi bool `bson:"completezza_redditi" json:"completezza_redditi"`

	IndiceCompletezza int    `bson:"indice_completezza" json:"indice_completezza"`
	NoteCompletezza   string `bson:"note_completezza" json:"note_completezza"`
	Variazioni        bool   `bson:"variazioni" json:"variazioni"`
	Note              string `bson:"note" json:"note"`

	// This is the original file name for delcaration.
	// Not intended to be modified.
	File string `bson:"filename" json:"filename"`
	// This is the rectification file name for declaration.
	// Intended to be modified.
	FileRectification string `bson:"filename_rectification" json:"filename_rectification"`

	// FIXME field is present in json even if empty.
	// Embed struct rule/bug?
	// Try to put in DeclarationEnhanced
	LastModified time.Time `bson:"ultima_modifica,omitempty" json:"ultima_modifica,omitempty"`
}

func (p Declaration) String() string {
	return fmt.Sprintf("Declaration: %s %s %s %d", p.OpId, p.Nome, p.Cognome, p.AnnoDichiarazione)
}

type DeclarationVersioned struct {
	Declaration `bson:",inline"`
	// Different versions of this document as document ids in a different collection.
	Versions []bson.ObjectId `bson:"versions" json:"versions"`
}
type DeclarationPolitical struct {
	Declaration   `bson:",inline"`
	PoliticalData `bson:",inline"`
}

// DeclarationEnhanced extends Declaration
// to include download link for declarations and other
// stuff.
// Not intended to be stored in db but to return in REST calls.
type DeclarationEnhanced struct {
	DeclarationPolitical
	UrlFileOrig string `json:"filename_url"`
	UrlFileRect string `json:"filename_rectification_url"`
}

type Group struct {
	Name    string `bson:"name" json:"name"`
	Acronym string `bson:"acronym" json:"acronym"`
	//Onane   string `bson:"oname" json:"oname"`
}
type PoliticalData struct {
	Role string `bson:"incarico" json:"incarico"`
	// Only for parliamentary and senate.
	Group Group `bson:"gruppo" json:"gruppo"`
	//ElectionDistrict string `bson:"circoscrizione" json:"circoscrizione"`
	Occupation string `bson:"professione" json:"professione"`
	Sex        string `bson:"sesso" json:"sesso"`
}

//============== Openpolis API

// OpResponse models response from Op api.
type OpResponse struct {
	Next    string                   `json:"next"`
	Results []map[string]interface{} `json:"results"`
}

// TBRPolarPoint models a single point in a polar pie widget.
// It can be passed also for other pies (radius is ignored).
// Different categories have different color but different IDs in same category haven't.
type TBPolarPoint struct {
	ID       string  `json:"id"`
	Value    float64 `json:"value"`
	Category string  `json:"category"`
	Radius   int     `json:"radius"`
}

// TBItem models a single TB item aka a widget.
type TBItem struct {
	ID   string      `json:"id"`
	Tip  string      `json:"tip"`
	Data interface{} `json:"data"`
}

// TBDashTest models JSON response for TadaBoard test dashboard.
// required tag is used by swagger for documentation.
type TBDashTest struct {
	Status    bool              `json:"status,required"`
	Error     error             `json:"error"`
	Timestamp int64             `json:"timestamp"`
	ID        string            `json:"id"`
	Query     map[string]string `json:"query"`
	Items     []TBItem          `json:"item"`
}

// TBReq models single request made by TB.
//[STRACER] 09:56:54.738290 decoded tbreq: map[url:http://patrimoni.staging.openpolis.it/api/tdb/test query:map[provincia_residenza:vt] token: method:GET customQuery:]
type TBReq struct {
	ID          string `json:"id"`
	Method      string `json:"method"`
	CustomQuery string `json:"customQuery"`
	URL         string `json:"url"`
	// why not interface{}? Becuause TB passes everything as string :(
	Query map[string]string `json:"query"`
	Token string            `json:"token"`
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
