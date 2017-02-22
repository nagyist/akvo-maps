NAME=akvo-nginx-secured


build:
	docker build -t $(NAME) .

start:
	docker run --name $(NAME) \
    --link akvo-varnish \
    --link akvo-tiler \
    -d \
    $(NAME)
	@cd ../../ && \
	TIP=`docker inspect $(NAME) | grep '"IPAddress":' | head -1 | sed 's/.*: "//;s/".*//'`; \
  URL="file://$${PWD}/viewer/index.html#http://$${TIP}/akvo/layergroup"; \
	echo "\nNow visit: $${URL}"; \
	echo "Obtain token via $${PWD}/util/get_token.sh\n";

stop:
	docker rm -f $(NAME)

restart:
	$(MAKE) stop
	$(MAKE) start

start-debug:
	docker run --name $(NAME) \
    --link akvo-varnish \
    --link akvo-tiler \
    -d \
    -v $(PWD):/usr/local/openresty/nginx/conf \
    $(NAME)
	@cd ../../ && \
	TIP=`docker inspect $(NAME) | grep '"IPAddress":' | head -1 | sed 's/.*: "//;s/".*//'`; \
  URL="file://$${PWD}/viewer/index.html#http://$${TIP}/akvo/layergroup"; \
	echo "\nNow visit (secured): $${URL}\n ";

restart-debug:
	$(MAKE) stop
	$(MAKE) start-debug

logs:
	docker logs -f $(NAME)
