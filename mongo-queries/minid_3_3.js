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
                totale_spese_elettorali: { $first: "$totale_spese_elettorali"},
                // this will get 2014 data with sorting above
                incarichi: { $last: "$incarichi"}
              }
    },

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
    // filter multiple roles
		{ $group: {
                _id : {op_id: "$_id.op_id", gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione"},
               totale_spese_elettorali: { $last: "$totale_spese_elettorali" }
              }
    },
		{ $group: {
                _id : {gruppo: "$_id.gruppo", istituzione: "$_id.istituzione"},
               count: { $sum: 1},
               total: { $sum: "$totale_spese_elettorali"}
              }
    },
    { $project: {"media_spese": { $divide: [ "$total", "$count" ] }, total:1, count:1}},
		{ $sort: {"_id.gruppo":-1, "_id.istituzione":-1}}
);

print( "gruppo", ",", "istituzione", ",", "totale", ",", "media");
result.forEach( function(i) {
          print( i._id.gruppo, ",", i._id.istituzione, ",", i.count, ', "'+ i.media_spese.toString().replace(/\./, ',') +'"');
});

result = db['all'].aggregate(
		{ $sort: {"anno_dichiarazione": 1}},
		{ $group: {
                _id : {op_id: "$op_id"},
                // this will get 2013 data with sorting above
                totale_spese_elettorali: { $first: "$totale_spese_elettorali"},
                dichiarazione_elettorale: { $first: "$dichiarazione_elettorale"},
                // this will get 2014 data with sorting above
                incarichi: { $last: "$incarichi"}
              }
    },
    { $match: { "dichiarazione_elettorale": true }},

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
    // filter multiple roles
		{ $group: {
                _id : {op_id: "$_id.op_id", gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione"},
               totale_spese_elettorali: { $last: "$totale_spese_elettorali" }
              }
    },
		{ $group: {
                _id : {gruppo: "$_id.gruppo", istituzione: "$_id.istituzione"},
               count: { $sum: 1},
               total: { $sum: "$totale_spese_elettorali"}
              }
    },
    { $project: {"media_spese": { $divide: [ "$total", "$count" ] }, total:1, count:1}},
		{ $sort: {"_id.gruppo":-1, "_id.istituzione":-1}}
);

print("media su chi ha presentato la dichiarazione elettorale");
print( "gruppo", ",", "istituzione", ",", "totale", ",", "media");
result.forEach( function(i) {
          print( i._id.gruppo, ",", i._id.istituzione, ",", i.count, ', "'+ i.media_spese.toString().replace(/\./, ',') +'"');
});
