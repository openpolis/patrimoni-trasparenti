var data = db['all'].find();

print("######################################")
print("Total document in the collection:" + data.count());
print("######################################")
print( "Starting analysis");
print("######################################")
result = db['all'].aggregate(
		{ $group: {
                _id : {op_id: "$op_id"},
                count: { $sum: 1}
              }
    },
		{ $sort: {"_id.op_id":1}}
);

resultsArray = result.toArray();
print("total politicain number:", resultsArray.length );
resultsArray.forEach( function(i) {
          print( i._id.op_id, i.count);
});
