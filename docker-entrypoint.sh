#!/bin/sh
set -e

if [ "$(id -u)" = "0" ]; then
  if [ -d "/app/data" ]; then
    chown -R node:node /app/data
  fi
fi

if [ "$1" = "node" ] && [ "$2" = "/app/backend/dist/index.js" ] && [ -n "$CREATE_OWNER" ]; then
  echo "Initializing owner account: $CREATE_OWNER"

  set -- "$@" --create-owner "$CREATE_OWNER"
fi

if [ "$(id -u)" = "0" ]; then
  exec gosu node "$@"
fi

exec "$@"
