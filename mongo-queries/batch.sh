#!/bin/bash

for f in `ls minid*`; do
  mongo declarations $f > ${f%\.*}.csv
done
