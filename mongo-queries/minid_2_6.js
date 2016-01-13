// use mongo host.tlb/database script.js
// and db will be populated
//conn = new Mongo("mongo30")
//var db = conn.getDB("dossier-incomes");
var data = db['all'].find();

print("######################################")
print("Total document in the collection:" + data.count());
print("######################################")
print( "Starting analysis");
print("######################################")

// === mapping dictionary
var mapping = {};
mapping["consigliere"]="consigliere di amministrazione";
mapping["consigliere di amministrazione"]="consigliere di amministrazione";
mapping["consigliere amministrazione"]="consigliere di amministrazione";
mapping["consigliere d'amministrazione"]="consigliere di amministrazione";
mapping["membro del cda"]="consigliere di amministrazione";
mapping["consigliere di amministrazione"]="consigliere di amministrazione";
mapping["consigliere"]="consigliere di amministrazione";
mapping["consigliere"]="consigliere di amministrazione";
mapping["consigliere di amministrazione"]="consigliere di amministrazione";
mapping["consigliere di aministrazione"]="consigliere di amministrazione";
mapping["consigliere d'amministrazione"]="consigliere di amministrazione";
mapping["consigliere cda"]="consigliere di amministrazione";
mapping["menbro consiglio amministrazione"]="consigliere di amministrazione";
mapping["membro consiglio amministrazione"]="consigliere di amministrazione";
mapping["membro cda"]="consigliere di amministrazione";
mapping["consigliere del cda"]="consigliere di amministrazione";
mapping["consigliere del consiglio di aministrazione"]="consigliere di amministrazione";
mapping["consigliere di ammnistrazione"]="consigliere di amministrazione";
mapping["consigliere delegato"]="consigliere di amministrazione";
mapping["consigliere cda"]="consigliere di amministrazione";
mapping["menbro consiglio amministrazione"]="consigliere di amministrazione";
mapping["membro cda"]="consigliere di amministrazione";
mapping["consigliere del cda"]="consigliere di amministrazione";
mapping["consigliere del consiglio di aministrazione"]="consigliere di amministrazione";
mapping["consigliere di ammnistrazione"]="consigliere di amministrazione";
mapping["membro consiglio di amministrazione"]="consigliere di amministrazione";
mapping["consigliere - non esecutivo"]="consigliere di amministrazione";
mapping["consigliere senza deleghe"]="consigliere di amministrazione";
mapping["consigliere senza poteri"]="consigliere di amministrazione";
mapping["presidente consiglio di amministrazione"]="presidente";
mapping["presidente"]="presidente";
mapping["presidente del consiglio di amministrazione"]="presidente";
mapping["vice presidente"]="vicepresidente";
mapping["vice presidente cda"]="vicepresidente";
mapping["vice presidente del consiglio di amministrazione"]="vicepresidente";
mapping["presidente vicario"]="vicepresidente";
mapping["vice presidente consiglio di amministrazione"]="vicepresidente";
mapping["vice presidente consiglio di amministrazione"]="vicepresidente";
mapping["vice presidente"]="vicepresidente";
mapping["vice presidente cda - non esecutivo"]="vicepresidente";
mapping["presidente cda"]="presidente";
mapping["presidente"]="presidente";
mapping["presidente consiglio di amministrazione"]="presidente";
mapping["presindente cda"]="presidente";
mapping["Presidente"]="presidente";
mapping["presidente del consiglio di amministrazione"]="presidente";
mapping["presiente"]="presidente";
mapping["chairman"]="presidente";
mapping["presidente nazionale"]="presidente";
mapping["amministraore unico"]="amministratore unico";
mapping["amministratore unico"]="amministratore unico";
mapping["liquidatore volontario"]="liquidatore";
mapping["liquidatore"]="liquidatore";
mapping["presidente consiglio sindacale"]="presidente consiglio di sorveglianza";
mapping["presidente collegio sindacale"]="presidente consiglio di sorveglianza";
mapping["presidente del collegio sindacale"]="presidente consiglio di sorveglianza";
mapping["presidente del collegio"]="presidente consiglio di sorveglianza";
mapping["presidente consiglio di sorveglianza"]="presidente consiglio di sorveglianza";
mapping["presidente consiglio sindacale"]="presidente consiglio di sorveglianza";
mapping["socio amministratore"]="amministratore delegato";
mapping["amministratore"]="amministratore delegato";
mapping["coamministratore"]="amministratore delegato";
mapping["socio accomandatario"]="accomandatario";
mapping["componente organo di vigilanza"]="componente consiglio di sorveglianza";
mapping["legale rappresentate"]="legale rappresentante";
mapping["legale rappresentante"]="legale rappresentante";
mapping["amministratore straordinario"]="amministratore delegato";
mapping["titolare"]="titolare";
mapping["legale rappresentante"]="titolare";
mapping["socio accomandatario amministratore"]="accomandatario";
mapping["socio accomandatario"]="accomandatario";
mapping["membro di diritto"]="membro di diritto";
mapping["socio paritario"]="socio paritario";
mapping["amministratore e socio unico"]="amministratore e socio unico";
mapping["socio accomandante"]="socio accomandante";
mapping["consigliere di gestione"]="consigliere di gestione";
mapping["amministratore delegato"]="amministratore delegato";
mapping["dirigente"]="dirigente";
mapping["socio lavoratore"]="socio lavoratore";
mapping["membro di diritto"]="membro di diritto";
mapping["sindaco"]="componente consiglio di sorveglianza";
mapping["socio paritario"]="socio paritario";
mapping["amministratore e socio unico"]="amministratore e socio unico";
mapping["vice presidente cda - non esecutivo"]= "vicepresidente";
mapping["socio accomandante"]="socio accomandante";
mapping["consigliere del consiglio di aministrazione "]="consigliere di amministrazione";
mapping["legale rappresentante - titolare"]="titolare";
mapping["consigliere di gestione"]="consigliere di gestione";
mapping["accomandatario"]="accomandatario";
mapping["vice presidente cda - non esecutivo"]="vicepresidente";
mapping["vice presidente cda - non esecutivo "]="vicepresidente";
mapping["titolare - legale rappresentante"]="titolare";
mapping["membro del gruppo italiano e della membership internazionale"]="membro del gruppo italiano e della membership internazionale";

