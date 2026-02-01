# 📝 API Documentation - AvisBoost

Documentation complète de l'API REST AvisBoost.

## Base URL

```
Production: https://api.avisboost.com
Development: http://localhost:3000/api
```

## Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

### Obtenir un token

```bash
POST /api/auth/login
```

### Utiliser le token

Inclure le token dans le header `Authorization`:

```
Authorization: Bearer <votre_token>
```

---

## Endpoints

### 🔐 Authentification

#### POST /api/auth/register
Créer un nouveau compte utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123",
  "fullName": "Jean Dupont"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "Jean Dupont",
      "role": "USER",
      "createdAt": "2026-01-31T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/auth/login
Se connecter à un compte existant.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "Jean Dupont",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET /api/auth/me
Obtenir les informations de l'utilisateur connecté.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Jean Dupont",
    "role": "USER",
    "status": "ACTIVE",
    "emailVerified": false,
    "createdAt": "2026-01-31T12:00:00.000Z",
    "lastLogin": "2026-01-31T14:30:00.000Z"
  }
}
```

#### POST /api/auth/forgot-password
Demander la réinitialisation du mot de passe.

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Si cet email existe, un lien de réinitialisation a été envoyé"
}
```

---

### 👤 Utilisateurs

#### GET /api/users/profile
Obtenir le profil de l'utilisateur.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Jean Dupont",
    "role": "USER",
    "status": "ACTIVE",
    "createdAt": "2026-01-31T12:00:00.000Z"
  }
}
```

#### PUT /api/users/profile
Mettre à jour le profil.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "fullName": "Jean Martin",
  "email": "nouveau@email.com"
}
```

**Response:** `200 OK`

#### GET /api/users/stats
Obtenir les statistiques utilisateur.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalOrders": 5,
    "totalReviewsOrdered": 100,
    "totalReviewsDelivered": 87,
    "totalSpent": 478.50,
    "activeOrders": 2,
    "completedOrders": 3
  }
}
```

---

### 📦 Commandes

#### POST /api/orders
Créer une nouvelle commande.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "companyName": "Mon Restaurant",
  "companyType": "Restaurant",
  "googleMapsLink": "https://maps.google.com/...",
  "quantity": 20
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Commande créée avec succès",
  "data": {
    "id": "uuid",
    "orderNumber": "CMD12345",
    "companyName": "Mon Restaurant",
    "quantity": 20,
    "price": 159.00,
    "tax": 31.80,
    "total": 190.80,
    "status": "PENDING",
    "paymentStatus": "UNPAID",
    "createdAt": "2026-01-31T12:00:00.000Z"
  }
}
```

#### GET /api/orders
Obtenir toutes les commandes de l'utilisateur.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "orderNumber": "CMD12345",
      "companyName": "Mon Restaurant",
      "quantity": 20,
      "status": "ACTIVE",
      "createdAt": "2026-01-31T12:00:00.000Z",
      "reviews": [...],
      "_count": {
        "reviews": 15
      }
    }
  ]
}
```

#### GET /api/orders/:id
Obtenir les détails d'une commande.

**Response:** `200 OK`

#### GET /api/orders/:id/reviews
Obtenir les avis d'une commande.

**Response:** `200 OK`

---

### 💳 Paiements

#### POST /api/payments/create-intent
Créer une intention de paiement Stripe.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "orderId": "uuid-de-la-commande"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx"
  }
}
```

#### POST /api/payments/webhooks/stripe
Webhook Stripe (appelé automatiquement par Stripe).

**Headers:** `stripe-signature`

**Body:** Raw body from Stripe

---

### 🔧 Services

#### GET /api/services
Obtenir les services disponibles (packs).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "starter",
      "name": "Starter",
      "quantity": 10,
      "price": 89,
      "features": [...]
    },
    ...
  ]
}
```

#### GET /api/services/active
Obtenir les services actifs de l'utilisateur.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Bad Request - Données invalides |
| 401 | Unauthorized - Token manquant ou invalide |
| 403 | Forbidden - Accès refusé |
| 404 | Not Found - Ressource introuvable |
| 409 | Conflict - Ressource existe déjà |
| 500 | Internal Server Error - Erreur serveur |

## Format des erreurs

```json
{
  "success": false,
  "message": "Message d'erreur",
  "errors": [
    {
      "field": "email",
      "message": "Email invalide"
    }
  ]
}
```

---

## Rate Limiting

- **Limite:** 100 requêtes par 15 minutes par IP
- **Header:** `X-RateLimit-Remaining`

---

## Pagination

Pour les endpoints retournant des listes:

```
GET /api/orders?page=1&limit=10
```

---

## Webhooks

### Stripe Webhook

**URL:** `POST /api/payments/webhooks/stripe`

**Événements écoutés:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

---

**Version:** 1.0.0  
**Dernière mise à jour:** 31 janvier 2026
