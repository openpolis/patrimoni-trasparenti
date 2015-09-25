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


``incomes-rest`` system daemon that exposes private and public REST APIs for *incomes service*.

After installing provided upstart conf in ``/etc/init`` to start/stop rest service::

        # service incomes-rest start
        # service incomes-rest stop

Configuration
-------------

Conf file::

        /home/incomes/config/conf.cfg

Full documentation
-------------------

To navigate and read full documentation use Go builtin doc system. Once cloned this repo in a proper installed go environment just run::

        $ godoc -http=:8001

and point your browser to ``http://localhost:8001/pkg/`` and choose desider package/command.

Generate RESTapi swagger docs
-----------------------------

With github.com/yvasiyarov/swagger installed::
        
        $ cd cmd/rest-docs
        $ swagger -apiPackage="bitbucket.org/eraclitux/op-incomes" -mainApiFile="bitbucket.org/eraclitux/op-incomes/cmd/incomes-rest/main.go"

Test it with::

        $ bin/rest-docs -api "http://openpatrimoni.deppsviluppo.org"
Note
----

This code is *alpha* quality because test coverage is too poorly.

To run the few tests (where present)::

        $ go test -cover
