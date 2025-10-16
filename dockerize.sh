#!/bin/bash

echo "Check Mysql Connect."
dockerize -wait tcp://$DB_HOST:$DB_PORT -timeout 20s

echo "Mysql Done."
node dist/main.js