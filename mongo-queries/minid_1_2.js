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

//_id : {gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione", indice_completezza: "$indice_completezza"},
result = db['all'].aggregate(
		{ $match: {"anno_dichiarazione": 2014}},
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $group: {
                _id : {op_id: "$op_id", gruppo: "$incarichi.gruppo.acronym", indice_completezza: "$indice_completezza"},
               roles_count: { $sum: 1}
              }
    },
		{ $group: {
                _id : {gruppo: "$_id.gruppo", indice_completezza: "$_id.indice_completezza"},
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.gruppo":-1, "_id.indice_completezza": 1}}
);

// debug
result = db['all'].aggregate(
		{ $match: {"anno_dichiarazione": 2014}},
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $group: {
                _id : {op_id: "$op_id", gruppo: "$incarichi.gruppo.acronym", indice_completezza: "$indice_completezza"},
               roles_count: { $sum: 1}
              }
    },
		{ $sort: {"_id.op_id":-1}}
);
print( "op_id" );
resultsArray.forEach( function(i) {
          print( i._id.op_id );
});

result = db['all'].aggregate(
		{ $match: {"anno_dichiarazione": 2014}},
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
		{ $match: { "incarichi.partito.acronym": { $ne: ""}}},
		{ $group: {
                _id : {op_id: "$op_id", partito: "$incarichi.partito.acronym", indice_completezza: "$indice_completezza"},
              }
    },
		{ $group: {
                _id : { partito: "$_id.partito", indice_completezza: "$_id.indice_completezza"},
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.partito": -1 ,"_id.indice_completezza": -1}}
);


print("governo");
print( "partito", ",", "indice_completezza", ",", "totale");
result.forEach( function(i) {
          print( i._id.partito, ",", i._id.indice_completezza, ",", i.count);
});

// chi sono i tecnici
result = db['all'].aggregate(
		{ $match: {"anno_dichiarazione": 2014}},
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
		{ $match: { "incarichi.partito.acronym": { $eq: ""}}}
);


print("governo");
print( "partito", ",", "indice_completezza", ",", "totale");
result.forEach( function(i) {
          print( i.op_id, ",", i.nome, ",", i.cognome);
});
