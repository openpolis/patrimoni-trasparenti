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
		{ $match: {"totale_spese_elettorali":{ $gt: 0}}},
		{ $sort: {"anno_dichiarazione": 1}},
		{ $group: {
                _id : {op_id: "$op_id"},
                // this will get 2013 data with sorting above
                spese_elettorali: { $first: "$spese_elettorali"},
                // this will get 2014 data with sorting above
                incarichi: { $last: "$incarichi"}
              }
    },

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
    // filter multiple roles
		{ $group: {
                _id : {op_id: "$_id.op_id", istituzione: "$incarichi.istituzione"},
               spese: { $last: "$spese_elettorali" }
              }
    },
		{ $unwind: "$spese"},
		{ $group: {
                _id : {voce: "$spese.fonte"},
               total: { $sum: "$spese.importo"}
              }
    }
);

print( "voce", ",", "totale");
result.forEach( function(i) {
          print( i._id.voce, ', "' +i.total.toString().replace(/\./, ',')+'"');
});
