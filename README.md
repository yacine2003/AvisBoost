# 🌟 AvisBoost - Plateforme de Gestion d'Avis Google

> Boostez votre réputation en ligne avec des avis Google authentiques en 48h ⚡

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 📋 Table des matières

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Installation](#installation)
- [Démarrage rapide](#démarrage-rapide)
- [Configuration](#configuration)
- [Documentation](#documentation)
- [Technologies](#technologies)
- [Structure du projet](#structure-du-projet)
- [Contribution](#contribution)
- [License](#license)

---

## 🎯 Présentation

**AvisBoost** est une plateforme complète permettant aux entreprises d'améliorer leur réputation en ligne en obtenant des avis Google authentiques et vérifiés.

### Ce qui est inclus

✅ **Backend API complet** (Node.js + Express + Prisma)
✅ **Base de données** (PostgreSQL avec schéma Prisma)
✅ **Authentification JWT** sécurisée
✅ **Intégration paiement Stripe**
✅ **Bot Discord** avec commandes slash
✅ **Frontend** avec intégration API
✅ **Système de QR codes**
✅ **Emails automatisés**
✅ **Dashboard en temps réel**

---

## ✨ Fonctionnalités

### 👥 Gestion des utilisateurs
- ✅ Inscription / Connexion sécurisée
- ✅ Récupération de mot de passe par email
- ✅ Profil utilisateur personnalisable
- ✅ Dashboard personnalisé

### 📦 Gestion des commandes
- ✅ Création de commandes (10, 20, 30, 40, 50 avis)
- ✅ Suivi en temps réel
- ✅ Historique complet
- ✅ Statuts : Pending → Paid → Active → Completed

### 💳 Paiement sécurisé
- ✅ Intégration Stripe Payment Intents
- ✅ Webhooks pour validation automatique
- ✅ Gestion des statuts de paiement
- ✅ Historique des transactions

### 📊 Dashboard utilisateur
- ✅ Visualisation des commandes actives
- ✅ Statistiques détaillées
- ✅ Progression en temps réel
- ✅ Notifications

### 🤖 Bot Discord
- ✅ Commande `/order` - Créer une commande
- ✅ Commande `/addlist` - Ajouter des clients
- ✅ Commande `/stats` - Voir ses statistiques
- ✅ Commande `/help` - Aide

### 🔧 Services
- ✅ Génération de QR codes
- ✅ Envoi d'emails automatiques
- ✅ Activation automatique des services après paiement

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         UTILISATEURS                     │
│  (Web Browser + Discord)                 │
└────────────┬────────────────────────────┘
             │
    ┌────────▼────────┐      ┌──────────────┐
    │  Frontend Web   │      │ Discord Bot  │
    │  (HTML/JS)      │      │ (Discord.js) │
    └────────┬────────┘      └──────┬───────┘
             │                       │
             └───────┬───────────────┘
                     │
            ┌────────▼──────────┐
            │   Backend API     │
            │  (Express.js)     │
            └────────┬──────────┘
                     │
         ┌───────────┼────────────┐
         │           │            │
    ┌────▼────┐ ┌───▼────┐  ┌───▼─────┐
    │ Stripe  │ │ Email  │  │ QRCode  │
    │ Payment │ │Service │  │ Service │
    └─────────┘ └────────┘  └─────────┘
                     │
            ┌────────▼──────────┐
            │   PostgreSQL DB   │
            │   (Prisma ORM)    │
            └───────────────────┘
```

Voir [ARCHITECTURE.md](ARCHITECTURE.md) pour plus de détails.

---

## 🚀 Installation

### Prérequis

- **Node.js** 18+ et npm
- **PostgreSQL** 14+ (ou SQLite pour dev)
- **Compte Stripe** (clés API)
- **Compte Discord Developer** (pour le bot)
- **Serveur SMTP** (Gmail, SendGrid, etc.)

### Installation rapide

```bash
# Cloner le repository
git clone https://github.com/votre-username/avisboost.git
cd AvisBoost

# Installer toutes les dépendances
npm run install:all

# Ou installer manuellement
cd backend && npm install
cd ../discord-bot && npm install
cd ../frontend && npm install
```

---

## ⚡ Démarrage rapide

### 1️⃣ Configuration de la base de données

```bash
cd backend

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos identifiants PostgreSQL
nano .env

# Créer la base de données
npx prisma generate
npx prisma migrate dev --name init
```

### 2️⃣ Configuration des services

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/avisboost"
JWT_SECRET="votre_secret_super_securise"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
SMTP_USER="votre.email@gmail.com"
SMTP_PASSWORD="votre_mot_de_passe_app"
```

**Discord Bot** (`discord-bot/.env`):
```env
DISCORD_BOT_TOKEN="votre_token_bot"
DISCORD_CLIENT_ID="votre_client_id"
```

### 3️⃣ Démarrer les services

```bash
# Terminal 1 - Backend API
cd backend
npm run dev

# Terminal 2 - Discord Bot
cd discord-bot
npm start

# Terminal 3 - Frontend (serveur de développement)
cd frontend/public
npx serve .
```

### 4️⃣ Tester l'installation

- **API**: http://localhost:3000/health
- **Frontend**: http://localhost:3000 (ou le port de serve)
- **Discord**: Le bot devrait apparaître en ligne

---

## 🔧 Configuration

### Stripe

1. Créer un compte sur [stripe.com](https://stripe.com)
2. Récupérer les clés API (Dashboard → Developers → API Keys)
3. Configurer les webhooks :
   - URL: `https://votre-domaine.com/api/payments/webhooks/stripe`
   - Événements: `payment_intent.succeeded`, `payment_intent.payment_failed`

### Discord Bot

1. Aller sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créer une nouvelle application
3. Créer un bot et copier le token
4. Activer les intents: `GUILDS`, `GUILD_MESSAGES`
5. Inviter le bot sur votre serveur

### Email (Gmail)

1. Activer la validation en 2 étapes
2. Générer un mot de passe d'application
3. Utiliser ce mot de passe dans `SMTP_PASSWORD`

---

## 📚 Documentation

- [Architecture complète](ARCHITECTURE.md)
- [Schéma de base de données](DATABASE.md)
- [Documentation API Backend](backend/README.md)
- [Documentation Discord Bot](discord-bot/README.md)
- [Guide de déploiement](docs/DEPLOYMENT.md)

---

## 🛠️ Technologies

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma** - ORM moderne
- **PostgreSQL** - Base de données
- **JWT** - Authentification
- **Bcrypt** - Hashage des mots de passe
- **Stripe** - Paiements
- **Nodemailer** - Emails

### Frontend
- **HTML5 / CSS3** - Structure et style
- **JavaScript Vanilla** - Logique client
- **Fetch API** - Requêtes HTTP

### Discord
- **Discord.js v14** - Bibliothèque Discord
- **Slash Commands** - Commandes modernes

### DevOps
- **PM2** - Process Manager
- **Nginx** - Reverse Proxy (production)
- **Git** - Contrôle de version

---

## 📁 Structure du projet

```
AvisBoost/
├── backend/                    # API Backend
│   ├── src/
│   │   ├── config/            # Configuration (DB, Stripe)
│   │   ├── controllers/       # Contrôleurs
│   │   ├── middleware/        # Middlewares (auth, validation)
│   │   ├── routes/            # Routes API
│   │   ├── services/          # Services (email, QR)
│   │   └── app.js            # Application principale
│   ├── prisma/
│   │   └── schema.prisma     # Schéma DB
│   └── package.json
│
├── frontend/                  # Frontend Web
│   └── public/
│       ├── index.html        # Landing page
│       ├── app.html          # Dashboard
│       ├── css/              # Styles
│       └── js/               # Scripts
│           ├── api.js        # Client API
│           ├── auth.js       # Authentification
│           └── dashboard.js  # Dashboard
│
├── discord-bot/              # Bot Discord
│   └── src/
│       ├── commands/         # Commandes slash
│       ├── events/           # Événements Discord
│       └── bot.js           # Bot principal
│
├── docs/                     # Documentation
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── ARCHITECTURE.md           # Architecture système
├── DATABASE.md              # Schéma de la DB
└── README.md                # Ce fichier
```

---

## 🎨 Captures d'écran

### Landing Page
![Landing Page](docs/screenshots/landing.png)

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Discord Bot
![Discord Bot](docs/screenshots/discord.png)

---

## 🧪 Tests

```bash
# Backend
cd backend
npm test

# Test API avec curl
curl http://localhost:3000/health
```

---

## 🚢 Déploiement

### Développement local
```bash
npm run dev
```

### Production
```bash
# Avec PM2
pm2 start ecosystem.config.js

# Ou Docker
docker-compose up -d
```

Voir [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) pour plus de détails.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit vos changements (`git commit -m 'Ajout fonctionnalité'`)
4. Push vers la branche (`git push origin feature/amelioration`)
5. Ouvrir une Pull Request

---

## 📝 License

Ce projet est sous license MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👤 Auteur

**AvisBoost Team**

- Website: [avisboost.com](https://avisboost.com)
- Email: contact@avisboost.com

---

## 🙏 Remerciements

- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [Discord.js](https://discord.js.org/)
- [Stripe](https://stripe.com/)

---

## 📊 Roadmap

### Phase 1 - MVP ✅
- [x] Backend API complet
- [x] Authentification JWT
- [x] Paiements Stripe
- [x] Bot Discord
- [x] Dashboard basique

### Phase 2 - Améliorations 🚧
- [ ] Admin dashboard
- [ ] Analytics avancées
- [ ] Multi-langues
- [ ] Tests automatisés
- [ ] CI/CD Pipeline

### Phase 3 - Scale 📈
- [ ] Redis pour cache
- [ ] Queue système (Bull/RabbitMQ)
- [ ] Microservices
- [ ] API publique
- [ ] Mobile app

---

## ❓ FAQ

**Q: Comment obtenir une clé API Stripe ?**
R: Créez un compte sur stripe.com et récupérez vos clés dans Dashboard → Developers.

**Q: Le bot Discord ne se connecte pas ?**
R: Vérifiez que DISCORD_BOT_TOKEN est correct et que les intents sont activés.

**Q: Comment changer de base de données ?**
R: Modifiez DATABASE_URL dans .env et relancez les migrations Prisma.

---

<div align="center">

**⭐ Si ce projet vous a aidé, n'hésitez pas à lui donner une étoile ! ⭐**

Made with ❤️ in France 🇫🇷

</div>
