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

// 0-80k
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "totale_730_dichiarante":{ $gte: 0, $lt: 80000 }}},

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $group: {
                _id : {gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione" },
               count: { $sum: 1},
              }
    },
		{ $sort: {"_id.gruppo":-1, "_id.istituzione":-1}}
);

print("0-80k");
print( "gruppo", ";", "istituzione", ";", "totale");
result.forEach( function(i) {
          print( i._id.gruppo, ";", i._id.istituzione, ";", i.count);
});

// 80k-150k
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "totale_730_dichiarante":{ $gte: 80000, $lt: 150000 }}},

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $group: {
                _id : {gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione" },
               count: { $sum: 1},
              }
    },
		{ $sort: {"_id.gruppo":-1, "_id.istituzione":-1}}
);


print("80k-150k");
print( "gruppo", ";", "istituzione", ";", "totale");
result.forEach( function(i) {
          print( i._id.gruppo, ";", i._id.istituzione, ";", i.count);
});

// 150k-500k
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "totale_730_dichiarante": { $gte: 150000, $lt: 500000 }}},

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $group: {
                _id : {gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione" },
               count: { $sum: 1},
              }
    },
		{ $sort: {"_id.gruppo":-1, "_id.istituzione":-1}}
);


print("150k-500k");
print( "gruppo", ";", "istituzione", ";", "totale");
result.forEach( function(i) {
          print( i._id.gruppo, ";", i._id.istituzione, ";", i.count);
});

// 500k-1M
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "totale_730_dichiarante":{ $gte: 500000, $lt: 1000000 }}},

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $group: {
                _id : {gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione" },
               count: { $sum: 1},
              }
    },
		{ $sort: {"_id.gruppo":-1, "_id.istituzione":-1}}
);

print("500k-1M");
print( "gruppo", ";", "istituzione", ";", "totale");
result.forEach( function(i) {
          print( i._id.gruppo, ";", i._id.istituzione, ";", i.count);
});

// >1M
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "totale_730_dichiarante": { $gte: 1000000 }}},

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $group: {
                _id : {gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione" },
               count: { $sum: 1},
              }
    },
		{ $sort: { "_id.gruppo":-1, "_id.istituzione":-1}}
);

print(">1M");
print( "gruppo", ";", "istituzione", ";", "totale");
result.forEach( function(i) {
          print( i._id.gruppo, ";", i._id.istituzione, ";", i.count);
});
