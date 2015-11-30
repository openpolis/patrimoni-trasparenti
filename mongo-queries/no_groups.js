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
		{ $match: { "anno_dichiarazione": 2014 } },

		{ $unwind: "$incarichi"},
		{ $match: { "incarichi.gruppo.acronym": { $eq: ""}}},
		{ $match: { "incarichi.istituzione": { $ne: "governo"}}},
		{ $sort: {"incarichi.istituzione":-1} }
);

print( "nome", ",","cognome", ",", "gruppo", ",", "istituzione", ",", "totale"),
result.forEach( function(i) {
          print( i.nome, ",", i.cognome, ",", i.incarichi.gruppo.acronym, ",", i.incarichi.istituzione);
});
