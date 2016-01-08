#!/bin/sh
# Impost latest data from mongo into ElasticSearch
# Can be used has as poor man sync mechanism.
curl -X DELETE "localhost:9200/declarations/_mapping/all"
../transporter run --config transporter-conf/config.yaml ./transporter-conf/application.js
