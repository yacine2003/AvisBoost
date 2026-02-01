# 🚀 AvisBoost Backend

Backend API pour la plateforme AvisBoost - Gestion d'avis Google.

## 📦 Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+ (ou SQLite pour le développement)
- npm ou yarn

### Installation des dépendances

```bash
cd backend
npm install
```

### Configuration

1. Copier le fichier `.env.example` en `.env`:
```bash
cp .env.example .env
```

2. Configurer les variables d'environnement dans `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/avisboost"
JWT_SECRET="votre_secret_jwt"
STRIPE_SECRET_KEY="sk_test_..."
# ... autres variables
```

### Base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer la migration initiale
npm run prisma:migrate

# (Optionnel) Remplir avec des données de test
npm run prisma:seed

# Ouvrir Prisma Studio pour visualiser les données
npm run prisma:studio
```

## 🎯 Démarrage

### Développement
```bash
npm run dev
```

### Production
```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📡 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/forgot-password` - Mot de passe oublié
- `POST /api/auth/reset-password` - Réinitialiser mot de passe
- `GET /api/auth/me` - Info utilisateur connecté (🔒)

### Utilisateurs
- `GET /api/users/profile` - Profil utilisateur (🔒)
- `PUT /api/users/profile` - Modifier profil (🔒)
- `PUT /api/users/password` - Changer mot de passe (🔒)
- `GET /api/users/stats` - Statistiques utilisateur (🔒)

### Commandes
- `POST /api/orders` - Créer commande (🔒)
- `GET /api/orders` - Liste des commandes (🔒)
- `GET /api/orders/:id` - Détails commande (🔒)
- `GET /api/orders/:id/reviews` - Avis d'une commande (🔒)
- `DELETE /api/orders/:id` - Annuler commande (🔒)

### Paiements
- `POST /api/payments/create-intent` - Créer intention paiement (🔒)
- `POST /api/payments/webhooks/stripe` - Webhook Stripe
- `GET /api/payments/history` - Historique paiements (🔒)

### Services
- `GET /api/services` - Services disponibles (🔒)
- `GET /api/services/active` - Services actifs (🔒)
- `POST /api/services/:id/qrcode` - Générer QR code (🔒)
- `GET /api/services/:id/stats` - Statistiques service (🔒)

🔒 = Authentification requise (Bearer Token)

## 🔐 Authentification

Les routes protégées nécessitent un token JWT dans le header:

```
Authorization: Bearer <votre_token>
```

## 🧪 Tests

```bash
npm test
```

## 📁 Structure

```
backend/
├── src/
│   ├── config/          # Configuration (DB, Stripe)
│   ├── controllers/     # Contrôleurs
│   ├── middleware/      # Middlewares (auth, validation)
│   ├── routes/          # Routes API
│   ├── services/        # Services (email, QR code)
│   └── app.js          # Application principale
├── prisma/
│   └── schema.prisma   # Schéma base de données
├── uploads/            # Fichiers uploadés (QR codes)
├── .env.example        # Exemple configuration
└── package.json
```

## 🔧 Technologies

- **Express.js** - Framework web
- **Prisma** - ORM
- **PostgreSQL** - Base de données
- **JWT** - Authentification
- **Stripe** - Paiements
- **Nodemailer** - Emails
- **QRCode** - Génération QR codes

## 📝 License

MIT
