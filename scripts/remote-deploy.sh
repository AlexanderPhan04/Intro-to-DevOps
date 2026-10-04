#!/usr/bin/env bash
# Runs ON THE VPS, inside the deploy directory (e.g. /opt/intro-devops/production).
#
# Usage:
#   remote-deploy.sh <tag>        deploy an image tag, auto-rollback if unhealthy
#   remote-deploy.sh --rollback   redeploy the previously running tag
#
# State files kept next to this script:
#   .current_tag   tag currently running
#   .previous_tag  tag that ran before the current one
set -euo pipefail

cd "$(dirname "$0")"

# Isolated registry credentials so we never touch the server's global docker login.
export DOCKER_CONFIG="$PWD/.docker"

COMPOSE_FILE_ARGS=(-f docker-compose.prod.yml)
WAIT_TIMEOUT="${WAIT_TIMEOUT:-180}"

log() { echo "[deploy $(date -u +%H:%M:%S)] $*"; }

compose() { docker compose "${COMPOSE_FILE_ARGS[@]}" "$@"; }

release() {
  export IMAGE_TAG="$1"
  compose pull app || log "Pull failed, falling back to local image if present"
  compose up -d --remove-orphans --wait --wait-timeout "$WAIT_TIMEOUT"
}

current="$(cat .current_tag 2>/dev/null || true)"

if [[ "${1:-}" == "--rollback" ]]; then
  target="$(cat .previous_tag 2>/dev/null || true)"
  if [[ -z "$target" ]]; then
    log "No previous tag recorded, nothing to roll back to"
    exit 1
  fi
  log "Manual rollback requested"
else
  target="${1:?Usage: remote-deploy.sh <tag> | --rollback}"
fi

log "Deploying ${target} (currently running: ${current:-none})"

if release "$target"; then
  if [[ -n "$current" && "$current" != "$target" ]]; then
    echo "$current" > .previous_tag
  fi
  echo "$target" > .current_tag
  log "Deploy of ${target} succeeded"
  exit 0
fi

log "Deploy of ${target} failed health checks, recent app logs:"
compose logs --tail 50 app || true

if [[ -n "$current" && "$current" != "$target" ]]; then
  log "Rolling back to ${current}"
  if release "$current"; then
    log "Rollback to ${current} succeeded"
  else
    log "Rollback to ${current} FAILED, manual action required"
  fi
else
  log "No previous version to roll back to"
fi

exit 1
