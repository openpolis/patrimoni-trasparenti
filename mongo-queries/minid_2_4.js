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

// camera
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},
    // il governo da parte
		{ $match: { "incarichi.istituzione": { $ne:"governo"}}},

		{ $unwind: "$incarichi"},
		{ $group: {
               _id : { op_id: "$op_id", istituzione: "$incarichi.istituzione" },
               beni_mobili: { $last: "$beni_mobili" }
              }
    },
		{ $unwind: "$beni_mobili"},
    { $match: { "beni_mobili.persona": "dichiarante" } },
		{ $group: {
                _id : { tipologia: "$beni_mobili.tipologia", istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1, "_id.tipologia":-1 }}
);

print( "istituzione", ",", "tipologia", ",", "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i._id.tipologia, ",", i.count);
});

// governo
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},
    // il governo da parte
		{ $match: { "incarichi.istituzione": { $eq:"governo"}}},

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq:"governo"}}},
		{ $group: {
                _id : { op_id: "$op_id", istituzione: "$incarichi.istituzione" },
               beni_mobili: { $last: "$beni_mobili" }
              }
    },
		{ $unwind: "$beni_mobili"},
    { $match: { "beni_mobili.persona": "dichiarante" } },
		{ $group: {
                _id : { tipologia: "$beni_mobili.tipologia", istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1, "_id.tipologia":-1 }}
);

print( "istituzione", ",", "tipologia", ",", "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i._id.tipologia, ",", i.count);
});

// solo parlamento
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},

		{ $unwind: "$incarichi"},
		{ $unwind: "$beni_mobili"},
    { $match: { "beni_mobili.persona": "dichiarante" } },
		{ $group: {
                 _id: { op_id:"$op_id", tipologia: "$beni_mobili.tipologia", istituzione: "$incarichi.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $group: {
                 _id: { count: "$count", tipologia: "$_id.tipologia", istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1, "_id.tipologia":-1, "_id.count":-1 }}
);

print( "istituzione", ",", "tipologia", ",", "numero", ",", "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i._id.tipologia, ",", i._id.count, ",", i.count);
});

// solo governo
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
		{ $unwind: "$beni_mobili"},
    { $match: { "beni_mobili.persona": "dichiarante" } },
		{ $group: {
                 _id: { op_id:"$op_id", tipologia: "$beni_mobili.tipologia", istituzione: "$incarichi.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $group: {
                 _id: { count: "$count", tipologia: "$_id.tipologia", istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1, "_id.tipologia":-1, "_id.count":-1 }}
);

print( "istituzione", ",", "tipologia", ",", "numero", ",", "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i._id.tipologia, ",", i._id.count, ",", i.count);
});

// hanno campi vuoti parlamento
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},
		{ $match: { "incarichi.istituzione": { $ne:"governo"}}},

		{ $unwind: "$incarichi"},
		{ $group: {
                _id : { op_id: "$op_id", istituzione: "$incarichi.istituzione" },
               nome: { $last: "$nome" },
               cognome: { $last: "$cognome" },
               beni_mobili: { $last: "$beni_mobili" }
              }
    },
		{ $unwind: "$beni_mobili"},
    { $match: { "beni_mobili.persona": "dichiarante" } },
		{ $match: { "beni_mobili.tipologia": { $eq: ""}}},
		{ $group: {
                _id : { op_id:"$_id.op_id", nome: "$nome", cognome: "$cognome"},
              }
    }
);

print("hanno campi vuoti parlamento");
result.forEach( function(i) {
          print(i._id.op_id, ",", i._id.nome, ",", i._id.cognome);
});