//for(var key in mapping) print(mapping[key]);

function applyMapping(list) {
  for (var i in list) {
    role = list[i]._id["incarico"]
    list[i].mappedKey = mapping[role]
    //print(list[i].mappedKey, list[i]._id["incarico"], "X")
    //print(tojson(list[i]))
  };
};

function merge(list, institution) {
  mergerdData= {}
  // initialize object
  for (var i in list) {
    key = list[i].mappedKey
    inst = list[i]._id.istituzione
    if (inst === institution) {
      mergerdData[key] = 0
      //mergerdData.istituzione = list[i]._id.istituzione
    }
  };
  for (var i in list) {
    key = list[i].mappedKey
    inst = list[i]._id.istituzione
    if (inst === institution) {
      mergerdData[key] += list[i].count
      //mergerdData.istituzione = list[i]._id.istituzione
    }
  };
  //for (var k in mergerdData) print("[DEBUG]",k,mergerdData[k]);
  return mergerdData
};
//====

// distribuzione incarichi per istituzione, gli incarichi sono contati più volte per singolo
// camera
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $unwind: "$incarichi"},
		{ $group: {
                _id : { op_id:"$op_id", istituzione: "$incarichi.istituzione" },
               amministrazioni_soc: { $last: "$amministrazioni_soc"},
              }
    },
		{ $unwind: "$amministrazioni_soc"},
    { $match: { "amministrazioni_soc.persona": "dichiarante" } },
		{ $group: {
                _id : { istituzione: "$_id.istituzione", incarico: "$amministrazioni_soc.natura_incarico" },
                count: { $sum: 1},
              }
    },
		{ $sort: {"_id.istituzione":-1, "count":-1}}
);

result=result.toArray();
// === apply mappping
applyMapping(result);
print("camera - numero di incarichi - con mapping")
mergerdDataCamera = merge(result, "camera");
for (var k in mergerdDataCamera) print(k, ",", mergerdDataCamera[k]);
print("senato - numero incarichi - con mapping")
mergerdDataSenato = merge(result, "senato");
for (var k in mergerdDataSenato) print(k, ",", mergerdDataSenato[k]);

