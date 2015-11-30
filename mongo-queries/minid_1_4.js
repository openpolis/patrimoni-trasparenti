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
		{ $match: {"anno_dichiarazione": 2013}},
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $group: {
                _id : {op_id: "$op_id", gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione", dichiarazione_elettorale: "$dichiarazione_elettorale"},
               roles_count: { $sum: 1}
              }
    },
		{ $group: {
                _id : {gruppo: "$_id.gruppo", istituzione: "$_id.istituzione", dichiarazione_elettorale: "$_id.dichiarazione_elettorale"},
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.gruppo":-1, "_id.istituzione": -1, "_id.dichiarazione_elettorale": -1}}
);


print( "gruppo", ",", "istituzione", ",","dichiarazione_elettorale", ",", "totale");
result.forEach( function(i) {
          print( i._id.gruppo, ",", i._id.istituzione, ",", i._id.dichiarazione_elettorale, ",", i.count);
});
