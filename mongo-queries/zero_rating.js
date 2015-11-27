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
		{ $match: { "indice_completezza": 0 } }
);

print( "nome", ",", "cognome", ",", "anno"),
result.forEach( function(i) {
          print( i.nome, ",", i.cognome, ",", i.anno_dichiarazione);
});
