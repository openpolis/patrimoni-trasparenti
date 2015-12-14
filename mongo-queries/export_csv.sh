#!/bin/sh

years="2013 2014 2015";
fields="nome,cognome,op_id,data_nascita,totale_730_dichiarante,totale_730_coniuge,totale_contributi_elettorali,totale_spese_elettorali,dichiarazione_elettorale,documenti_appello,indice_completezza,note_completezza";

Export () {
	mongoexport -d declarations -c all --type=csv \
		-q "{\"anno_dichiarazione\":${1}}"\
		--fields $fields\
		--out ${1}.csv
}

for year in $years; do
	Export $year;
done;
