// Close ticket #103
// run like this:
// mongo host.tlb/database script.js

// these were 523 declarations, 52 with zero partial totals.
var results = db['all'].find( { "totale_730": 0 } );

// { $set: { "totale_730": { $add: [ "$totale_730_dichiarante", "$totale_730_coniuge" ] } } },
results.forEach( function(i) {
  print(i._id);
  var dichiarante =  i.totale_730_dichiarante;
  var coniuge =  i.totale_730_coniuge;
  print(dichiarante, coniuge);
  db['all'].update(
      { _id: i._id },
      { $set: { "totale_730": dichiarante + coniuge  } }
  );
});
