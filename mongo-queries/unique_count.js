// from a shell run:
// mongo localhost/declarations unique_count.js
var data = db['parliamentarians'].find();

print("######################################")
print( "# Calculate number of uniqe values for some fields");
print("######################################")
print("# Total document in the collection:" + data.count());
print("######################################")

print("######################################")
print("# comune_residenza")
print("######################################")
result = db['parliamentarians'].aggregate(
		{"$group": { _id : "$comune_residenza", 'total': { $sum: 1}}},
		{"$sort": {'total':-1}}
);
result.forEach( function(i) {
	print( tojson( i, "", true) + "," );
});

print("######################################")
print("# beni_immobili.descrizione")
print("######################################")
result = db['parliamentarians'].aggregate(
		{$unwind: "$beni_immobili"},
		{"$group": { _id : "$beni_immobili.descrizione", 'total': { $sum: 1}}},
		{"$sort": {'total':-1}}
);
result.forEach( function(i) {
	print( tojson( i, "", true) + "," );
});

print("######################################")
print("# beni_immobili.natura_diritto")
print("######################################")
result = db['parliamentarians'].aggregate(
		{$unwind: "$beni_immobili"},
		{"$group": { _id : "$beni_immobili.natura_diritto", 'total': { $sum: 1}}},
		{"$sort": {'total':-1}}
);
result.forEach( function(i) {
	print( tojson( i, "", true) + "," );
});

print("######################################")
print("# beni_mobili.tipologia")
print("######################################")
result = db['parliamentarians'].aggregate(
		{$unwind: "$beni_mobili"},
		{"$group": { _id : "$beni_mobili.tipologia", 'total': { $sum: 1}}},
		{"$sort": {'total':-1}}
);
result.forEach( function(i) {
	print( tojson( i, "", true) + "," );
});
print("######################################")
print("# beni_mobili.anno_immatricolazione")
print("######################################")
result = db['parliamentarians'].aggregate(
		{$unwind: "$beni_mobili"},
		{"$group": { _id : "$beni_mobili.anno_immatricolazione", 'total': { $sum: 1}}},
		{"$sort": {'total':-1}}
);
result.forEach( function(i) {
	print( tojson( i, "", true) + "," );
});
print("######################################")
print("# beni_mobili.cavalli_fiscali")
print("######################################")
result = db['parliamentarians'].aggregate(
		{$unwind: "$beni_mobili"},
		{"$group": { _id : "$beni_mobili.cavalli_fiscali", 'total': { $sum: 1}}},
		{"$sort": {'total':-1}}
);
result.forEach( function(i) {
	print( tojson( i, "", true) + "," );
});
print("######################################")
print("# partecipazioni.denominazione")
print("######################################")
result = db['parliamentarians'].aggregate(
		{$unwind: "$partecipazioni_soc"},
		{"$group": { _id : "$partecipazioni_soc.denominazione", 'total': { $sum: 1}}},
		{"$sort": {'total':-1}}
);
result.forEach( function(i) {
	print( tojson( i, "", true) + "," );
});
print("######################################")
print("# partecipazioni.numero_azioni_quote")
print("######################################")
result = db['parliamentarians'].aggregate(
		{$unwind: "$partecipazioni_soc"},
		{"$group": { _id : "$partecipazioni_soc.numero_azioni_quote", 'total': { $sum: 1}}},
		{"$sort": {'total':-1}}
);
result.forEach( function(i) {
	print( tojson( i, "", true) + "," );
});
print("######################################")
print("# amministrazioni_soc.denominazione")
print("######################################")
result = db['parliamentarians'].aggregate(
		{$unwind: "$amministrazioni_soc"},
		{"$group": { _id : "$amministrazioni_soc.denominazione", 'total': { $sum: 1}}},
		{"$sort": {'total':-1}}
);
result.forEach( function(i) {
	print( tojson( i, "", true) + "," );
});
print("######################################")
print("# amministrazioni_soc.natura_incarico")
print("######################################")
result = db['parliamentarians'].aggregate(
		{$unwind: "$amministrazioni_soc"},
		{"$group": { _id : "$amministrazioni_soc.natura_incarico", 'total': { $sum: 1}}},
		{"$sort": {'total':-1}}
);
result.forEach( function(i) {
	print( tojson( i, "", true) + "," );
});
print("######################################")
print("# contributi_elettorali.anno")
print("######################################")
result = db['parliamentarians'].aggregate(
		{$unwind: "$contributi_elettorali"},
		{"$group": { _id : "$contributi_elettorali.anno", 'total': { $sum: 1}}},
		{"$sort": {'total':-1}}
);
result.forEach( function(i) {
	print( tojson( i, "", true) + "," );
});