print( "istituzione", ",", "incarico", ",", "totale"),
result.forEach( function(i) {
          print( i._id.istituzione, ",", i._id.incarico, ",", i.count);
});
// ---------
// distribuzione incarichi per istituzione
// nomi
// camera
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $unwind: "$incarichi"},
		{ $group: {
                _id : { op_id:"$op_id", istituzione: "$incarichi.istituzione" },
               cognome: { $last: "$cognome"},
               amministrazioni_soc: { $last: "$amministrazioni_soc"}
              }
    },
		{ $unwind: "$amministrazioni_soc"},
    { $match: { "amministrazioni_soc.persona": "dichiarante" } },
    // group multiple role for a same politician
		{ $group: {
                _id : { op_id: "$_id.op_id", incarico: "$amministrazioni_soc.natura_incarico" },
                cognome: { $last: "$cognome"},
                istituzione: { $last: "$_id.istituzione" }
              }
    },
		{ $sort: {"istituzione":-1}}
);

result=result.toArray();
// === apply mappping
applyMapping(result);
print("camera/senato - nomi di politici che hanno un certo tipo di incarico - con mapping")
for (var k in result) {
  print(result[k]._id.op_id,",", result[k].istituzione, ",", result[k].cognome, ",", result[k].mappedKey);
}

// governo
// distribuzione incarichi per istituzione, gli incarichi sono contati più volte
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
		{ $group: {
                _id : { op_id:"$op_id", istituzione: "$incarichi.istituzione" },
               amministrazioni_soc: { $last: "$amministrazioni_soc"},
              }
    },
		{ $unwind: "$amministrazioni_soc"},
    { $match: { "amministrazioni_soc.persona": "dichiarante" } },
		{ $group: {
                _id : { istituzione: "$_id.istituzione", incarico: "$amministrazioni_soc.natura_incarico" },
                count: { $sum: 1},
              }
    },
		{ $sort: {"_id.istituzione":-1, "count":-1}}
);
result=result.toArray();
// === apply mappping
applyMapping(result);
print("governo - numero di politici che hanno un certo tipo di incarico - con mapping")
mergerdDataGoverno = merge(result, "governo");
for (var k in mergerdDataGoverno) print(k, ",", mergerdDataGoverno[k]);

print( "istituzione", ",", "incarico", ",", "totale"),
result.forEach( function(i) {
          print( i._id.istituzione, ",", i._id.incarico, ",", i.count);
});
// distribuzione incarichi per istituzione
// nomi
// governo
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
		{ $group: {
                _id : { op_id:"$op_id", istituzione: "$incarichi.istituzione" },
               cognome: { $last: "$cognome"},
               amministrazioni_soc: { $last: "$amministrazioni_soc"}
              }
    },
		{ $unwind: "$amministrazioni_soc"},
    { $match: { "amministrazioni_soc.persona": "dichiarante" } },
    // group multiple role for a same politician
		{ $group: {
                _id : { op_id: "$_id.op_id", incarico: "$amministrazioni_soc.natura_incarico" },
                cognome: { $last: "$cognome"},
                istituzione: { $last: "$_id.istituzione" }
              }
    },
		{ $sort: {"istituzione":-1, "count":-1}}
);

result=result.toArray();
// === apply mappping
applyMapping(result);
print("governo - nomi di politici che hanno un certo tipo di incarico - con mapping")
for (var k in result) print(result[k]._id.op_id, ",", result[k].cognome, ",", result[k].mappedKey);

//==== natura_incarico vuoto
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

		{ $unwind: "$amministrazioni_soc"},
    { $match: { "amministrazioni_soc.persona": "dichiarante" } },
		{ $match: { "amministrazioni_soc.natura_incarico": { $eq: ""}}},
		{ $group: {
                _id : { op_id:"$op_id", nome: "$nome", cognome: "$cognome"},
               count: { $sum: 1},
              }
    },
		{ $sort: {"_id.istituzione":-1, "count":-1}}
);

print( "natura_incarico vuoto"),
result.forEach( function(i) {
          print( i._id.op_id, ",", i._id.nome, ",", i._id.cognome);
});

// ==== hanno annotazioni in amministrazioni_soc
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

		{ $unwind: "$amministrazioni_soc"},
    { $match: { "amministrazioni_soc.persona": "dichiarante" } },
		{ $match: { "amministrazioni_soc.annotazioni": { $ne: ""}}},
		{ $group: {
                _id : { op_id:"$op_id", nome: "$nome", cognome: "$cognome"},
               count: { $sum: 1},
              }
    },
		{ $sort: {"_id.istituzione":-1, "count":-1}}
);

print( "amministrazioni_soc con annotazioni"),
result.forEach( function(i) {
          print( i._id.op_id, ",", i._id.nome, ",", i._id.cognome);
});

