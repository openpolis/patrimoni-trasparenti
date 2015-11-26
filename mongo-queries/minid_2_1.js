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

// Camera e senato.
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $group: {
                _id : {gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione" },
               count: { $sum: 1},
               total: { $sum: "$totale_730_dichiarante"}
              }
    },
    { $project: {"media_reddito": { $divide: [ "$total", "$count" ] }, total:1}},
		{ $sort: {"_id.gruppo":-1, "_id.istituzione":-1}}
);


print( "gruppo", ";", "istituzione", ";", "totale");
result.forEach( function(i) {
          print( i._id.gruppo, ";", i._id.istituzione, ";", i.media_reddito);
});

// Governo
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
		{ $group: {
                _id : {partito: "$incarichi.partito.acronym", istituzione: "$incarichi.istituzione" },
               count: { $sum: 1},
               total: { $sum: "$totale_730_dichiarante"}
              }
    },
    { $project: {"media_reddito": { $divide: [ "$total", "$count" ] }, total:1}},
		{ $sort: {"_id.partito":-1, "_id.media_reddito":-1}}
);


print( "partito", ";", "istituzione", ";", "totale");
result.forEach( function(i) {
          print( i._id.partito, ";", i._id.istituzione, ";", i.media_reddito);
});
