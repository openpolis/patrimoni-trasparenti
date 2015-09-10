#!/bin/sh

GIT_TAG=`git describe --always --dirty`
BTIME=`date -u +%s`
# -w and -s diasables debugging stuff leading to a
# reduction of binaries sizes/
cd ./cmd/incomes-rest
godep go build -ldflags "-w -X main.Version=${GIT_TAG} -X main.BuildTime=${BTIME}" -o ../../bin/incomes-rest
cd -
cd ./cmd/incomes-importer
godep go build -ldflags "-w -X main.Version=${GIT_TAG} -X main.BuildTime=${BTIME}" -o ../../bin/incomes-importer
