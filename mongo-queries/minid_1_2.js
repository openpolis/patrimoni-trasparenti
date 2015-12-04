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
print( "gruppo", ",", "indice_completezza", ",", "totale");
result.forEach( function(i) {
  print( i._id.gruppo, ",", i._id.indice_completezza, ",", i.count);
});

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
  { $sort: {"_id.op_id": 1}}
);
//print( "op_id" );
//result.forEach( function(i) {
//            print( i._id.op_id );
//});

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

// chi sono i tecnici (partito acronym vuoto)
result = db['all'].aggregate(
		{ $match: {"anno_dichiarazione": 2014}},
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
		{ $match: { "incarichi.partito.acronym": { $eq: ""}}}
);


print("chi ha acronimo partito vuoto");
result.forEach( function(i) {
          print( i.op_id, ",", i.nome, ",", i.cognome);
});

result = db['all'].aggregate(
		{ $match: {"anno_dichiarazione": 2014}},
		{ $unwind: "$incarichi"},
		{ $group: {
                _id : { op_id:"$op_id", istituzione: "$incarichi.istituzione" },
              }
    },
		{ $match: { "_id.istituzione": { $ne: "camera"}}},
		{ $group: {
                _id : { op_id:"$_id.op_id"},
               count: { $sum: 1},
              }
    },
		{ $match: { "count": { $gt: 1}}}
);

print("chi sta al governo ed in senato");
result.forEach( function(i) {
          print( i._id.op_id, i.count );
});

result = db['all'].aggregate(
		{ $match: {"anno_dichiarazione": 2014}},
		{ $unwind: "$incarichi"},
		{ $group: {
                _id : { op_id:"$op_id", istituzione: "$incarichi.istituzione" },
              }
    },
		{ $match: { "_id.istituzione": { $ne: "senato"}}},
		{ $group: {
                _id : { op_id:"$_id.op_id"},
               count: { $sum: 1},
              }
    },
		{ $match: { "count": { $gt: 1}}}
);

print("chi sta al governo ed alla camera");
result.forEach( function(i) {
          print( i._id.op_id, i.count );
});
