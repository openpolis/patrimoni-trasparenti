#!/bin/sh
# Put declaration files into S3

BUCKET='s3://op_patrimoni_dichiarazioni/cloudfront.amazonaws.com/'

for y in "2013" "2014"; do
	i=0
	total=`ls | grep $y | wc -l`
	for d in `ls | grep $y`; do
		s3cmd put $d $BUCKET
		i=$((i+1))
		echo year $y: $i of $total
	done
done
