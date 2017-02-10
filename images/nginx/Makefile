NAME=akvo-nginx


build:
	docker build -t $(NAME) .

start:
	docker run --name $(NAME) \
    --link akvo-varnish \
    -d \
    $(NAME)
	@cd ../../ && \
	TIP=`docker inspect akvo-nginx | grep '"IPAddress":' | head -1 | sed 's/.*: "//;s/".*//'`; \
  URL="file://$${PWD}/viewer/index.html#http://$${TIP}/api/akvo/layergroup"; \
	echo "\nNow visit: $${URL}\n ";

stop:
	docker rm -f $(NAME)

restart:
	$(MAKE) stop
	$(MAKE) start

logs:
	docker logs -f $(NAME)
