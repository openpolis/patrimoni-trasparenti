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
                _id : {op_id: "$_id.op_id", istituzione: "$incarichi.istituzione"},
               gruppo: { $last: "$incarichi.gruppo.acronym" },
               contributi: { $last: "$contributi_elettorali" }
              }
    },
		{ $unwind: "$contributi"},
		{ $group: {
                _id : {voce: "$contributi.fonte", istituzione:"$_id.istituzione", gruppo: "$gruppo"},
               total: { $sum: "$contributi.importo"}
              }
    }
);

print( "gruppo", ",", "istituzione", ",", "voce",",", "totale");
result.forEach( function(i) {
          print( i._id.gruppo, ",", i._id.istituzione, ",", i._id.voce, ', "'+ i.total.toString().replace(/\./, ',') +'"');
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

print( "voce", ",", "numero");
result.forEach( function(i) {
          print( i._id.voce, ",", i.count);
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

print( "op_id, no spese no contributi con dichiarazione_elettorale");
array.forEach( function(i) {
          print( i._id.op_id);
});

result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2013 }},
		{ $unwind: "$spese_elettorali"},
    { $match: { "spese_elettorali.fonte": { $eq: "spese sostenute dal partito"}} },
		{ $group: {
                _id : {op_id: "$op_id"},
                nome: { $last: "$nome" },
                cognome: { $last: "$cognome" },
                contributi_elettorali: { $last: "$contributi_elettorali" },
                spese: { $sum: "$spese_elettorali.importo" },
              }
    },
		{ $unwind: "$contributi_elettorali"},
    { $match: { "contributi_elettorali.fonte": { $eq: "contributi o servizi ricevuti dal partito"}} },
		{ $group: {
                _id : {op_id: "$_id.op_id"},
                nome: { $last: "$nome" },
                cognome: { $last: "$cognome" },
                spese: { $last: "$spese" },
                contributi: { $sum: "$contributi_elettorali.importo" },
              }
    },
    { $project: { _id : 1, nome:1, cognome:1, 'totale': {$add: ["$contributi", "$spese"]}}},
		{ $sort: {"totale": -1}},
    { $limit: 10 }
);

print( "classifica (spese + contributi partito)");
print( "op_id", ",", "nome", ",", "cognome", ",", "totale");
result.forEach( function(i) {
          print(i._id.op_id, "," , i.nome, ",", i.cognome, ', "'+ i.totale.toString().replace(/\./, ',') +'"');
});
