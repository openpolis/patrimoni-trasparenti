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
		{ $match: { "anno_dichiarazione": 2013, "totale_contributi_elettorali":{ $gt: 0}}},

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $group: {
                _id : {op_id: "$op_id", gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione"},
               totale_contributi_elettorali: { $last: "$totale_contributi_elettorali" }
              }
    },
		{ $group: {
                _id : {gruppo: "$_id.gruppo", istituzione: "$_id.istituzione"},
               count: { $sum: 1},
               total: { $sum: "$totale_contributi_elettorali"}
              }
    },
    { $project: {"media_contributi": { $divide: [ "$total", "$count" ] }, total:1, count:1}},
		{ $sort: {"_id.gruppo":-1, "_id.istituzione":-1}}
);

print( "gruppo", ";", "istituzione", ";", "totale", ";", "media");
result.forEach( function(i) {
          print( i._id.gruppo, ";", i._id.istituzione, ";", i.count, ";", i.media_contributi);
});
