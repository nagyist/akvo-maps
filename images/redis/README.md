This docker image contains a redis server listening on TCP port 6379
of the IP address of the docker image.

Use "make start" to start the image, then find out the IP address
of the image with something like this:

```sh
RIP=`docker inspect akvo-redis | grep '"IPAddress":' | head -1 | sed 's/.*: "//;s/".*//'`
```

