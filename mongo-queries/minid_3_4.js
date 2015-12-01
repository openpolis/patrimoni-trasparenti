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
		//{ $match: { "anno_dichiarazione": 2013, "totale_contributi_elettorali":{ $gt: 0}}},
		{ $match: { "anno_dichiarazione": 2013 }},

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $group: {
                _id : {op_id: "$op_id", istituzione: "$incarichi.istituzione"},
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

print( "voce", ";", "totale");
result.forEach( function(i) {
          print( i._id.voce, ";", i.total);
});
