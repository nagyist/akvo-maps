build:
	docker build -t akvo-redis .

start:
	docker run --name akvo-redis -d akvo-redis

stop:
	docker rm -f akvo-redis

restart:
	$(MAKE) stop
	$(MAKE) start
