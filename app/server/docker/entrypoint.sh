#!/usr/bin/env bash
set -eu

PATH_CONFIG=/app/src/resources/config.json
echo "Waiting for config at $PATH_CONFIG"
while [ ! -e $PATH_CONFIG ]; do
  sleep 1
done

node dist/index.js --config /app/src/resources
