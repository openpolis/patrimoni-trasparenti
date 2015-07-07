conn = new Mongo("localhost")
print("Conn ok")
var db = conn.getDB("declarations");
var data = db['parliamentarians'].find();
print("######################################")
print("Total document in the collection:" + data.count());
print("######################################")
print( "Starting analysis");
print("######################################")

print("Classifica beni immobili totali (dichiarante + coniuge)")
results = db['parliamentarians'].aggregate(
		{$unwind: "$beni_immobili"},
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

print("Classifica beni immobili intestati dichiarante")
results = db['parliamentarians'].aggregate(
		{$unwind: "$beni_immobili"},
		{$match: {"beni_immobili.persona": "dichiarante"}},
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

print("Classifica beni immobili intestati coniuge")
results = db['parliamentarians'].aggregate(
		{$unwind: "$beni_immobili"},
		{$match: {"beni_immobili.persona": "coniuge"}},
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
