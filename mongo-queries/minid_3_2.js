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

print( "voce", ",", "totale");
result.forEach( function(i) {
          print( i._id.voce, ', "'+ i.total.toString().replace(/\./, ',') +'"');
});

result = db['all'].aggregate(
		{ $sort: {"anno_dichiarazione": 1}},
		{ $group: {
                _id : {op_id: "$op_id"},
                // this will get 2013 data with sorting above
                totale_contributi_elettorali: { $first: "$totale_contributi_elettorali"},
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
               totale_contributi: { $last: "$totale_contributi_elettorali" },
               contributi_elettorali: { $last: "$contributi_elettorali"}
              }
    },
		{ $unwind: "$contributi_elettorali"},
    { $match: { $or: [
      { "contributi_elettorali.fonte": { $eq: "contributi da terzi"}},
      { "contributi_elettorali.fonte": { $eq: "servizi da terzi"}},
      { "contributi_elettorali.fonte": { $eq: "debiti"}}
    ]}},
		{ $group: {
                _id : {gruppo: "$_id.gruppo", istituzione: "$_id.istituzione"},
               total: { $sum: "$contributi_elettorali.importo"}
              }
    },
		{ $sort: {"_id.gruppo":-1, "_id.istituzione":-1}}
);

print( "gruppo", ",", "istituzione", ",", "totale (contributi + servizi + debiti)");
result.forEach( function(i) {
          print( i._id.gruppo, ",", i._id.istituzione, ', "'+ i.total.toString().replace(/\./, ',') +'"');
});

result = db['all'].aggregate(
		//{ $match: { "anno_dichiarazione": 2013, "totale_contributi_elettorali":{ $gt: 0}}},
		{ $match: { "anno_dichiarazione": 2013 }},

		{ $sort: {"totale_contributi_elettorali":-1}},
    { $limit: 10 }
);

print( "nome", ",", "cognome", ",", "totale");
result.forEach( function(i) {
          print( i.nome, ",", i.cognome, ', "'+ i.totale_contributi_elettorali.toString().replace(/\./, ',') +'"');
});
