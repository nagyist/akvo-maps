This docker image contains a PostGIS enabled "akvo" database
accessible as user "akvo" with password "akvo" on TCP port 5432
of the IP address of the docker image.

Use "make start" to start the image, then find out the IP address
of the image with something like this:

```sh
IP=`docker inspect akvo-postgis | grep '"IPAddress":' | head -1 | sed 's/.*: "//;s/".*//'`
PGPASSWORD=akvo psql -h ${IP} -U akvo -p 5432
```

# Database requirements

For a database to be used as datasource for windshaft, it needs to
be loaded with the PostGIS extension (version 2.1 or later) and
theoretically the CartoDB extension [1].

The CartoDB extension can really be replaced by sourcing two
functions from the Windshaft testsuite:

- https://raw.githubusercontent.com/CartoDB/Windshaft/master/test/sql/CDB_QueryStatements.sql
- https://raw.githubusercontent.com/CartoDB/Windshaft/master/test/sql/CDB_QueryTables.sql

The two functions could be made not needed by using a modified version
of Windshaft [2].

[1] https://github.com/CartoDB/Windshaft/issues/503
[2] https://github.com/CartoDB/Windshaft/pull/506
