build:
	docker build -t akvo-varnish .

start:
	docker run --name akvo-varnish \
    --link akvo-tiler \
    -d \
    akvo-varnish
	@cd ../../ && \
	TIP=`docker inspect akvo-varnish | grep '"IPAddress":' | head -1 | sed 's/.*: "//;s/".*//'`; \
  URL="file://$${PWD}/viewer/index.html#http://$${TIP}/akvo/layergroup"; \
	echo "\nNow visit: $${URL}\n ";

stop:
	docker rm -f akvo-varnish

restart:
	$(MAKE) stop
	$(MAKE) start

logs:
	docker logs -f akvo-varnish
