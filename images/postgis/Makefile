build:
	docker build -t akvo-postgis .

start:
	docker run --name akvo-postgis -d akvo-postgis

stop:
	docker rm -f akvo-postgis

restart:
	$(MAKE) stop
	$(MAKE) start
