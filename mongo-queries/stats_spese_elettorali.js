// Note unwind is cool but total fields are NOT consisten!
// We have inserted totals !=0 even if single voices are zero.
conn = new Mongo("localhost")
print("Conn ok")
var db = conn.getDB("declarations");
var data = db['parliamentarians'].find();
print("######################################")
print("Total document in the collection:" + data.count());
print("######################################")
print( "Starting analysis");
print("######################################")

print("Aggregated by parliamentarians")
results = db['parliamentarians'].aggregate(
		{$group: { _id : "$op_id", 'total': { $sum: "$totale_spese_elettorali"}}},
		{$sort: {"total":-1}},
		{$limit: 20}
);
results.forEach( function(i) {
	print( tojson( i, "", true) );
})

print("Aggregated by parliamentarians and sum recalculated")
results = db['parliamentarians'].aggregate(
		{$unwind: "$spese_elettorali"},
		{$group: { _id : "$op_id", 'total': { $sum: "$spese_elettorali.importo"}}},
		{$sort: {"total":-1}},
		{$limit: 20}
);
var c = 0;
results.forEach( function(i) {
	print( tojson( i, "", true) );
	c++;
})
print("Total results: ", c);

print("Aggregated by declarations and sums recalculated")
results2 = db['parliamentarians'].aggregate(
		{$unwind: "$spese_elettorali"},
		{$group: { _id : "$_id", 'total': { $sum: "$spese_elettorali.importo"}}},
		{$sort: {"total":-1}},
		{$limit: 10}
);
c = 0;
results2.forEach( function(i) {
	print( tojson( i, "", true) );
	c++;
})
print("Total results: ", c);

// debug, get all methods
//print(tojson(data));
