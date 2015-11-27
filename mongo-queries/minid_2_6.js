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
		{ $unwind: "$amministrazioni_soc"},
		{ $group: {
                _id : { istituzione: "$incarichi.istituzione", incarico: "$amministrazioni_soc.natura_incarico" },
               count: { $sum: 1},
              }
    },
		{ $sort: {"_id.istituzione":-1, "count":-1}}
);

print( "istituzione", ",", "incarico", ",", "totale"),
result.forEach( function(i) {
          print( i._id.istituzione, ",", i._id.incarico, ",", i.count);
});