// distribuzionei incarichi amministrazioni_soc
// camera
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

		{ $unwind: "$amministrazioni_soc"},
    { $match: { "amministrazioni_soc.persona": "dichiarante" } },
    // calcola numero degli incarichi
		{ $group: {
                _id : { op_id:"$op_id"},
                incarichi: { $last: "$incarichi"},
                count: { $sum: 1}
              }
    },
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $unwind: "$incarichi"},
    // filter multiple roles
		{ $group: {
                _id : {op_id: "$_id.op_id", istituzione: "$incarichi.istituzione"},
                count: { $last: "$count"}
              }
    },
		{ $group: {
                 _id: { count: "$count", istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1, "_id.count":-1}}
);

print( "Distribuzione numero incarichi in amministrazioni_soc camera"),
print( "istituzione", ",", "numero incarichi", ",", "totale"),
result.forEach( function(i) {
          print( i._id.istituzione, ",", i._id.count, ",", i.count);
});

// distribuzionei incarichi amministrazioni_soc
// governo 
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

		{ $unwind: "$amministrazioni_soc"},
    { $match: { "amministrazioni_soc.persona": "dichiarante" } },
    // calcola numero degli incarichi
		{ $group: {
                _id : { op_id:"$op_id"},
                incarichi: { $last: "$incarichi"},
                count: { $sum: 1}
              }
    },
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
    // filter multiple roles
		{ $group: {
                _id : {op_id: "$_id.op_id", istituzione: "$incarichi.istituzione"},
                count: { $last: "$count"}
              }
    },
		{ $group: {
                 _id: { count: "$count", istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1, "_id.count":-1}}
);

print( "Distribuzione numero incarichi in amministrazioni_soc governo"),
print( "istituzione", ",", "numero incarichi", ",", "totale"),
result.forEach( function(i) {
          print( i._id.istituzione, ",", i._id.count, ",", i.count);
});

