build:
	docker build -t akvo-windshaft .

start:
	docker run --name akvo-windshaft \
    --link akvo-postgis \
    --link akvo-redis \
    -d \
    akvo-windshaft
	@cd ../../ && \
	TIP=`docker inspect akvo-windshaft | grep '"IPAddress":' | head -1 | sed 's/.*: "//;s/".*//'`; \
  URL="file://$${PWD}/viewer/index.html#http://$${TIP}:4000/akvo/layergroup"; \
	echo "\nNow visit: $${URL}\n ";

stop:
	docker rm -f akvo-windshaft

restart:
	$(MAKE) stop
	$(MAKE) start
