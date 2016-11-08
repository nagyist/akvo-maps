This docker image contains a PostGIS enabled "akvo" database
accessible as user "akvo" with password "akvo" on TCP port 5432
of the IP address of the docker image.

Use "make start" to start the image, then find out the IP address
of the image with something like this:

```sh
IP=`docker inspect akvo-postgis | grep '"IPAddress":' | head -1 | sed 's/.*: "//;s/".*//'`
PGPASSWORD=akvo psql -h ${IP} -U akvo -p 5432
```

