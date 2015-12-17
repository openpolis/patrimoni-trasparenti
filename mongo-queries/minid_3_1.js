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
		{ $match: {"totale_contributi_elettorali":{ $gt: 0}}},
		{ $sort: {"anno_dichiarazione": 1}},
		{ $group: {
                _id : {op_id: "$op_id"},
                // this will get 2013 data with sorting above
                contributi_elettorali: { $first: "$contributi_elettorali"},
                // this will get 2014 data with sorting above
                incarichi: { $last: "$incarichi"}
              }
    },

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
    // filter multiple roles
		{ $group: {
                _id : {op_id: "$_id.op_id", gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione"},
               contributi_elettorali: { $last: "$contributi_elettorali"}
              }
    },
		{ $unwind: "$contributi_elettorali"},
    { $match: { "contributi_elettorali.fonte": { $ne: "erogazioni del candidato"}}},
		{ $group: {
                _id : {gruppo: "$_id.gruppo", istituzione: "$_id.istituzione"},
               count: { $sum: 1},
               total: { $sum: "$contributi_elettorali.importo"}
              }
    },
    { $project: {"media_contributi": { $divide: [ "$total", "$count" ] }, total:1, count:1}},
		{ $sort: {"_id.gruppo":-1, "_id.istituzione":-1}}
);

print( "gruppo", ",", "istituzione", ",", "totale", ",", "media (escluso \"erogazioni del candidato\")");
result.forEach( function(i) {
          print( i._id.gruppo, ",", i._id.istituzione, ",", i.count, ', "'+ i.media_contributi.toString().replace(/\./, ',')+'"');
});
