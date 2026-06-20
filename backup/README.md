# Backup OfTheYear — pull SSH

Sauvegarde **tirée** (pull) depuis une machine de backup : elle se connecte en
SSH au serveur, récupère un dump PostgreSQL + les fichiers de config + les uploads,
vérifie l'intégrité et applique la rotation. Aucun secret n'est stocké dans ce dépôt.

## Rétention

| Dossier    | Fréquence            | Conservation        |
|------------|----------------------|---------------------|
| `daily/`   | 1 / jour             | 31 jours            |
| `monthly/` | le 1er du mois       | 60 mois (5 ans)     |

## Contenu d'un backup

| Fichier                     | Contenu                                         |
|-----------------------------|--------------------------------------------------|
| `db_<ts>.sql.gz`            | `pg_dump --clean --if-exists` (gzip)            |
| `files_<ts>.tar.gz`         | `docker-compose.prod.yml` + `.env` + nginx conf |
| `uploads_<ts>.tar.gz`       | `uploads/` + `private/` (bind mounts)            |

---

## Installation

### 1. Clé SSH dédiée

Sur la machine de backup :

```bash
ssh-keygen -t ed25519 -f ~/.ssh/oftheyear_backup -C "oftheyear-backup"
ssh-copy-id -i ~/.ssh/oftheyear_backup.pub -p <port> <user>@<serveur>
```

### 2. Vérifier l'accès docker (sans sudo)

```bash
ssh -i ~/.ssh/oftheyear_backup -p <port> <user>@<serveur> \
  'docker exec oftheyear-db-1 echo ok'
```

### 3. Installer le script

```bash
mkdir -p ~/backups/oftheyear/{daily,monthly}
cp backup.sh ~/backups/oftheyear/backup.sh
chmod 700 ~/backups/oftheyear/backup.sh
```

Éditer la config en tête de `~/backups/oftheyear/backup.sh` :

| Variable        | Description                                  |
|-----------------|----------------------------------------------|
| `REMOTE_USER`   | utilisateur SSH distant                      |
| `REMOTE_HOST`   | hôte / IP du serveur                         |
| `REMOTE_PORT`   | port SSH                                     |
| `SSH_KEY`       | chemin de la clé privée                      |
| `REMOTE_DIR`    | `/opt/oftheyear`                             |
| `PG_CONTAINER`  | `oftheyear-db-1`                             |
| `DEST`          | dossier local des backups                    |

### 4. Test manuel

```bash
~/backups/oftheyear/backup.sh
tail -n 20 ~/backups/oftheyear/backup.log
ls -lh ~/backups/oftheyear/daily/
```

### 5. Crontab quotidien (03h15)

```bash
crontab -e
```

Ajouter :

```cron
15 3 * * * /home/choppy/Project/BackupConf/oftheyear/backup.sh >> /home/choppy/Project/BackupConf/oftheyear/cron.log 2>&1
```

---

## Restauration

Voir [`RESTORE.md`](./RESTORE.md).
