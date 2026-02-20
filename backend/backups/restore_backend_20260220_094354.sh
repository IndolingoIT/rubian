#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./restore_*.sh /path/to/archive.tar.gz /path/to/new_folder
#
# Example:
#   ./restore_backend_20260219_120000.sh backups/backend_20260219_120000.tar.gz ./backend_new

ARCHIVE="${1:?archive path required}"
DEST="${2:?destination folder required}"

mkdir -p "$DEST"
tar -xzf "$ARCHIVE" -C "$DEST"

cd "$DEST"

if [[ -f .env.example && ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example (edit if needed)."
fi

echo "Building & starting containers..."
podman-compose up -d --build

echo "Running migrations (if alembic exists)..."
if [[ -f alembic.ini ]]; then
  set +e
  podman-compose exec api alembic upgrade head
  set -e
fi

echo "Quick smoke tests..."
set +e
curl -sS -o /dev/null -w "  /api/health         -> %{http_code}\n" "http://localhost:8080/api/health"
curl -sS -o /dev/null -w "  /api/docs           -> %{http_code}\n" "http://localhost:8080/api/docs"
curl -sS -o /dev/null -w "  /api/openapi.json   -> %{http_code}\n" "http://localhost:8080/api/openapi.json"
set -e

echo "DONE. Open: http://localhost:8080/api/docs"
