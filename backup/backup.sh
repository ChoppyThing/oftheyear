#!/usr/bin/env bash
#
# Backup pull SSH pour OfTheYear.
# Récupère un dump PostgreSQL + les fichiers de config + les uploads + private
# depuis le serveur distant, vérifie l'intégrité, applique la rotation.
#
# Rétention :
#   - daily/   : 1 backup/jour, gardé 31 jours
#   - monthly/ : copie du backup du jour le 1er du mois, gardé 60 mois (5 ans)
#
set -euo pipefail

# ============================================================================
# CONFIG — à éditer
# ============================================================================
REMOTE_USER="choppy"
REMOTE_HOST="bentosecurity.fr"
REMOTE_PORT="1337"
SSH_KEY="$HOME/.ssh/id_rsa"
REMOTE_DIR="/opt/oftheyear"
PG_CONTAINER="oftheyear-db-1"
DEST="$HOME/backups/oftheyear"
# ============================================================================

TS="$(date +%Y%m%d_%H%M%S)"
LOG="$DEST/backup.log"

DAILY="$DEST/daily"
MONTHLY="$DEST/monthly"

DB_FILE="$DAILY/db_${TS}.sql.gz"
FILES_FILE="$DAILY/files_${TS}.tar.gz"
UPLOADS_FILE="$DAILY/uploads_${TS}.tar.gz"

SSH=(ssh -i "$SSH_KEY" -p "$REMOTE_PORT" -o BatchMode=yes -o ConnectTimeout=15 "${REMOTE_USER}@${REMOTE_HOST}")

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"
}

fail() {
    log "ERREUR: $*"
    exit 1
}

# ----------------------------------------------------------------------------
# Préparation
# ----------------------------------------------------------------------------
mkdir -p "$DAILY" "$MONTHLY"
log "=== Démarrage backup ${TS} ==="

# ----------------------------------------------------------------------------
# 1. Dump DB (SSH → gzip local, vars depuis le conteneur postgres)
# ----------------------------------------------------------------------------
log "Dump de la base de données…"
if ! "${SSH[@]}" \
    "PGPASS=\$(docker exec ${PG_CONTAINER} printenv POSTGRES_PASSWORD) \
     && PGUSER=\$(docker exec ${PG_CONTAINER} printenv POSTGRES_USER) \
     && PGDB=\$(docker exec ${PG_CONTAINER} printenv POSTGRES_DB) \
     && docker exec -e PGPASSWORD=\"\$PGPASS\" ${PG_CONTAINER} \
        pg_dump -U \"\$PGUSER\" -d \"\$PGDB\" --clean --if-exists | gzip -c" \
    > "$DB_FILE"; then
    rm -f "$DB_FILE"
    fail "Échec du dump de la base de données."
fi

# ----------------------------------------------------------------------------
# 2. Fichiers de config (compose + .env + nginx)
# ----------------------------------------------------------------------------
log "Archivage des fichiers de config…"
if ! "${SSH[@]}" \
    "tar czf - --exclude=node_modules --exclude=.next --exclude=dist \
     --exclude=vendor --exclude='*.cache' \
     -C '${REMOTE_DIR}' docker-compose.prod.yml .env \
     -C /etc/nginx/sites-available api.oftheyear.eu" \
    > "$FILES_FILE"; then
    rm -f "$FILES_FILE"
    fail "Échec de l'archivage des fichiers de config."
fi

# ----------------------------------------------------------------------------
# 3. Uploads + private (bind mounts)
# ----------------------------------------------------------------------------
log "Archivage des uploads et fichiers privés…"
if ! "${SSH[@]}" \
    "tar czf - -C '${REMOTE_DIR}' uploads private" \
    > "$UPLOADS_FILE"; then
    rm -f "$UPLOADS_FILE"
    fail "Échec de l'archivage des uploads."
fi

# ----------------------------------------------------------------------------
# 4. Intégrité (gzip -t)
# ----------------------------------------------------------------------------
log "Vérification d'intégrité…"
if ! gzip -t "$DB_FILE"; then
    fail "Intégrité KO : $DB_FILE"
fi
if ! gzip -t "$FILES_FILE"; then
    fail "Intégrité KO : $FILES_FILE"
fi
if ! gzip -t "$UPLOADS_FILE"; then
    fail "Intégrité KO : $UPLOADS_FILE"
fi
log "Intégrité OK."

# ----------------------------------------------------------------------------
# 5. Rotation
# ----------------------------------------------------------------------------
log "Rotation daily (>31 jours)…"
find "$DAILY" -name 'db_*.sql.gz'      -mtime +31 -delete
find "$DAILY" -name 'files_*.tar.gz'   -mtime +31 -delete
find "$DAILY" -name 'uploads_*.tar.gz' -mtime +31 -delete

if [ "$(date +%d)" = "01" ]; then
    log "1er du mois : copie vers monthly/ + rotation (60 mois)…"
    cp "$DB_FILE" "$FILES_FILE" "$UPLOADS_FILE" "$MONTHLY/"
    ls -1t "$MONTHLY"/db_*.sql.gz      2>/dev/null | tail -n +61 | xargs -r rm -f
    ls -1t "$MONTHLY"/files_*.tar.gz   2>/dev/null | tail -n +61 | xargs -r rm -f
    ls -1t "$MONTHLY"/uploads_*.tar.gz 2>/dev/null | tail -n +61 | xargs -r rm -f
fi

log "=== Backup ${TS} terminé avec succès ==="
log "  DB     : $DB_FILE ($(du -h "$DB_FILE" | cut -f1))"
log "  FILES  : $FILES_FILE ($(du -h "$FILES_FILE" | cut -f1))"
log "  UPLOADS: $UPLOADS_FILE ($(du -h "$UPLOADS_FILE" | cut -f1))"