// singolo incarico amministrazioni_soc
// camera
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

		{ $unwind: "$amministrazioni_soc"},
    { $match: { "amministrazioni_soc.persona": "dichiarante" } },
    // calcola numero degli incarichi
		{ $group: {
                _id : { op_id:"$op_id"},
                incarichi: { $last: "$incarichi"},
                count: { $sum: 1}
              }
    },
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $unwind: "$incarichi"},
    // filter multiple roles
		{ $group: {
                _id : {op_id: "$_id.op_id", istituzione: "$incarichi.istituzione"},
                count: { $last: "$count"}
              }
    },
		{ $group: {
                 _id: { count: "$count", istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
    { $match: { "_id.count": {$eq:1}}},
		{ $sort: {"_id.istituzione":-1, "_id.count":-1}}
);

print( "Numero singoli incarichi in amministrazioni_soc camera"),
print( "istituzione", ",", "numero incarichi", ",", "totale"),
result.forEach( function(i) {
          print( i._id.istituzione, ",", i._id.count, ",", i.count);
});
//
// singolo incarico amministrazioni_soc
// governo
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

		{ $unwind: "$amministrazioni_soc"},
    { $match: { "amministrazioni_soc.persona": "dichiarante" } },
    // calcola numero degli incarichi
		{ $group: {
                _id : { op_id:"$op_id"},
                incarichi: { $last: "$incarichi"},
                count: { $sum: 1}
              }
    },
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
    // filter multiple roles
		{ $group: {
                _id : {op_id: "$_id.op_id", istituzione: "$incarichi.istituzione"},
                count: { $last: "$count"}
              }
    },
		{ $group: {
                 _id: { count: "$count", istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
    { $match: { "_id.count": {$eq:1}}},
		{ $sort: {"_id.istituzione":-1, "_id.count":-1}}
);

print( "Numero singoli incarichi in amministrazioni_soc governo"),
print( "istituzione", ",", "numero incarichi", ",", "totale"),
result.forEach( function(i) {
          print( i._id.istituzione, ",", i._id.count, ",", i.count);
});

// incarichi multipli amministrazioni_soc
// camera
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

		{ $unwind: "$amministrazioni_soc"},
    { $match: { "amministrazioni_soc.persona": "dichiarante" } },
    // calcola numero degli incarichi
		{ $group: {
                _id : { op_id:"$op_id"},
                incarichi: { $last: "$incarichi"},
                count: { $sum: 1}
              }
    },
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $unwind: "$incarichi"},
    // filter multiple roles
		{ $group: {
                _id : {op_id: "$_id.op_id", istituzione: "$incarichi.istituzione"},
                count: { $last: "$count"}
              }
    },
		{ $group: {
                 _id: { count: "$count", istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
    { $match: { "_id.count": {$gt:1}}},
		{ $group: {
                 _id: { istituzione: "$_id.istituzione" },
               count: { $sum: "$count"}
              }
    },
		{ $sort: {"_id.istituzione":-1, "count":-1}}
);

print( "Incarichi multipli in amministrazioni_soc camera"),
print( "istituzione", ",", "totale"),
result.forEach( function(i) {
          print( i._id.istituzione, ",", i.count);
});
// incarichi multipli amministrazioni_soc, nomi
// camera
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

		{ $unwind: "$amministrazioni_soc"},
    { $match: { "amministrazioni_soc.persona": "dichiarante" } },
    // calcola numero degli incarichi
		{ $group: {
                _id : { op_id:"$op_id"},
                incarichi: { $last: "$incarichi"},
                nome: { $last: "$nome" },
                cognome: { $last: "$cognome" },
                count: { $sum: 1}
              }
    },
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $unwind: "$incarichi"},
    // filter multiple roles
		{ $group: {
                _id : {op_id: "$_id.op_id", istituzione: "$incarichi.istituzione"},
                nome: { $last: "$nome" },
                cognome: { $last: "$cognome" },
                count: { $last: "$count"}
              }
    },
    { $match: { "count": {$gt:6}}},
		{ $sort: {"_id.istituzione":-1, "count":-1}}
);

print( "Incarichi multipli in amministrazioni_soc camera, nomi"),
print( "op_id,", "istituzione,", "cognome,", "totale");
result.forEach( function(i) {
          print( i._id.op_id, ",", i._id.istituzione ,",", i.cognome , ",", i.count);
});
// incarichi multipli amministrazioni_soc, nomi
// governo
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

		{ $unwind: "$amministrazioni_soc"},
    { $match: { "amministrazioni_soc.persona": "dichiarante" } },
    // calcola numero degli incarichi
		{ $group: {
                _id : { op_id:"$op_id"},
                incarichi: { $last: "$incarichi"},
                nome: { $last: "$nome" },
                cognome: { $last: "$cognome" },
                count: { $sum: 1}
              }
    },
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
    // filter multiple roles
		{ $group: {
                _id : {op_id: "$_id.op_id", istituzione: "$incarichi.istituzione"},
                nome: { $last: "$nome" },
                cognome: { $last: "$cognome" },
                count: { $last: "$count"}
              }
    },
    { $match: { "count": {$gt:5}}},
		{ $sort: {"_id.istituzione":-1, "count":-1}}
);

print( "Incarichi multipli in amministrazioni_soc governo, nomi"),
print( "op_id,", "istituzione,", "cognome,", "totale");
result.forEach( function(i) {
          print( i._id.op_id, ",", i._id.istituzione ,",", i.cognome , ",", i.count);
});


// incarichi multipli amministrazioni_soc
// governo
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

		{ $unwind: "$amministrazioni_soc"},
    { $match: { "amministrazioni_soc.persona": "dichiarante" } },
    // calcola numero degli incarichi
		{ $group: {
                _id : { op_id:"$op_id"},
                incarichi: { $last: "$incarichi"},
                count: { $sum: 1}
              }
    },
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
    // filter multiple roles
		{ $group: {
                _id : {op_id: "$_id.op_id", istituzione: "$incarichi.istituzione"},
                count: { $last: "$count"}
              }
    },
		{ $group: {
                 _id: { count: "$count", istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
    { $match: { "_id.count": {$gt:1}}},
		{ $group: {
                 _id: { istituzione: "$_id.istituzione" },
               count: { $sum: "$count"}
              }
    },
		{ $sort: {"_id.istituzione":-1, "count":-1}}
);

print( "Incarichi multipli in amministrazioni_soc camera"),
print( "istituzione", ",", "totale"),
result.forEach( function(i) {
          print( i._id.istituzione, ",", i.count);
});

// chi amministra in governo
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

		{ $unwind: "$amministrazioni_soc"},
    { $match: { "amministrazioni_soc.persona": "dichiarante" } },
    // calcola numero degli incarichi
		{ $group: {
                _id : { op_id:"$op_id"},
                incarichi: { $last: "$incarichi"},
                count: { $sum: 1}
              }
    },
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
    // filter multiple roles
		{ $group: {
                _id : {op_id: "$_id.op_id", istituzione: "$incarichi.istituzione"},
                count: { $last: "$count"}
              }
    }
);

print( "amministrazioni_soc nel governo"),
result.forEach( function(i) {
          print( i._id.op_id);
});

//===== estrazioni con nomi
// camera
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $unwind: "$incarichi"},
		{ $group: {
                _id : { op_id:"$op_id", istituzione: "$incarichi.istituzione" },
                amministrazioni_soc: { $last: "$amministrazioni_soc"},
                nome: { $last: "$nome" },
                cognome: { $last: "$cognome" }
              }
    },
		{ $unwind: "$amministrazioni_soc"},
    { $match: { "amministrazioni_soc.persona": "dichiarante" } },
		{ $group: {
                _id : { op_id: "$_id.op_id", incarico: "$amministrazioni_soc.natura_incarico" },
                istituzione: { $last: "$_id.istituzione" },
                cognome: { $last: "$cognome" },
                count: { $sum: 1}
              }
    },
		{ $sort: {"istituzione":-1, "_id.incarico":-1}}
);

print( "op_id,", "istituzione,", "cognome,", "incarico,", "totale");
result.forEach( function(i) {
          print( i._id.op_id, ",", i.istituzione ,",", i.cognome , ",", i._id.incarico, ",", i.count);
});

// governo
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
		{ $group: {
                _id : { op_id:"$op_id", istituzione: "$incarichi.istituzione" },
                amministrazioni_soc: { $last: "$amministrazioni_soc"},
                nome: { $last: "$nome" },
                cognome: { $last: "$cognome" }
              }
    },
		{ $unwind: "$amministrazioni_soc"},
    { $match: { "amministrazioni_soc.persona": "dichiarante" } },
		{ $group: {
                _id : { op_id: "$_id.op_id", incarico: "$amministrazioni_soc.natura_incarico" },
                istituzione: { $last: "$_id.istituzione" },
                cognome: { $last: "$cognome" },
                count: { $sum: 1}
              }
    },
		{ $sort: {"istituzione":-1, "_id.incarico":-1}}
);

