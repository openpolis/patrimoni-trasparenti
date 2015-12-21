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
                contributi_elettorali: { $first: "$contributi_elettorali" },
                // this will get 2014 data with sorting above
                incarichi: { $last: "$incarichi"}
              }
    },

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
    // filter multiple roles
		{ $group: {
                _id : {op_id: "$_id.op_id", gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione"},
               contributi_elettorali: { $last: "$contributi_elettorali" }
              }
    },
		{ $unwind: "$contributi_elettorali"},
    { $match: { "contributi_elettorali.importo": { $gt: 0 } } },
    { $match: { "contributi_elettorali.fonte": "erogazioni del candidato" } },
		{ $group: {
                _id : { gruppo: "$_id.gruppo", istituzione: "$_id.istituzione", voce: "$contributi_elettorali.fonte" },
               count: { $sum: 1 },
               total: { $sum: "$contributi_elettorali.importo" }
              }
    },
    { $project: {"media": { $divide: [ "$total", "$count" ] }, total:1, count:1}},
		{ $sort: {"_id.gruppo":-1, "_id.istituzione":-1}}
);

print( "gruppo", ",", "istituzione", ",", "voce", ",", "count", ",", "media", "totale");
result.forEach( function(i) {
          print( i._id.gruppo, ",", i._id.istituzione, ",", i._id.voce ,",", i.count, ', "'+ i.media.toString().replace(/\./, ',') +'"', ', "'+ i.total.toString().replace(/\./, ',') +'"');
});

result = db['all'].aggregate(
		{ $match: {"totale_spese_elettorali":{ $gt: 0}}},
		{ $sort: {"anno_dichiarazione": 1}},
		{ $group: {
                _id : {op_id: "$op_id"},
                // this will get 2013 data with sorting above
                spese_elettorali: { $first: "$spese_elettorali" },
                // this will get 2014 data with sorting above
                incarichi: { $last: "$incarichi"}
              }
    },

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
    // filter multiple roles
		{ $group: {
                _id : {op_id: "$_id.op_id", gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione"},
               spese_elettorali: { $last: "$spese_elettorali" }
              }
    },
		{ $unwind: "$spese_elettorali"},
    { $match: { "spese_elettorali.importo": { $gt: 0 } } },
    { $match: { "spese_elettorali.fonte": "contributo al partito" } },
		{ $group: {
                _id : { gruppo: "$_id.gruppo", istituzione: "$_id.istituzione", voce: "$spese_elettorali.fonte" },
               count: { $sum: 1 },
               total: { $sum: "$spese_elettorali.importo" }
              }
    },
    { $project: {"media": { $divide: [ "$total", "$count" ] }, total:1, count:1}},
		{ $sort: {"_id.gruppo":-1, "_id.istituzione":-1}}
);

print( "gruppo", ",", "istituzione", ",", "voce", ",", "count", ",", "media", "totale");
result.forEach( function(i) {
          print( i._id.gruppo, ",", i._id.istituzione, ",", i._id.voce ,",", i.count, ', "'+ i.media.toString().replace(/\./, ',') +'"', ', "'+ i.total.toString().replace(/\./, ',') +'"');
});

result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2013 }},
		{ $unwind: "$contributi_elettorali"},
    { $match: { "contributi_elettorali.fonte": { $eq: "erogazioni del candidato"}} },
    { $project: { op_id : 1, nome:1, cognome:1, 'totale': "$contributi_elettorali.importo"}},
		{ $sort: {"totale": -1}},
    { $limit: 10 }
);

print( "classifica (erogazioni candidato)");
print( "op_id", ",", "nome", ",", "cognome", ",", "totale");
result.forEach( function(i) {
          print(i.op_id, "," , i.nome, ",", i.cognome, ', "'+ i.totale.toString().replace(/\./, ',') +'"');
});

result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2013 }},
		{ $unwind: "$spese_elettorali"},
    { $match: { "spese_elettorali.fonte": { $eq: "contributo al partito"}} },
    { $project: { op_id : 1, nome:1, cognome:1, 'totale': "$spese_elettorali.importo"}},
		{ $sort: {"totale": -1}},
    { $limit: 10 }
);

print( "classifica (contributo al partito)");
print( "op_id", ",", "nome", ",", "cognome", ",", "totale");
result.forEach( function(i) {
          print(i.op_id, "," , i.nome, ",", i.cognome, ', "'+ i.totale.toString().replace(/\./, ',') +'"');
});

result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2013 }},
    { $match: { "dichiarazione_elettorale": true }}
);
array = result.toArray()
print( "totale dichiarazioni elettorali 2013: ", array.length );

result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014 }},
    { $match: { "dichiarazione_elettorale": true }}
);
array = result.toArray()
print( "totale dichiarazioni elettorali 2014: ", array.length );
