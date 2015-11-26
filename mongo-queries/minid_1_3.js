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
		{ $group: {
                _id : {gruppo: "$incarichi.gruppo.acronym", indice_completezza: "$indice_completezza"},
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.gruppo":-1, "_id.indice_completezza": 1}}
);


print( "gruppo", ",", "indice_completezza", ",", "totale");
result.forEach( function(i) {
          print( i._id.gruppo, ",", i._id.indice_completezza, ",", i.count);
});
