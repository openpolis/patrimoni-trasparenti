===================
Openpolis patrimoni
===================

.. contents::

Private repo for Openpolis patrimoni APIs Rest & utils.

``cmd`` stores commands built using main ``incomes`` package.

Commands
--------

``incomes-importer`` command line tool that imports data from Google Drive.

Import all declarations::

        incomes-importer -client-secret <google-privete-id>

Import notes files::

        incomes-importer -client-secret <google-privete-id> -parse-notes

Update political data from  http://api3.openpolis.it (these shoud be a cronjob)::

        $ ./bin/incomes-updater


``incomes-rest`` system daemon that exposes private and public REST APIs for *incomes service*.

After installing provided upstart conf in ``/etc/init`` to start/stop rest service::

        # service incomes-rest start
        # service incomes-rest stop

Resize imgages and pu them on S3::

        export CFGP_FILE_PATH=./config/conf.cfg; ./bin/incomes-images-resizer

Set all files in a bucket/dir public using s3cmd::

        s3cmd setacl --acl-public --recursive s3://op_openparlamento_images/big

Configuration
-------------

Conf file::

        /home/incomes/config/conf.cfg

Full documentation
-------------------

To navigate and read full documentation use Go builtin doc system. Once cloned this repo in a proper installed go environment just run::

        $ godoc -http=:8001

and point your browser to ``http://localhost:8001/pkg/`` and choose desider package/command.

(Re)generate RESTapi swagger docs
---------------------------------

Generate the dos using importing end exportingi doc in json format (``swagger.json``).

Put the file in ``html/api-docs/``


Dump data for OpenData page
---------------------------

From ``./mongo-queries``::

        $ ./export_csv.sh
        $ ./export_json.sh

MongoDB commands
----------------

Create text index on all fields::

        db.all.createIndex({ "$**": "text" }, { name: "TextIndex" })

Remove political data::

        db.all.update({},{$unset: {incarichi:1}},false,true)

ES commands
===========

Import data from MongoDB
========================

Use transporter (https://github.com/compose/transporter)::

        ./transporter run --config transporter-conf/config.yaml ./transporter-conf/application.js

Change indexing parameters
==========================

It's not possible! We must reimport data or copy to a new index where we have changed mapping in advance.

Get auto generated map settings::

        curl localhost:9200/declarations/all/_mapping?pretty=true > mapping.json

Edit mapping as you like (es. add "index" : "not_analyzed") to avoid ES to index sigle words in sentences), remove original one (*!this will erase all data!*) and import the new::

        curl -X DELETE localhost:9200/declarations/_mapping/all
        curl -X PUT localhost:9200/declarations/_mapping/all -d @mapping.json

Verify that is what we want::

        curl localhost:9200/declarations/all/_mapping?pretty=true | less

Reimport/copy data.

An example mapping with ``"index" : "not_analyzed"`` is provided in ``conf`` dir in this repo.

Deploy
------

There is nothing to install on the host (except nginx), binaries are ``bin`` and html data in ``html`` folder. Copy only the latest revision::

        git clone git@gitlab.depp.it:depp/patrimoni-trasparenti.git --depth 1


Debug
-----

For every commands this will build the debug version::

        cd cmd/incomes-rest
        go build -tags debug

Generate data for OpenData page
-------------------------------

Use scripts ``mongo-queries/export_csv.sh`` and ``mongo-queries/export_json.sh``

Note
----

This code is *alpha* quality because test coverage is too poorly.

To run the few tests (where present)::

        $ go test -cover
