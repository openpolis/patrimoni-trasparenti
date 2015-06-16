


conn = new Mongo("mongo30")
print("Conn ok")
var db = conn.getDB("dossier-incomes");
var data = db['parlamentari'].find();
print("######################################")
print("Total document in the collection:" + data.count());
print("######################################")
print( "Starting analysis");
print("######################################")

result = db['parlamentari'].aggregate(
		{$unwind: "$spese-elettorali"},
		{"$group": { _id : "$_id", 'total': { $sum: "$spese-elettorali.importo"}}}
);

result.forEach( function(i) {
	print( tojson( i, "", true) );
})
// debug, get all methods
//print(tojson(data));
