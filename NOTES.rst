ES commands
===========

Change indexing parameters
--------------------------

It's not possible! We must reimport data or copy to a new index where we have changed mapping in advance.

Get auto generated map settings::

        curl localhost:9200/declarations/parliamentarians/_mapping?pretty=true > mapping.json

Edit mapping as you like, remove origianl one and import the new one::

        curl -X DELETE localhost:9200/declarations/_mapping/parliamentarians
        curl -X PUT localhost:9200/declarations/_mapping/parliamentarians -d @mapping.json

Verify that is wht we want::

        curl localhost:9200/declarations/parliamentarians/_mapping?pretty=true | less

Reimport/copy data.
