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
		{ $match: { "anno_dichiarazione": 2014, "amministrazioni_soc": { $not: {$size: 0} } } },

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

print( "istituzione", ",", "incarico", ",", "totale"),
result.forEach( function(i) {
          print( i._id.istituzione, ",", i._id.incarico, ",", i.count);
});

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
