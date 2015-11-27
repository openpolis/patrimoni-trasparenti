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
		{ $group: {
                _id : {gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione" },
               count: { $sum: 1},
              }
    },
		{ $sort: {"_id.gruppo":-1, "_id.istituzione":-1}}
);

print( "gruppo", ",", "istituzione", ",", "totale"),
result.forEach( function(i) {
          print( i._id.gruppo, ",", i._id.istituzione, ",", i.count);
});
