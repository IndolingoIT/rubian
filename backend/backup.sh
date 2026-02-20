#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./backup_backend.sh
#   PROJECT_DIR=./backend ./backup_backend.sh
#   PROJECT_NAME=jurnallingua ./backup_backend.sh
#   INCLUDE_VOLUMES=true ./backup_backend.sh   (optional, tar volume data too)

PROJECT_DIR="${PROJECT_DIR:-.}"
PROJECT_NAME="${PROJECT_NAME:-backend}"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/backups}"
INCLUDE_VOLUMES="${INCLUDE_VOLUMES:-false}"

ts="$(date +%Y%m%d_%H%M%S)"
archive="${BACKUP_DIR}/${PROJECT_NAME}_${ts}.tar.gz"
restore_script="${BACKUP_DIR}/restore_${PROJECT_NAME}_${ts}.sh"

cd "$PROJECT_DIR"
mkdir -p "$BACKUP_DIR"

echo "==> [1/6] Preflight check: looking for expected files..."
req=(
  "docker-compose.yml"
  "nginx/nginx.conf"
  "app"
)
for f in "${req[@]}"; do
  if [[ ! -e "$f" ]]; then
    echo "ERROR: missing $f in $PROJECT_DIR"
    exit 1
  fi
done

echo "==> [2/6] Collect runtime snapshot info..."
{
  echo "# Snapshot generated at: $(date -Iseconds)"
  echo "# Project: $PROJECT_NAME"
  echo ""
  echo "## podman ps (matching name contains project):"
  podman ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Image}}\t{{.Ports}}" | (grep -i "$PROJECT_NAME" || true)
  echo ""
  echo "## podman-compose ps:"
  (podman-compose ps || true)
  echo ""
  echo "## nginx config (nginx/nginx.conf):"
  sed -n '1,200p' nginx/nginx.conf || true
} > "${BACKUP_DIR}/${PROJECT_NAME}_${ts}_snapshot.txt"

echo "==> [3/6] Health checks (best effort)..."
set +e
curl -sS -o /dev/null -w "  /api/health         -> %{http_code}\n" "http://localhost:8080/api/health"
curl -sS -o /dev/null -w "  /api/docs           -> %{http_code}\n" "http://localhost:8080/api/docs"
curl -sS -o /dev/null -w "  /api/openapi.json   -> %{http_code}\n" "http://localhost:8080/api/openapi.json"
set -e

echo "==> [4/6] Create archive (code + config)..."
# Exclude noise
EXCLUDES=(
  "--exclude=backups"
  "--exclude=__pycache__"
  "--exclude=.pytest_cache"
  "--exclude=.mypy_cache"
  "--exclude=.venv"
  "--exclude=.DS_Store"
  "--exclude=*.pyc"
  "--exclude=storage"         # optional: storage local output
)

tar -czf "$archive" \
  "${EXCLUDES[@]}" \
  docker-compose.yml Dockerfile requirements.txt \
  .env.example .env 2>/dev/null || true

# Some projects may not have .env (ignore if missing)
tar --append --file="${archive%.gz}" nginx app alembic alembic.ini README.md "${BACKUP_DIR}/${PROJECT_NAME}_${ts}_snapshot.txt" 2>/dev/null || true
gzip -f "${archive%.gz}" 2>/dev/null || true

# If tar --append failed due to gzip: do a clean tar in one go instead (fallback)
if [[ ! -s "$archive" ]]; then
  echo "!! Fallback: re-creating tar in one pass"
  tar -czf "$archive" \
    "${EXCLUDES[@]}" \
    docker-compose.yml Dockerfile requirements.txt \
    nginx app alembic alembic.ini README.md \
    .env.example \
    "${BACKUP_DIR}/${PROJECT_NAME}_${ts}_snapshot.txt" \
    $( [[ -f .env ]] && echo ".env" )
fi

echo "==> [5/6] Optional: include volumes data (postgres + storage) ..."
if [[ "$INCLUDE_VOLUMES" == "true" ]]; then
  echo "   INCLUDE_VOLUMES=true enabled."
  vol_tar="${BACKUP_DIR}/${PROJECT_NAME}_${ts}_volumes.tar.gz"

  # Try to detect volume names from compose (best effort heuristic)
  # You can override manually if needed:
  POSTGRES_VOL="${POSTGRES_VOL:-postgres_data}"
  STORAGE_VOL="${STORAGE_VOL:-storage_data}"

  echo "   Backing up volumes: ${POSTGRES_VOL}, ${STORAGE_VOL}"
  tmpdir="$(mktemp -d)"
  trap 'rm -rf "$tmpdir"' EXIT

  # Export volume contents using a helper container
  podman run --rm -v "${PROJECT_NAME}_${POSTGRES_VOL}:/v:ro" -v "$tmpdir:/out" alpine \
    sh -lc "cd /v && tar -czf /out/postgres_data.tar.gz ."
  podman run --rm -v "${PROJECT_NAME}_${STORAGE_VOL}:/v:ro" -v "$tmpdir:/out" alpine \
    sh -lc "cd /v && tar -czf /out/storage_data.tar.gz ."

  tar -czf "$vol_tar" -C "$tmpdir" .
  echo "   Volume archive: $vol_tar"
fi

echo "==> [6/6] Generate restore script..."
cat > "$restore_script" <<'EOS'
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
EOS

chmod +x "$restore_script"

echo ""
echo "✅ Backup done:"
echo "   Archive : $archive"
echo "   Restore : $restore_script"
echo ""
echo "Next time restore:"
echo "   $restore_script $archive ./NEW_BACKEND_FOLDER"
