# Redis server

FROM akvo-base

RUN apt-get update && apt-get install -y \
  redis-server \
  redis-tools

EXPOSE      6379
ENTRYPOINT  ["/usr/bin/redis-server"]
