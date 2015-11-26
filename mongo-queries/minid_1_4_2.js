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
                _id : {gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione", dichiarazione_elettorale: "$dichiarazione_elettorale"},
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.gruppo":-1, "_id.istituzione":-1}}
);

resultsArray = result.toArray();

print( "gruppo", ",", "istituzione", ",", "dichiarazione_elettorale", ",", "totale");
resultsArray.forEach( function(i) {
          print( i._id.gruppo, ",", i._id.istituzione, ",", i._id.dichiarazione_elettorale, ",", i.count);
});
