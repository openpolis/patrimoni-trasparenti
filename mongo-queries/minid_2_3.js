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
		{ $group: {
                _id : { op_id: "$op_id", istituzione: "$incarichi.istituzione" },
               beni_immobili: { $last: "$beni_immobili" }
              }
    },
		{ $unwind: "$beni_immobili"},
		{ $group: {
                _id : { tipologia: "$_id.tipologia", tipologia: "$beni_immobili.descrizione", istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1, "_id.tipologia":-1 }}
);

print( "istituzione", ",","tipologia", ",", "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i._id.tipologia, ",", i.count);
});

result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "beni_immobili": { $not: {$size: 0} } } },

		{ $unwind: "$incarichi"},
		{ $group: {
                _id : { op_id: "$op_id", istituzione: "$incarichi.istituzione" },
              }
    },
		{ $group: {
                _id : { istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1 }}
);

print("dichiarano beni immobili")
print( "istituzione", "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i.count);
});

//
//
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "beni_immobili": { $not: {$size: 0} } } },
    // NOTE
    // "beni_immobili.$.rendita_catastale": { $ne: 0 } | match all
    // "beni_immobili.categoria_catastale": { $ne:  "" } | match also empty arrays, exclude them.
    { $match: { $or: [
                { "beni_immobili.categoria_catastale": { $ne:  "" } },
                { "beni_immobili.rendita_catastale": { $gt: 0 } },
                { "beni_immobili.reddito_agrario": { $gt: 0 } },
                { "beni_immobili.reddito_dominicale": { $gt: 0 } }
    ] } },

		{ $unwind: "$incarichi"},
		{ $group: {
                _id : { op_id: "$op_id", istituzione: "$incarichi.istituzione" },
              }
    },
		{ $group: {
                _id : { istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1 }}
);

print("specificano reddito_dominicale o rendita_catastale")
print( "istituzione", "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i.count);
});
