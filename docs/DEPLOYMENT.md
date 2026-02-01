# 🚀 Guide de Déploiement - AvisBoost

Guide complet pour déployer AvisBoost en production.

---

## 📋 Prérequis Production

- ✅ Serveur VPS (Ubuntu 20.04+ recommandé)
- ✅ Nom de domaine (ex: avisboost.com)
- ✅ Certificat SSL (Let's Encrypt)
- ✅ PostgreSQL 14+
- ✅ Node.js 18+
- ✅ Nginx
- ✅ PM2

---

## 🌍 Option 1: VPS (Recommandé)

### Étape 1: Préparer le serveur

```bash
# Se connecter au serveur
ssh user@votre-serveur.com

# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installer PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Installer Nginx
sudo apt install -y nginx

# Installer PM2
sudo npm install -g pm2

# Installer Git
sudo apt install -y git
```

### Étape 2: Configurer PostgreSQL

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE avisboost;
CREATE USER avisboost_user WITH PASSWORD 'mot_de_passe_securise';
GRANT ALL PRIVILEGES ON DATABASE avisboost TO avisboost_user;
\q
```

### Étape 3: Cloner et installer le projet

```bash
# Créer le dossier d'application
sudo mkdir -p /var/www/avisboost
sudo chown $USER:$USER /var/www/avisboost

# Cloner le projet
cd /var/www/avisboost
git clone https://github.com/votre-username/avisboost.git .

# Installer les dépendances
cd backend && npm install --production
cd ../discord-bot && npm install --production
```

### Étape 4: Configurer les variables d'environnement

```bash
# Backend
cd /var/www/avisboost/backend
nano .env
```

```env
NODE_ENV=production
PORT=3000
API_URL=https://api.avisboost.com

DATABASE_URL="postgresql://avisboost_user:mot_de_passe@localhost:5432/avisboost"

JWT_SECRET=votre_secret_production_tres_long_et_securise
JWT_EXPIRES_IN=24h

STRIPE_SECRET_KEY=sk_live_votre_cle_production
STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_production
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_production

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre.email@gmail.com
SMTP_PASSWORD=votre_mot_de_passe_app
EMAIL_FROM="AvisBoost <noreply@avisboost.com>"

FRONTEND_URL=https://avisboost.com
```

```bash
# Discord Bot
cd /var/www/avisboost/discord-bot
nano .env
```

```env
NODE_ENV=production
DISCORD_BOT_TOKEN=votre_token_production
DISCORD_CLIENT_ID=votre_client_id
API_URL=https://api.avisboost.com
```

### Étape 5: Initialiser la base de données

```bash
cd /var/www/avisboost/backend
npx prisma generate
npx prisma migrate deploy
```

### Étape 6: Configurer PM2

```bash
cd /var/www/avisboost

# Démarrer les applications
pm2 start ecosystem.config.js

# Configurer PM2 pour démarrer au boot
pm2 startup
pm2 save

# Vérifier le statut
pm2 status
pm2 logs
```

### Étape 7: Configurer Nginx

```bash
sudo nano /etc/nginx/sites-available/avisboost
```

```nginx
# API Backend
server {
    listen 80;
    server_name api.avisboost.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Augmenter la taille maximale pour les uploads
    client_max_body_size 10M;
}

# Frontend
server {
    listen 80;
    server_name avisboost.com www.avisboost.com;

    root /var/www/avisboost/frontend/public;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

```bash
# Activer la configuration
sudo ln -s /etc/nginx/sites-available/avisboost /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

### Étape 8: Configurer SSL avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir les certificats
sudo certbot --nginx -d avisboost.com -d www.avisboost.com -d api.avisboost.com

# Renouvellement automatique (déjà configuré par défaut)
sudo certbot renew --dry-run
```

### Étape 9: Configurer le firewall

```bash
# Installer UFW
sudo apt install -y ufw

# Configurer les règles
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

---

## ☁️ Option 2: Heroku

### Préparer l'application

```bash
# Créer un Procfile à la racine
echo "web: cd backend && npm start" > Procfile
echo "worker: cd discord-bot && npm start" >> Procfile

# Créer un fichier heroku.yml
cat > heroku.yml << EOF
build:
  docker:
    web: Dockerfile
run:
  web: cd backend && npm start
  worker: cd discord-bot && npm start
EOF
```

### Déployer sur Heroku

```bash
# Installer Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Se connecter
heroku login

# Créer l'application
heroku create avisboost

# Ajouter PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Configurer les variables d'environnement
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=votre_secret
heroku config:set STRIPE_SECRET_KEY=sk_live_...
# ... etc

# Déployer
git push heroku main

# Initialiser la base de données
heroku run npx prisma migrate deploy

# Voir les logs
heroku logs --tail
```

---

## 🐳 Option 3: Docker

### Créer les Dockerfiles

**backend/Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
```

**docker-compose.yml (à la racine):**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: avisboost
      POSTGRES_USER: avisboost
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://avisboost:${DB_PASSWORD}@postgres:5432/avisboost
      JWT_SECRET: ${JWT_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
    depends_on:
      - postgres
    restart: unless-stopped

  discord-bot:
    build: ./discord-bot
    environment:
      DISCORD_BOT_TOKEN: ${DISCORD_BOT_TOKEN}
      API_URL: http://backend:3000
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### Déployer avec Docker

```bash
# Construire les images
docker-compose build

# Démarrer les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

---

## 🔒 Sécurité en Production

### Checklist de sécurité

- [ ] Variables d'environnement sécurisées (pas de valeurs par défaut)
- [ ] JWT_SECRET long et aléatoire (min 64 caractères)
- [ ] HTTPS activé avec certificat valide
- [ ] Firewall configuré (seulement ports 80, 443, 22)
- [ ] Rate limiting activé
- [ ] Helmet.js activé dans Express
- [ ] CORS configuré correctement
- [ ] Base de données sécurisée (pas d'accès public)
- [ ] Logs configurés et surveillés
- [ ] Backups automatiques de la base de données
- [ ] Mises à jour de sécurité automatiques

### Générer un JWT_SECRET sécurisé

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# Installer PM2 Plus (optionnel)
pm2 link <secret_key> <public_key>

# Voir les métriques
pm2 monit
```

### Logs

```bash
# Logs PM2
pm2 logs

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs système
sudo journalctl -u nginx -f
```

---

## 🔄 Mises à jour

### Mettre à jour l'application

```bash
cd /var/www/avisboost

# Récupérer les dernières modifications
git pull origin main

# Mettre à jour les dépendances
cd backend && npm install --production
cd ../discord-bot && npm install --production

# Appliquer les migrations
cd ../backend
npx prisma migrate deploy

# Redémarrer les services
pm2 restart all
```

---

## 💾 Backups

### Backup automatique PostgreSQL

```bash
# Créer un script de backup
sudo nano /usr/local/bin/backup-avisboost.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/avisboost"
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
pg_dump -U avisboost_user avisboost > $BACKUP_DIR/db_$DATE.sql

# Garder seulement les 7 derniers backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Rendre exécutable
sudo chmod +x /usr/local/bin/backup-avisboost.sh

# Ajouter au cron (tous les jours à 2h du matin)
sudo crontab -e
```

```
0 2 * * * /usr/local/bin/backup-avisboost.sh >> /var/log/backup-avisboost.log 2>&1
```

---

## 🆘 Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs
pm2 logs
pm2 describe avisboost-backend

# Vérifier les variables d'environnement
cd /var/www/avisboost/backend
cat .env

# Vérifier la base de données
sudo -u postgres psql -d avisboost -c "SELECT 1"
```

### Erreur 502 Bad Gateway

```bash
# Vérifier que l'application tourne
pm2 status

# Vérifier les ports
sudo netstat -tlnp | grep 3000

# Vérifier la configuration Nginx
sudo nginx -t
```

---

**Bon déploiement ! 🚀**

Pour toute question: contact@avisboost.com
