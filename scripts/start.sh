#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "[OpsBoard] DATABASE_URL encontrado. Aplicando migrations..."
  if ! prisma migrate deploy; then
    echo "[OpsBoard] ERRO: Falha ao aplicar migrations. Verifique DATABASE_URL e permissões do banco."
    exit 1
  fi

  echo "[OpsBoard] Carregando dados demo via seed..."
  # Retry logic: tenta 3 vezes em caso de falha
  SEED_ATTEMPTS=0
  while [ $SEED_ATTEMPTS -lt 3 ]; do
    SEED_ATTEMPTS=$((SEED_ATTEMPTS + 1))
    echo "[OpsBoard] Tentativa de seed $SEED_ATTEMPTS/3..."
    
    if npx tsx prisma/seed.ts; then
      echo "[OpsBoard] ✅ Seed executado com sucesso!"
      break
    else
      echo "[OpsBoard] ⚠️ Tentativa $SEED_ATTEMPTS falhou. Aguardando 2 segundos..."
      sleep 2
    fi
  done

  if [ $SEED_ATTEMPTS -eq 3 ]; then
    echo "[OpsBoard] ⚠️ AVISO: Seed falhou após 3 tentativas. O banco pode estar incompleto."
  fi
else
  echo "[OpsBoard] ERRO: DATABASE_URL não definido. Configure a variável de ambiente antes de iniciar."
  exit 1
fi

echo "[OpsBoard] 🚀 Iniciando aplicação na porta ${PORT:-3000}..."
exec next start -p "${PORT:-3000}"
