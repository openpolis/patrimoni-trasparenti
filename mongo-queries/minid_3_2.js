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
               contributi: { $last: "$contributi_elettorali" }
              }
    },
		{ $unwind: "$contributi"},
		{ $group: {
                _id : {voce: "$contributi.fonte"},
               total: { $sum: "$contributi.importo"}
              }
    }
);

print( "voce", ";", "totale");
result.forEach( function(i) {
          print( i._id.voce, ";", i.total);
});

result = db['all'].aggregate(
		//{ $match: { "anno_dichiarazione": 2013, "totale_contributi_elettorali":{ $gt: 0}}},
		{ $match: { "anno_dichiarazione": 2013 }},

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $group: {
                _id : {op_id: "$op_id", gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione"},
               totale_contributi: { $last: "$totale_contributi_elettorali" }
              }
    },
		{ $group: {
                _id : {gruppo: "$_id.gruppo", istituzione: "$_id.istituzione"},
               total: { $sum: "$totale_contributi"}
              }
    },
		{ $sort: {"_id.gruppo":-1, "_id.istituzione":-1}}
);

print( "gruppo", ";", "istituzione", ";", "totale");
result.forEach( function(i) {
          print( i._id.gruppo, ";", i._id.istituzione, ";", i.total);
});

result = db['all'].aggregate(
		//{ $match: { "anno_dichiarazione": 2013, "totale_contributi_elettorali":{ $gt: 0}}},
		{ $match: { "anno_dichiarazione": 2013 }},

		{ $sort: {"totale_contributi_elettorali":-1}},
    { $limit: 10 }
);

print( "nome", ";", "cognome", ";", "totale");
result.forEach( function(i) {
          print( i.nome, ";", i.cognome, ";", i.totale_contributi_elettorali);
});
