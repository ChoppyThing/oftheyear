# Restauration — OfTheYear

Les backups sont dans `~/backups/oftheyear/daily/` et `~/backups/oftheyear/monthly/`.

- `db_<timestamp>.sql.gz`       : dump PostgreSQL (gzip)
- `files_<timestamp>.tar.gz`    : `docker-compose.prod.yml` + `.env` + config nginx
- `uploads_<timestamp>.tar.gz`  : dossiers `uploads/` + `private/` (bind mounts)

---

## 1. Restaurer la base de données

```bash
gunzip -c db_<timestamp>.sql.gz \
  | docker exec -i <postgres_container> psql -U <user> -d <db>
```

Vérifier :

```bash
docker exec -it <postgres_container> psql -U <user> -d <db> -c '\dt'
```

## 2. Restaurer les fichiers de config

```bash
tar tzf files_<timestamp>.tar.gz
tar xzf files_<timestamp>.tar.gz -C /opt/oftheyear/ --strip-components=0
```

Pour le nginx, le fichier est archivé avec un chemin absolu. S'il n'est pas au bon endroit :

```bash
tar xzf files_<timestamp>.tar.gz -C /
```

Puis relancer :

```bash
cd /opt/oftheyear
docker compose -f docker-compose.prod.yml up -d
sudo nginx -t && sudo systemctl reload nginx
```

## 3. Restaurer les uploads et fichiers privés

```bash
tar xzf uploads_<timestamp>.tar.gz -C /opt/oftheyear/
```

## 4. Restauration complète

1. Restaurer les fichiers de config (étape 2).
2. Démarrer la stack : `docker compose -f docker-compose.prod.yml up -d`.
3. Attendre que PostgreSQL soit sain : `docker exec <postgres_container> pg_isready`.
4. Restaurer la base (étape 1).
5. Restaurer les uploads (étape 3).
6. Redémarrer le backend : `docker restart <backend_container>`.
