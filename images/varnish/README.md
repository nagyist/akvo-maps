This docker image contains a Varnish cache service accessible
via TCP port 80 of the IP address of the docker image.

Use "make start" to start the image, then find out the IP address
of the image with something like this:

```sh
TIP=`docker inspect akvo-varnish | grep '"IPAddress":' | head -1 | sed 's/.*: "//;s/".*//'`
firefox ../../viewer/index.html?url=http://${TIP}/akvo/layergroup
```


NOTE: the image was inspired by https://github.com/jacksoncage/varnish-docker
