#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "[OpsBoard] DATABASE_URL encontrado. Aplicando migrations..."
  prisma migrate deploy
else
  echo "[OpsBoard] AVISO: DATABASE_URL não definido. Pulando migrations e iniciando app sem banco configurado."
fi

exec next start -p "${PORT:-3000}"
