conn = new Mongo("localhost")

var db = conn.getDB("declarations");

results = db['all'].aggregate(
    {$unwind: "$incarichi"},
    {$group: {
        _id : "$op_id",
         nome: {$last: "$nome"},
         cognome: {$last: "$cognome"},
         gruppo: {$last: "$incarichi.gruppo.acronym"}
         }
    },
    {$limit: 50}
);

resultsArray = results.toArray();

var gruppiSet = new Array();
var j = 1;
// Build set
resultsArray.forEach( function(i) {
  if (!(i.gruppo in gruppiSet)) {
    gruppiSet[i.gruppo] = j;
    j++;
  }
});

resultsArray.forEach( function(i) {
          print( i.nome, i.cognome, ",", gruppiSet[i.gruppo]);
});
