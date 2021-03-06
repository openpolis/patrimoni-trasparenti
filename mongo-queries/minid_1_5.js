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

var choices = [ "coniuge", "figli", "fratello", "genitore", "sorella" ];
result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},

    // select only declarations with "persona" different from "dichiarante"
    // NOTE
    // "beni_immobili.persona": {$ne: "coniuge"} | matches beni_immobili = [] (empty array), we could refactor excluding empty array "beni_immobili": {$not: {$size: 0}}
    // "beni_immobili.$.persona": {$ne: "dichiarante"} | matches all

    { $match: { $or: [
                { "dichiarazione_coniuge": true},
                { "beni_immobili.persona": { $in: choices } },
                { "beni_mobili.persona": { $in: choices } },
                { "partecipazioni_soc.persona": { $in: choices } },
                { "amministrazioni_soc.persona": { $in: choices } }
    ]}},
		{ $unwind: "$incarichi"},
		{ $group: {
                _id : {op_id: "$op_id", gruppo: "$incarichi.gruppo.acronym", istituzione: "$incarichi.istituzione" },
              }
    },
		{ $group: {
                _id : { gruppo: "$_id.gruppo", istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.gruppo":-1, "_id.istituzione":-1}}
);

resultsArray = result.toArray();

print( "gruppo", ",", "istituzione", ",", "totale");
resultsArray.forEach( function(i) {
          print( i._id.gruppo, ",", i._id.istituzione, ",", i.count);
});

result = db['all'].aggregate(
		{ $match: { "anno_dichiarazione": 2014}},

    // select only declarations with "persona" different from "dichiarante"
    // NOTE
    // "beni_immobili.persona": {$ne: "coniuge"} | matches beni_immobili = [] (empty array), we could refactor excluding empty array "beni_immobili": {$not: {$size: 0}}
    // "beni_immobili.$.persona": {$ne: "dichiarante"} | matches all

    { $match: { $or: [
                { "dichiarazione_coniuge": true},
                { "beni_immobili.persona": { $in: choices } },
                { "beni_mobili.persona": { $in: choices } },
                { "partecipazioni_soc.persona": { $in: choices } },
                { "amministrazioni_soc.persona": { $in: choices } }
    ]}},
		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.partito.acronym": { $ne: ""}}},
		{ $match: { "incarichi.istituzione": { $eq: "governo"}}},
		{ $group: {
                _id : {op_id: "$op_id", partito: "$incarichi.partito.acronym", istituzione: "$incarichi.istituzione" },
              }
    },
		{ $group: {
                _id : { partito: "$_id.partito", istituzione: "$_id.istituzione" },
               count: { $sum: 1}
              }
    },
		{ $sort: {"_id.gruppo":-1, "_id.istituzione":-1}}
);

resultsArray = result.toArray();

print("governo");
print( "partito", ",", "istituzione", ",", "totale");
resultsArray.forEach( function(i) {
          print( i._id.partito, ",", i._id.istituzione, ",", i.count);
});
