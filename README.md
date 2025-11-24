# oftheyear

## CI/CD

Branche de deploy CI/CD : `main`

## Maintenance serveur

### Nettoyage de l'espace disque

Docker accumule les anciennes images à chaque déploiement. Pour nettoyer :

```bash
# Nettoyage manuel complet
docker system prune -a -f --volumes

# Garder seulement les 2 dernières images
for service in frontend backend; do
  docker images ghcr.io/choppything/oftheyear-$service --format "{{.ID}}" | tail -n +3 | xargs -r docker rmi -f
done

# Vérifier l'espace
df -h
docker system df
```

Le script `deploy.sh` nettoie automatiquement les anciennes images à chaque déploiement.