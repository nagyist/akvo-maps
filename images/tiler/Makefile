build:
	docker build -t akvo-tiler .

start:
	docker run --name akvo-tiler \
    --link akvo-postgis \
    --link akvo-redis \
    $$AKVO_DOCKER_WINDSHAFT_OPTIONS \
    -d \
    akvo-tiler
	@cd ../../ && \
	TIP=`docker inspect akvo-tiler | grep '"IPAddress":' | head -1 | sed 's/.*: "//;s/".*//'`; \
  URL="file://$${PWD}/viewer/index.html#http://$${TIP}:4000/akvo/layergroup"; \
	echo "\nNow visit: $${URL}\n ";

stop:
	docker rm -f akvo-tiler

restart:
	$(MAKE) stop
	$(MAKE) start

# This is a trick to live-modify and test code in the docker
# Path is the one working on my machine --strk;
restart-debug:
	AKVO_DOCKER_WINDSHAFT_OPTIONS="--volume /usr/src/cartodb/windshaft/windshaft/lib:/tiler/node_modules/windshaft/lib" \
  $(MAKE) restart
