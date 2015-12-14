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

		{ $unwind: "$incarichi"},
		{ $group: {
                _id : { op_id: "$op_id", istituzione: "$incarichi.istituzione" },
               beni_mobili: { $last: "$beni_mobili" }
              }
    },
		{ $unwind: "$beni_mobili"},
    { $match: { "beni_mobili.persona": "dichiarante" } },
		{ $group: {
                _id : { tipologia: "$beni_mobili.tipologia", istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1, "_id.tipologia":-1 }}
);

print( "istituzione", ",", "tipologia", ",", "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i._id.tipologia, ",", i.count);
});

result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},

		{ $unwind: "$incarichi"},
		{ $unwind: "$beni_mobili"},
    { $match: { "beni_mobili.persona": "dichiarante" } },
		{ $group: {
                 _id: { op_id:"$op_id", tipologia: "$beni_mobili.tipologia", istituzione: "$incarichi.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $group: {
                 _id: { count: "$count", tipologia: "$_id.tipologia", istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1, "_id.tipologia":-1, "_id.count":-1 }}
);

print( "istituzione", ",", "tipologia", ",", "numero", ",", "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i._id.tipologia, ",", i._id.count, ",", i.count);
});

// hanno campi vuoti
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},

		{ $unwind: "$incarichi"},
		{ $group: {
                _id : { op_id: "$op_id", istituzione: "$incarichi.istituzione" },
               nome: { $last: "$nome" },
               cognome: { $last: "$cognome" },
               beni_mobili: { $last: "$beni_mobili" }
              }
    },
		{ $unwind: "$beni_mobili"},
    { $match: { "beni_mobili.persona": "dichiarante" } },
		{ $match: { "beni_mobili.tipologia": { $eq: ""}}},
		{ $group: {
                _id : { op_id:"$_id.op_id", nome: "$nome", cognome: "$cognome"},
              }
    }
);

print("hanno campi vuoti");
result.forEach( function(i) {
          print(i._id.op_id, ",", i._id.nome, ",", i._id.cognome);
});
