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

// distribuzione incarichi per istituzione
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
    // group multiple role for a same politician
		{ $group: {
                _id : { op_id: "$_id.op_id", incarico: "$amministrazioni_soc.natura_incarico" },
                istituzione: { $last: "$_id.istituzione" },
              }
    },
		{ $group: {
                _id : { istituzione: "$istituzione", incarico: "$_id.incarico" },
                count: { $sum: 1},
              }
    },
		{ $sort: {"_id.istituzione":-1, "count":-1}}
);
print( "istituzione", ",", "incarico", ",", "totale"),
result.forEach( function(i) {
          print( i._id.istituzione, ",", i._id.incarico, ",", i.count);
});
// governo
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
    // group multiple role for a same politician
		{ $group: {
                _id : { op_id: "$_id.op_id", incarico: "$amministrazioni_soc.natura_incarico" },
                istituzione: { $last: "$_id.istituzione" },
              }
    },
		{ $group: {
                _id : { istituzione: "$istituzione", incarico: "$_id.incarico" },
                count: { $sum: 1},
              }
    },
		{ $sort: {"_id.istituzione":-1, "count":-1}}
);
print( "istituzione", ",", "incarico", ",", "totale"),
result.forEach( function(i) {
          print( i._id.istituzione, ",", i._id.incarico, ",", i.count);
});

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

// hanno annotazioni in amministrazioni_soc
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
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
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
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
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
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
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
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
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

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
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
