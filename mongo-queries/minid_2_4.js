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
		{ $unwind: "$beni_mobili"},
		{ $group: {
                _id : { tipologia: "$beni_mobili.tipologia", istituzione: "$incarichi.istituzione" },
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
