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
		{ $sort: {"anno_dichiarazione": 1}},
		{ $group: {
                _id : {op_id: "$op_id"},
                // this will get 2013 data with sorting above
                dichiarazione_elettorale: { $first: "$dichiarazione_elettorale"},
                // this will get 2014 data with sorting above
                incarichi: { $last: "$incarichi"}
              }
    },
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
    // filter multiple roles
		{ $group: {
                _id : {op_id: "$_id.op_id",  gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione"},
                dichiarazione_elettorale: { $last: "$dichiarazione_elettorale"},
              }
    },
		{ $group: {
                _id : {gruppo: "$_id.gruppo", istituzione: "$_id.istituzione", dichiarazione_elettorale: "$dichiarazione_elettorale"},
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.gruppo":-1, "_id.istituzione": -1, "_id.dichiarazione_elettorale": -1}}
);


print( "gruppo", ",", "istituzione", ",","dichiarazione_elettorale", ",", "totale");
result.forEach( function(i) {
          print( i._id.gruppo, ",", i._id.istituzione, ",", i._id.dichiarazione_elettorale, ",", i.count);
});

result = db['all'].aggregate(
		{ $sort: {"anno_dichiarazione": 1}},
		{ $group: {
                _id : {op_id: "$op_id"},
                // this will get 2013 data with sorting above
                dichiarazione_elettorale: { $first: "$dichiarazione_elettorale"},
                // this will get 2014 data with sorting above
                incarichi: { $last: "$incarichi"}
              }
    },
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
		//{ $match: { "incarichi.partito.acronym": { $ne: ""}}},
    // filter multiple roles
		{ $group: {
                _id : { op_id: "$_id.op_id", partito: "$incarichi.partito.acronym"  },
                dichiarazione_elettorale: { $last: "$dichiarazione_elettorale"}
              }
    },
		{ $group: {
                _id : {  partito: "$_id.partito", dichiarazione_elettorale: "$dichiarazione_elettorale"},
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.dichiarazione_elettorale": -1, "_id.partito": -1 }}
);

print( "partito", ",","dichiarazione_elettorale", ",", "totale");
result.forEach( function(i) {
          print( i._id.partito, ",", i._id.dichiarazione_elettorale, ",", i.count);
});
