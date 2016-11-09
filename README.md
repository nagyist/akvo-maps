# akvo-maps
Akvo Maps service

# docker

This repository contains 3 docker images:

- postgis, with a running PostgreSQL and a preloaded "akvo" database
- redis, with a running redis service
- tiler, with a running windshaft based server

# testing

You can build all images with a "make build" call from top-level dir.
Following that, you can start the system with "make start", and
instructions will be given in the output of the start command as
for how to test the server

More information can be found in subdirectories.
