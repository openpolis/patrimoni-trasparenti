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
		{ $match: {"anno_dichiarazione": 2014}},
		{ $unwind: "$incarichi"},
		{ $group: {
               _id : {istituzione: "$incarichi.istituzione", indice_completezza: "$indice_completezza"},
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1, "count":-1}}
);

resultsArray = result.toArray();

print( "istituzione", ",", "indice_completezza", ",", "totale");
resultsArray.forEach( function(i) {
          print( i._id.istituzione, ",", i._id.indice_completezza, ",", i.count);
});
