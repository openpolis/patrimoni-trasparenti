#!/bin/sh

years="2013 2014 2015";

Export () {
	wget http://patrimoni.staging.openpolis.it/api/csvall/${1} -O ${1}.csv
	zip ${1}.zip ${1}.csv
}

for year in $years; do
	Export $year;
done;
