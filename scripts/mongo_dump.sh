#!/bin/sh
# Dump all MongoDB databases and put them on S3
NOW=$(date +%F)

/usr/bin/mongodump --out /tmp/mongodump_$NOW
tar -czvf /tmp/mongodump_${NOW}.tar.gz --remove-files /tmp/mongodump_$NOW
s3cmd put /tmp/mongodump_${NOW}.tar.gz s3://patrimonitrasparenti_mongodb_dumps
rm /tmp/mongodump_${NOW}.tar.gz
