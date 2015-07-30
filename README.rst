===================
Openpolis patrimoni
===================

Private repo for Openpolis patrimoni APIs Rest & utils.

``cmds`` stores commands built using main ``incomes`` package.

Commands
--------

``incomes-importer`` command line tool that imports data from Google Drive.

Import all declarations::

        incomes-importer -client-secret <google-privete-id>

Import notes files::

        incomes-importer -client-secret <google-privete-id> -parse-notes


``incomes-rest`` system daemon that exposes private and public REST APIs for *incomes service*.

Full documentation
-------------------

To navigate and read full documentation use Go builtin doc system. Once cloned this repo in a proper installed go environment just run::

        godoc -http=:8001

and point your browser to ``http://localhost:8001/pkg/`` and choose desider package/command.

Note
----

This code is *alfa* quality.
