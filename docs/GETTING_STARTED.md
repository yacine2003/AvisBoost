# 🚀 Guide de Démarrage - AvisBoost

Ce guide vous accompagne pas à pas pour installer et lancer AvisBoost sur votre machine.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- ✅ **Node.js** 18 ou supérieur ([télécharger](https://nodejs.org/))
- ✅ **npm** (inclus avec Node.js)
- ✅ **PostgreSQL** 14+ ([télécharger](https://www.postgresql.org/download/))
  - *Alternative: utilisez SQLite pour le développement*
- ✅ **Git** ([télécharger](https://git-scm.com/))

### Comptes nécessaires

- 🔐 **Stripe** - Pour les paiements ([créer un compte](https://stripe.com))
- 🤖 **Discord Developer** - Pour le bot ([créer une app](https://discord.com/developers))
- 📧 **Gmail** (ou autre SMTP) - Pour les emails

---

## 🎬 Installation - Étape par Étape

### Étape 1: Cloner le projet

```bash
# Cloner le repository
git clone https://github.com/votre-username/avisboost.git

# Entrer dans le dossier
cd AvisBoost
```

### Étape 2: Installer les dépendances

```bash
# Backend
cd backend
npm install

# Discord Bot
cd ../discord-bot
npm install

# Retour à la racine
cd ..
```

### Étape 3: Configurer PostgreSQL

**Option A: PostgreSQL**

```bash
# Créer une base de données
createdb avisboost

# Ou via psql
psql -U postgres
CREATE DATABASE avisboost;
\q
```

**Option B: SQLite (développement uniquement)**

Dans `backend/.env`, utilisez:
```env
DATABASE_URL="file:./dev.db"
```

### Étape 4: Configurer le Backend

```bash
cd backend

# Copier le fichier d'exemple
cp .env.example .env
```

Éditez `backend/.env`:

```env
# Base de données
DATABASE_URL="postgresql://postgres:password@localhost:5432/avisboost"

# JWT
JWT_SECRET="changez_moi_avec_une_chaine_aleatoire_tres_longue"
JWT_EXPIRES_IN=24h

# Stripe (récupérez sur https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY="sk_test_VOTRE_CLE"
STRIPE_PUBLISHABLE_KEY="pk_test_VOTRE_CLE"
STRIPE_WEBHOOK_SECRET="whsec_VOTRE_WEBHOOK_SECRET"

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre.email@gmail.com
SMTP_PASSWORD=votre_mot_de_passe_app
EMAIL_FROM="AvisBoost <noreply@avisboost.com>"

# URLs
FRONTEND_URL=http://localhost:8080
API_URL=http://localhost:3000
```

### Étape 5: Initialiser la base de données

```bash
# Toujours dans backend/

# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma migrate dev --name init

# (Optionnel) Ouvrir Prisma Studio pour visualiser
npx prisma studio
```

### Étape 6: Configurer le Bot Discord

#### 6.1 Créer l'application Discord

1. Aller sur https://discord.com/developers/applications
2. Cliquer sur "New Application"
3. Donner un nom: "AvisBoost"
4. Aller dans "Bot" (menu gauche)
5. Cliquer "Add Bot"
6. Copier le **Token** (bouton "Copy")

#### 6.2 Activer les Intents

Toujours dans "Bot":
- ✅ Cocher "MESSAGE CONTENT INTENT"
- ✅ Cocher "SERVER MEMBERS INTENT"

#### 6.3 Récupérer le Client ID

1. Aller dans "General Information"
2. Copier "APPLICATION ID"

#### 6.4 Configurer le Bot

```bash
cd ../discord-bot

# Copier le fichier d'exemple
cp .env.example .env
```

Éditez `discord-bot/.env`:

```env
DISCORD_BOT_TOKEN=votre_token_bot
DISCORD_CLIENT_ID=votre_application_id
DISCORD_GUILD_ID=votre_server_id_optionnel

API_URL=http://localhost:3000
```

#### 6.5 Inviter le Bot sur votre serveur

URL (remplacez `CLIENT_ID`):
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=2147485696&scope=bot%20applications.commands
```

### Étape 7: Configurer Stripe Webhooks

1. Aller sur https://dashboard.stripe.com/test/webhooks
2. Cliquer "Add endpoint"
3. URL: `http://localhost:3000/api/payments/webhooks/stripe`
4. Événements à écouter:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copier le "Signing secret"
6. Le mettre dans `backend/.env` → `STRIPE_WEBHOOK_SECRET`

### Étape 8: Configurer Gmail (Email)

1. Aller sur votre compte Google
2. Sécurité → Validation en deux étapes (activer)
3. Sécurité → Mots de passe des applications
4. Créer un mot de passe pour "Mail"
5. Copier ce mot de passe dans `SMTP_PASSWORD`

---

## 🚀 Lancer l'application

### Option 1: Démarrage manuel (3 terminaux)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Vous devriez voir:
```
✅ Base de données connectée avec succès
🚀 Serveur démarré sur le port 3000
```

**Terminal 2 - Discord Bot:**
```bash
cd discord-bot
npm start
```

Vous devriez voir:
```
✅ Bot connecté en tant que AvisBoost#1234
🟢 Bot prêt à recevoir des commandes !
```

**Terminal 3 - Frontend:**
```bash
cd frontend/public
npx serve .
```

Le frontend sera disponible sur http://localhost:3000 (ou le port indiqué).

### Option 2: Avec PM2 (recommandé pour production)

```bash
# Installer PM2 globalement
npm install -g pm2

# Créer ecosystem.config.js à la racine
pm2 start ecosystem.config.js

# Voir les logs
pm2 logs

# Arrêter
pm2 stop all
```

---

## ✅ Vérifier que tout fonctionne

### 1. Tester l'API

```bash
curl http://localhost:3000/health
```

Réponse attendue:
```json
{
  "success": true,
  "message": "API AvisBoost fonctionnelle",
  "timestamp": "2026-01-31T..."
}
```

### 2. Tester le Discord Bot

Dans Discord, tapez:
```
/help
```

Le bot devrait répondre avec la liste des commandes.

### 3. Tester le Frontend

1. Ouvrir http://localhost:3000 (ou le port de serve)
2. Cliquer sur "Créer un compte"
3. S'inscrire avec vos informations
4. Vous devriez être redirigé vers le dashboard

---

## 🔧 Résolution des problèmes

### Erreur: "Cannot find module '@prisma/client'"

```bash
cd backend
npx prisma generate
```

### Erreur: "Database connection failed"

- Vérifiez que PostgreSQL est démarré
- Vérifiez DATABASE_URL dans `.env`
- Testez la connexion: `psql -U postgres -d avisboost`

### Erreur: "Invalid Discord token"

- Vérifiez que le token est correct (pas d'espaces)
- Régénérez le token si nécessaire

### Erreur: "Stripe webhook signature verification failed"

- Utilisez `stripe listen --forward-to localhost:3000/api/payments/webhooks/stripe`
- Ou exposez votre localhost avec ngrok pour les tests

### Le bot Discord ne répond pas

- Vérifiez que les intents sont activés
- Vérifiez que le bot a les permissions sur le serveur
- Attendez quelques minutes (enregistrement des commandes)

### Erreur SMTP lors de l'envoi d'email

- Vérifiez SMTP_USER et SMTP_PASSWORD
- Activez "Accès applications moins sécurisées" ou utilisez un mot de passe d'application
- Vérifiez le port (587 pour TLS, 465 pour SSL)

---

## 📱 Prochaines étapes

Maintenant que tout fonctionne:

1. **Créez votre premier compte** sur le frontend
2. **Testez une commande** via l'interface web
3. **Testez le bot Discord** avec `/order`
4. **Consultez le dashboard** pour voir vos statistiques

---

## 📚 Documentation supplémentaire

- [README principal](../README.md)
- [Documentation API](../backend/README.md)
- [Documentation Bot Discord](../discord-bot/README.md)
- [Architecture](../ARCHITECTURE.md)
- [Base de données](../DATABASE.md)

---

## 🆘 Besoin d'aide ?

- 📧 Email: contact@avisboost.com
- 💬 Discord: [Rejoindre le serveur](https://discord.gg/avisboost)
- 🐛 Issues: [GitHub Issues](https://github.com/votre-username/avisboost/issues)

---

**Bon développement ! 🚀**
