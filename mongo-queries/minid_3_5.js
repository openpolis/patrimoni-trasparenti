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
		{ $match: { "anno_dichiarazione": 2013 }},

		{ $unwind: "$contributi_elettorali"},
    { $match: { "contributi_elettorali.importo": { $gt: 0 } } },
		{ $group: { _id: { op_id: "$op_id", voce: "$contributi_elettorali.fonte" } } },
		{ $group: {
                _id : {voce: "$_id.voce" },
               count: { $sum: 1 }
              }
    },
		{ $sort: {"count":-1} }
);

print( "voce", ";", "numero");
result.forEach( function(i) {
          print( i._id.voce, ";", i.count);
});

result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2013 }},

		{ $unwind: "$spese_elettorali"},
    { $match: { "spese_elettorali.importo": { $gt: 0 } } },
		{ $group: { _id: { op_id: "$op_id", voce: "$spese_elettorali.fonte" } } },
		{ $group: {
                _id : {voce: "$_id.voce" },
               count: { $sum: 1 }
              }
    },
		{ $sort: {"count":-1} }
);

print( "voce", ";", "numero");
result.forEach( function(i) {
          print( i._id.voce, ";", i.count);
});

result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2013, "dichiarazione_elettorale": true }},

		{ $unwind: "$contributi_elettorali"},
		{ $group: {
                _id : {op_id: "$op_id" },
               totale_contributi: { $sum: "$contributi_elettorali.importo" },
               spese_elettorali: { $last: "$spese_elettorali" }
              }
    },
		{ $unwind: "$spese_elettorali"},
		{ $group: {
                _id : {op_id: "$_id.op_id" },
               totale_contributi: { $last: "$totale_contributi" },
               totale_spese: { $sum: "$spese_elettorali.importo" }
              }
    },
    { $match: { "totale_contributi": { $eq: 0 }, "totale_spese": { $eq: 0 } } }
);

array = result.toArray()
print( "totale no spese no contributi con dichiarazione_elettorale: ", array.length );
//print( tojson(result) );

print( "op_id, no spese no contributi con dichiarazione_elettorale");
array.forEach( function(i) {
          print( i._id.op_id);
});
