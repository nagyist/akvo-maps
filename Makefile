build:
	$(MAKE) -C images/base $@
	$(MAKE) -C images/postgis $@
	$(MAKE) -C images/redis $@
	$(MAKE) -C images/tiler $@
	@echo "\nNow make start (or make restart)\n"

stop:
	$(MAKE) -C images/tiler $@
	$(MAKE) -C images/redis $@
	$(MAKE) -C images/postgis $@

start:
	$(MAKE) -C images/postgis $@
	$(MAKE) -C images/redis $@
	$(MAKE) -C images/tiler $@

restart:
	$(MAKE) stop
	$(MAKE) start

tiler-logs:
	docker logs -f akvo-tiler

postgis-logs:
	docker logs -f akvo-postgis

redis-logs:
	docker logs -f akvo-redis
