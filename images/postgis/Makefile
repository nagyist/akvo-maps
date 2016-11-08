build:
	docker build -t akvo-maps .

start:
	docker run --name akvo-maps -d akvo-maps

stop:
	docker rm -f akvo-maps

restart:
	$(MAKE) stop
	$(MAKE) start
