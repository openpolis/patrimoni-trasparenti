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

result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},
    // il governo da parte
		{ $match: { "incarichi.istituzione": { $ne:"governo"}}},
		{ $unwind: "$incarichi"},
		{ $group: {
                _id : { op_id: "$op_id", istituzione: "$incarichi.istituzione" },
               beni_immobili: { $last: "$beni_immobili" }
              }
    },
		{ $unwind: "$beni_immobili"},
    { $match: { "beni_immobili.persona": "dichiarante" } },
		{ $group: {
                _id : { tipologia: "$beni_immobili.descrizione", istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1, "_id.tipologia":-1 }}
);

print( "istituzione", ",","tipologia", ",", "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i._id.tipologia, ",", i.count);
});

// solo governo
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
		{ $group: {
                _id : { op_id: "$op_id", istituzione: "$incarichi.istituzione" },
               beni_immobili: { $last: "$beni_immobili" }
              }
    },
		{ $unwind: "$beni_immobili"},
    { $match: { "beni_immobili.persona": "dichiarante" } },
		{ $group: {
                _id : { tipologia: "$beni_immobili.descrizione", istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1, "_id.tipologia":-1 }}
);

print( "istituzione", ",","tipologia", ",", "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i._id.tipologia, ",", i.count);
});

// parlamento
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "beni_immobili": { $not: {$size: 0} } } },
		{ $match: { "incarichi.istituzione": { $ne:"governo"}}},

		{ $unwind: "$beni_immobili"},
    { $match: { "beni_immobili.persona": "dichiarante" } },
		{ $unwind: "$incarichi"},
		{ $group: {
                _id : { op_id: "$op_id", istituzione: "$incarichi.istituzione" },
              }
    },
		{ $group: {
                _id : { istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1 }}
);

print("dichiarano beni immobili parlamento")
print( "istituzione", "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i.count);
});
//
// governo
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "beni_immobili": { $not: {$size: 0} } } },
		{ $match: { "incarichi.istituzione": { $eq:"governo"}}},

		{ $unwind: "$beni_immobili"},
    { $match: { "beni_immobili.persona": "dichiarante" } },
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq:"governo"}}},
		{ $group: {
                _id : { op_id: "$op_id", istituzione: "$incarichi.istituzione" },
              }
    },
		{ $group: {
                _id : { istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1 }}
);

print("dichiarano beni immobili governo")
print( "istituzione", "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i.count);
});

//
//
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "beni_immobili": { $not: {$size: 0} } } },
    // NOTE
    // "beni_immobili.$.rendita_catastale": { $ne: 0 } | match all
    // "beni_immobili.categoria_catastale": { $ne:  "" } | match also empty arrays, exclude them.
    { $match: { $or: [
                { "beni_immobili.categoria_catastale": { $ne:  "" } },
                { "beni_immobili.rendita_catastale": { $gt: 0 } },
                { "beni_immobili.reddito_agrario": { $gt: 0 } },
                { "beni_immobili.reddito_dominicale": { $gt: 0 } }
    ] } },

		{ $unwind: "$incarichi"},
		{ $unwind: "$beni_immobili"},
    { $match: { "beni_immobili.persona": "dichiarante" } },
		{ $group: {
                _id : { op_id: "$op_id", istituzione: "$incarichi.istituzione" },
              }
    },
		{ $group: {
                _id : { istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1 }}
);

print("specificano reddito_dominicale o rendita_catastale")
print( "istituzione", "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i.count);
});

// tipologia vuota
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},

		{ $unwind: "$beni_immobili"},
		{ $match: { "beni_immobili.descrizione": { $eq: "" } } },
    { $match: { "beni_immobili.persona": "dichiarante" } },
		{ $group: {
                _id : {op_id: "$op_id" },
                nome: { $last: "$nome" },
                cognome: { $last: "$cognome" }
              }
    }
);

print("no descrizione");
result.forEach( function(i) {
          print( i._id.op_id, ",", i.nome, ",", i.cognome);
});

result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},
		{ $match: { "incarichi.istituzione": { $eq:"camera"}}},
    { $match: { "beni_immobili.persona": "dichiarante" } },
		{ $match: { "beni_immobili.descrizione": { $eq:""}}}
);

resultsArray = result.toArray();
print("no descrizione alla camera");
print(resultsArray.length );
resultsArray.forEach( function(i) {
          print( i.op_id, ",", i.nome, ",", i.cognome);
});

// a chi corrispondono le occorrenze di "terreni" e "fabbricati"
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},

		{ $unwind: "$beni_immobili"},
    { $match: { "beni_immobili.persona": "dichiarante" } },
    { $match: { $or: [
      { "beni_immobili.descrizione": { $eq: "terreni"}},
      { "beni_immobili.descrizione": { $eq: "fabbricati"}}
    ]}},
		{ $group: {
                _id : {op_id: "$op_id" },
                nome: { $last: "$nome" },
                cognome: { $last: "$cognome" }
              }
    }
);

print("persone con le occorrenze di terreni e fabbricati");
result.forEach( function(i) {
          print( i._id.op_id, ",", i.nome, ",", i.cognome);
});

// a quanti corrispondono le occorrenze di "terreni" e "fabbricati"
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},

		{ $unwind: "$beni_immobili"},
    { $match: { "beni_immobili.persona": "dichiarante" } },
    { $match: { $or: [
      { "beni_immobili.descrizione": { $eq: "terreni"}},
      { "beni_immobili.descrizione": { $eq: "fabbricati"}}
    ]}},
		{ $group: {
                _id : {op_id: "$op_id" },
                nome: { $last: "$nome" },
                cognome: { $last: "$cognome" }
              }
    }
);

resultsArray = result.toArray();

print("numero di \"dichiarante\" con terreni e fabbricati");
print(resultsArray.length );