// hanno campi vuoti governo
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},
		{ $match: { "incarichi.istituzione": { $eq:"governo"}}},

		{ $unwind: "$incarichi"},
		{ $group: {
                _id : { op_id: "$op_id", istituzione: "$incarichi.istituzione" },
               nome: { $last: "$nome" },
               cognome: { $last: "$cognome" },
               beni_mobili: { $last: "$beni_mobili" }
              }
    },
		{ $unwind: "$beni_mobili"},
    { $match: { "beni_mobili.persona": "dichiarante" } },
		{ $match: { "beni_mobili.tipologia": { $eq: ""}}},
		{ $group: {
                _id : { op_id:"$_id.op_id", nome: "$nome", cognome: "$cognome"},
              }
    }
);

print("hanno campi vuoti governo");
result.forEach( function(i) {
          print(i._id.op_id, ",", i._id.nome, ",", i._id.cognome);
});

// tutte le combinazioni solo camera
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},

		{ $unwind: "$incarichi"},
		{ $unwind: "$beni_mobili"},
    { $match: { "beni_mobili.persona": "dichiarante" } },
		{ $group: {
                 _id: { op_id:"$op_id", istituzione: "$incarichi.istituzione" },
                set_tipologia: { $addToSet: "$beni_mobili.tipologia" },
                count: { $sum: 1}
              }
    },
		{ $group: {
                 _id: { count: "$count", set_tipologia: "$set_tipologia", istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1, "_id.count":-1 }}
);

print( "istituzione", ",", "tipologie", ",",  "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i._id.set_tipologia, ",", i.count);
});

// tutte le combinazioni governo
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
		{ $unwind: "$beni_mobili"},
    { $match: { "beni_mobili.persona": "dichiarante" } },
		{ $group: {
                 _id: { op_id:"$op_id", istituzione: "$incarichi.istituzione" },
                set_tipologia: { $addToSet: "$beni_mobili.tipologia" },
                count: { $sum: 1}
              }
    },
		{ $group: {
                 _id: { count: "$count", set_tipologia: "$set_tipologia", istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1, "_id.count":-1 }}
);

print( "istituzione", ",", "tipologie", ",",  "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i._id.set_tipologia, ",", i.count);
});

// no beni mobili camera
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "beni_mobili": {$size: 0} } },
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},

		{ $unwind: "$incarichi"},
    // filter multiple roles
		{ $group: {
                 _id: { op_id:"$op_id", istituzione: "$incarichi.istituzione" },
              }
    },
		{ $group: {
               _id: { istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1, "count":-1 }}
);

print("nessun bene mobile camera");
print( "istituzione", "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i.count);
});

// no beni mobili governo
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014, "beni_mobili": {$size: 0} } },
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
    // filter multiple roles
		{ $group: {
                 _id: { op_id:"$op_id", istituzione: "$incarichi.istituzione" },
              }
    },
		{ $group: {
               _id: { istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1, "count":-1 }}
);

print("nessun bene mobile governo");
print( "istituzione", "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i.count);
});

// almeno un bene mobile camera
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},

		{ $unwind: "$incarichi"},
		{ $unwind: "$beni_mobili"},
    { $match: { "beni_mobili.persona": "dichiarante" } },
		{ $group: {
                 _id: { op_id:"$op_id", istituzione: "$incarichi.istituzione" },
               count: { $sum: 1}
              }
    },
    { $match: {"count": { $gt:0}}},
		{ $group: {
                 _id: { istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1, "count":-1 }}
);

print("almeno un bene mobile camera");
print( "istituzione", "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i.count);
});

// almeno un bene mobile governo
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
		{ $unwind: "$beni_mobili"},
    { $match: { "beni_mobili.persona": "dichiarante" } },
		{ $group: {
                 _id: { op_id:"$op_id", istituzione: "$incarichi.istituzione" },
               count: { $sum: 1}
              }
    },
    { $match: {"count": { $gt:0}}},
		{ $group: {
                 _id: { istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.istituzione":-1, "count":-1 }}
);

print("almeno un bene mobile governo");
print( "istituzione", "totale");
result.forEach( function(i) {
          print(i._id.istituzione, ",", i.count);
});
