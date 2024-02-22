#!/usr/bin/env bash
set -eu

PATH_CONFIG=/app/src/resources/config.json
echo "Waiting for config at $PATH_CONFIG"
while [ ! -e $PATH_CONFIG ]; do
  sleep 1
done

ts-node --transpile-only src/index.ts --config src/resources