print( "op_id,", "istituzione,", "cognome,", "incarico,", "totale");
result.forEach( function(i) {
          print( i._id.op_id, ",", i.istituzione ,",", i.cognome , ",", i._id.incarico, ",", i.count);
});


// ======= più di due incarichi
// camera
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

		{ $unwind: "$amministrazioni_soc"},
    { $match: { "amministrazioni_soc.persona": "dichiarante" } },
    // calcola numero degli incarichi
		{ $group: {
                _id : { op_id:"$op_id"},
                incarichi: { $last: "$incarichi"},
                nome: { $last: "$nome" },
                cognome: { $last: "$cognome" },
                count: { $sum: 1}
              }
    },
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $unwind: "$incarichi"},
    // filter multiple roles
		{ $group: {
                _id : {op_id: "$_id.op_id", istituzione: "$incarichi.istituzione"},
                nome: { $last: "$nome" },
                cognome: { $last: "$cognome" },
                count: { $last: "$count"}
              }
    },
    { $match: { "count": {$gt:2}}},
		{ $sort: {"_id.istituzione":-1, "count":-1}}
);

print( "più di 2 incarichi in amministrazioni_soc camera, nomi"),
print( "op_id,", "istituzione,", "cognome,", "totale");
result.forEach( function(i) {
          print( i._id.op_id, ",", i._id.istituzione ,",", i.cognome , ",", i.count);
});
// governo
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

		{ $unwind: "$amministrazioni_soc"},
    { $match: { "amministrazioni_soc.persona": "dichiarante" } },
    // calcola numero degli incarichi
		{ $group: {
                _id : { op_id:"$op_id"},
                incarichi: { $last: "$incarichi"},
                nome: { $last: "$nome" },
                cognome: { $last: "$cognome" },
                count: { $sum: 1}
              }
    },
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
    // filter multiple roles
		{ $group: {
                _id : {op_id: "$_id.op_id", istituzione: "$incarichi.istituzione"},
                nome: { $last: "$nome" },
                cognome: { $last: "$cognome" },
                count: { $last: "$count"}
              }
    },
    { $match: { "count": {$gt:2}}},
		{ $sort: {"_id.istituzione":-1, "count":-1}}
);

print( "più di 2 incarichi in amministrazioni_soc governo, nomi"),
print( "op_id,", "istituzione,", "cognome,", "totale");
result.forEach( function(i) {
          print( i._id.op_id, ",", i._id.istituzione ,",", i.cognome , ",", i.count);
});
