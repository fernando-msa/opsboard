#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "[OpsBoard] DATABASE_URL encontrado. Aplicando migrations..."
  prisma migrate deploy
  echo "[OpsBoard] Carregando dados demo via seed..."
  npx tsx prisma/seed.ts || echo "[OpsBoard] AVISO: Seed falhou. Banco pode estar vazio."
else
  echo "[OpsBoard] AVISO: DATABASE_URL não definido. Pulando migrations, seed e iniciando app sem banco configurado."
fi

exec next start -p "${PORT:-3000}"
