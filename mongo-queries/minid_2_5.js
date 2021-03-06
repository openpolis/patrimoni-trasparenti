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
		{ $match: { "anno_dichiarazione": 2014, "partecipazioni_soc": { $not: {$size: 0} } } },

		{ $unwind: "$incarichi"},
		{ $unwind: "$partecipazioni_soc"},
    { $match: { "partecipazioni_soc.persona": "dichiarante" } },
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $group: {
                _id : { op_id: "$op_id", gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione" },
              }
    },
		{ $group: {
                _id : {gruppo: "$_id.gruppo", istituzione: "$_id.istituzione" },
               count: { $sum: 1},
              }
    },
		{ $sort: {"_id.gruppo":-1, "_id.istituzione":-1}}
);

print( "gruppo", ",", "istituzione", ",", "totale"),
result.forEach( function(i) {
          print( i._id.gruppo, ",", i._id.istituzione, ",", i.count);
});

result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "partecipazioni_soc": { $not: {$size: 0} } } },

		{ $unwind: "$incarichi"},
		{ $unwind: "$partecipazioni_soc"},
    { $match: { "partecipazioni_soc.persona": "dichiarante" } },
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
		{ $match: { "incarichi.partito.acronym": { $ne: ""}}},
		{ $group: {
                _id : { op_id: "$op_id", partito: "$incarichi.partito.acronym", istituzione: "$incarichi.istituzione" },
              }
    },
		{ $group: {
                _id : {partito: "$_id.partito", istituzione: "$_id.istituzione" },
               count: { $sum: 1},
              }
    },
		{ $sort: {"_id.partito":-1, "_id.istituzione":-1}}
);

print( "partito", ",", "istituzione", ",", "totale"),
result.forEach( function(i) {
          print( i._id.partito, ",", i._id.istituzione, ",", i.count);
});
