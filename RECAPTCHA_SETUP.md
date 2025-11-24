# Configuration reCAPTCHA v3

## ✅ Implémentation terminée

reCAPTCHA v3 a été ajouté aux formulaires de login et d'inscription **sans dépendances npm externes** - uniquement le script Google natif.

## 🔧 Configuration requise

### 1. Ajouter le secret GitHub

Dans les paramètres du repository GitHub (Settings > Secrets and variables > Actions), ajouter :

```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY = votre-site-key-ici
```

### 2. Configurer le serveur

Sur le serveur dans `/opt/oftheyear/.env`, ajouter :

```bash
# reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=votre-site-key-ici
RECAPTCHA_SECRET_KEY=votre-secret-key-ici
```

### 3. Redéployer

Le CI/CD va automatiquement rebuilder les images avec la nouvelle clé site incluse. Si besoin de redéployer manuellement :

```bash
cd /opt/oftheyear
./deploy.sh
```

## 📋 Comment ça marche

### Frontend (zéro dépendances)
- **Hook `useRecaptcha`** : Charge dynamiquement le script Google et expose `executeRecaptcha(action)`
- **RegisterForm** : Appelle `executeRecaptcha('register')` avant de soumettre, envoie le token au backend
- **LoginForm** : Appelle `executeRecaptcha('login')` avant de soumettre, envoie le token au backend
- Invisible pour l'utilisateur (v3 = pas de checkbox)

### Backend
- **RecaptchaService** : Valide le token avec l'API Google
- Vérifie le score (minimum 0.5) et l'action
- Rejette les requêtes avec un score trop bas (bots suspects)
- **auth.controller** : Valide le token avant register/login

## 🔐 Sécurité

- Les tokens reCAPTCHA sont à usage unique
- Le backend vérifie chaque token avec l'API Google (pas de validation côté client uniquement)
- Score minimum de 0.5 pour accepter la requête
- En dev sans `RECAPTCHA_SECRET_KEY`, la validation est skip (pour faciliter les tests locaux)

## 📝 Note importante

Le `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` est embarqué dans le build frontend (c'est normal, cette clé est publique). La `RECAPTCHA_SECRET_KEY` reste sur le backend uniquement.

## ✨ Avantages de cette implémentation

- ✅ Zéro dépendance npm (juste le script Google officiel)
- ✅ Invisible pour l'utilisateur (pas de checkbox à cocher)
- ✅ Protection contre les bots sur login et register
- ✅ Score-based filtering (rejette les requêtes suspectes)
- ✅ Validation backend robuste
- ✅ Logs détaillés pour debugging
