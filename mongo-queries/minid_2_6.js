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
