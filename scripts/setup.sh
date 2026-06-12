#!/usr/bin/env bash
# NexusHub one-command local setup (PRD goal G5: no DevOps expertise needed).
#   ./scripts/setup.sh
set -euo pipefail

cd "$(dirname "$0")/.."

bold() { printf '\033[1m%s\033[0m\n' "$1"; }
fail() { printf '\033[31m✗ %s\033[0m\n' "$1"; exit 1; }
ok()   { printf '\033[32m✓ %s\033[0m\n' "$1"; }

bold "NexusHub setup"

# 1. Prerequisites
command -v docker >/dev/null 2>&1 || fail "Docker is required: https://docs.docker.com/get-docker/"
docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is required"
ok "Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"

# 2. Environment file
if [ ! -f .env ]; then
  cp .env.example .env
  ok "Created .env from .env.example"
  bold ""
  bold "ACTION REQUIRED: edit .env with your Supabase project keys."
  bold "  1. Create a project at https://supabase.com/dashboard"
  bold "  2. Copy URL + anon key + service role key into .env"
  bold "  3. Apply the database (see step printed below)"
  bold ""
else
  ok ".env already exists"
fi

# 3. Database reminder
bold "Database setup (run once against your Supabase project):"
echo "  Run these files in the Supabase SQL editor, in order:"
echo "    packages/database/migrations/001..007"
echo "    packages/database/rls/001..006"
echo "    packages/database/seed/seed.sql   (optional dev data)"
echo ""

# 4. Start the stack
read -r -p "Start the full stack now with docker compose? [Y/n] " answer
case "${answer:-Y}" in
  [Yy]*)
    docker compose up --build -d
    ok "Stack starting in the background"
    echo ""
    echo "  Web app:       http://localhost:3100"
    echo "  API + Swagger: http://localhost:3000/docs"
    echo "  NATS monitor:  http://localhost:8222"
    echo ""
    echo "  Logs: docker compose logs -f"
    ;;
  *)
    echo "Skipped. Start later with: docker compose up --build"
    ;;
esac
