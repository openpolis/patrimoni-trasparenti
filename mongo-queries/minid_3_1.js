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
    // sum al fields
		{ $group: {
                _id : {op_id: "$_id.op_id" },
                gruppo: { $last: "$_id.gruppo"},
                istituzione: { $last: "$_id.istituzione"},
                somma_contributi: { $sum: "$contributi_elettorali.importo"}
              }
    },
    { $match: {"somma_contributi":{ $gt: 0}}},
		{ $group: {
                _id : {gruppo: "$gruppo", istituzione: "$istituzione"},
               count: { $sum: 1},
               total: { $sum: "$somma_contributi"}
              }
    },
    { $project: {"media_contributi": { $divide: [ "$total", "$count" ] }, total:1, count:1}},
		{ $sort: {"_id.gruppo":-1, "_id.istituzione":-1}}
);

print( "gruppo", ",", "istituzione", ",", "totale voci", ",", "media (escluso \"erogazioni del candidato\")");
result.forEach( function(i) {
          print( i._id.gruppo, ",", i._id.istituzione, ",", i.count, ', "'+ i.media_contributi.toString().replace(/\./, ',')+'"');
});
