MongoDB commands
================

Create text index on all fields::

        db.all.createIndex({ "$**": "text" }, { name: "TextIndex" })
         
ES commands
===========

Import data from MongoDB
------------------------
Use transporter (https://github.com/compose/transporter)::

        ./transporter run --config transporter-conf/config.yaml ./transporter-conf/application.js

Change indexing parameters
--------------------------

It's not possible! We must reimport data or copy to a new index where we have changed mapping in advance.

Get auto generated map settings::

        curl localhost:9200/declarations/parliamentarians/_mapping?pretty=true > mapping.json

Edit mapping as you like (es. add "index" : "not_analyzed") to avoid ES to index sigle words in sentences), remove original one (*!this will erase all data!*) and import the new::

        curl -X DELETE localhost:9200/declarations/_mapping/parliamentarians
        curl -X PUT localhost:9200/declarations/_mapping/parliamentarians -d @mapping.json

Verify that is what we want::

        curl localhost:9200/declarations/parliamentarians/_mapping?pretty=true | less

Reimport/copy data.

An example mapping with ``"index" : "not_analyzed"`` is provided in ``conf`` dir in this repo.
