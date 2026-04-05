#!/bin/sh
set -eu

PROJECT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cd "$PROJECT_DIR"

if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is not installed." >&2
    exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
    echo "Docker Compose v2 is required." >&2
    exit 1
fi

mkdir -p data/static data/media

echo "Building and starting containers..."
docker compose up -d --build --remove-orphans

echo "Current container status:"
docker compose ps

echo "Deployment finished. Application should be available at http://77.105.168.144/"
