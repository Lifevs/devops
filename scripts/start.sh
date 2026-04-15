#!/usr/bin/env bash
set -euo pipefail

echo "Checking PostgreSQL service..."

if command -v brew >/dev/null 2>&1; then
  postgres_service=$(brew services list | awk '/postgresql(@| )/ {print $1; exit}')

  if [ -n "$postgres_service" ]; then
    if brew services list | grep -E "^$postgres_service[[:space:]]+started" >/dev/null 2>&1; then
      echo "PostgreSQL service already running: $postgres_service"
    else
      echo "Starting PostgreSQL service: $postgres_service"
      brew services start "$postgres_service"
    fi
  else
    echo "No Homebrew PostgreSQL service found. If PostgreSQL is installed, you may need to start it manually."
  fi
else
  echo "Homebrew not found. Skipping PostgreSQL startup."
fi

echo "Starting server..."
exec node server.js
