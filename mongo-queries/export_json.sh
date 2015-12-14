#!/bin/sh

years="2013 2014 2015";

Export () {
	mongoexport -d declarations -c all --type=csv \
		-q "{\"anno_dichiarazione\":${1}}"\
		--type=json --jsonArray \
		--out ${1}.json
}

for year in $years; do
	Export $year;
done;
