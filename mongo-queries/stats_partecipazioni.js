conn = new Mongo("localhost")
print("Conn ok")
var db = conn.getDB("declarations");
var data = db['parliamentarians'].find();
print("######################################")
print("Total document in the collection:" + data.count());
print("######################################")
print( "Starting analysis");
print("######################################")

print("Classifica numero partecipazioni totali")
results = db['parliamentarians'].aggregate(
		{$unwind: "$partecipazioni_soc"},
		{$group: {
			_id : "$op_id",
			nome: {$last: "$nome"},
			cognome: {$last: "$cognome"},
			'total': {$sum: 1},
			}
		},
		{$sort: {"total":-1}},
		{$limit: 20}
);
results.forEach( function(i) {
	print( tojson( i, "", true) );
})

// debug, get all methods
//print(tojson(data));
