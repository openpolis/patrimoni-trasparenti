// from a shell run:
// mongo localhost/declarations unique_count.js

var data = db['declarations'].find( { a : { $exists : false } } ); // return if a is missing

print("######################################")
print( "# Calculate number of uniqe values for some fields");
print("######################################")
print("# Total documents:" + data.count());
print("######################################")

data.forEach( function(i) {
	print( tojson( i, "", true) + "," );
});
