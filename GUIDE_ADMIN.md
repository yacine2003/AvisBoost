# 🎯 Guide d'utilisation de l'interface Admin AvisBoost

## 📋 Ce qui a été créé pour Leo

### 1. Interface Admin complète

Une interface web dédiée où Leo peut :
- ✅ Voir **toutes les commandes** de tous les clients
- ✅ Ajouter le **lien de l'avis Google** pour chaque commande
- ✅ Marquer des commandes comme **complétées**
- ✅ Filtrer et rechercher les commandes
- ✅ Voir des **statistiques** globales

### 2. Dashboard Client mis à jour

Les clients voient maintenant :
- ✅ Une **carte verte** avec le lien de l'avis quand Leo l'a ajouté
- ✅ Un bouton **"Voir l'avis sur Google"** qui ouvre le lien dans un nouvel onglet
- ✅ Une **preuve visuelle** que l'avis a été publié

---

## 🚀 Comment utiliser l'interface Admin

### Étape 1 : Se connecter

1. Ouvrez votre navigateur
2. Allez sur : `http://localhost:8080/admin.html`
3. Connectez-vous avec :
   - **Email** : `admin@avisboost.com`
   - **Mot de passe** : `admin123`

⚠️ **Important** : Ces identifiants sont pour le développement. Changez-les en production !

---

### Étape 2 : Voir les commandes

Une fois connecté, vous verrez :

📊 **Dashboard** (vue par défaut)
- Statistiques globales
- Nombre total de commandes
- Revenus
- Utilisateurs

📦 **Commandes** (cliquez dans le menu de gauche)
- Liste de toutes les commandes de tous les clients
- Possibilité de filtrer par statut, paiement, recherche

---

### Étape 3 : Ajouter un lien d'avis

Pour chaque commande, vous pouvez :

1. Cliquez sur **"📝 Ajouter le lien"** (ou "Modifier le lien" si déjà ajouté)
2. Une fenêtre s'ouvre avec :
   - Numéro de commande
   - Nom du client
   - Nom de l'entreprise
3. Collez le **lien Google Maps de l'avis** dans le champ
   - Exemple : `https://maps.google.com/place/ChIJxxxxx/review/yyyy`
4. Cliquez sur **"💾 Enregistrer"**

✅ Le lien est maintenant **visible par le client** sur son dashboard comme preuve !

---

### Étape 4 : Marquer une commande comme complétée

Pour les commandes payées :

1. Cliquez sur **"✅ Marquer comme complétée"**
2. Confirmez l'action
3. Le statut passe à "Complétée"

---

## 🎯 Workflow complet (du début à la fin)

### Du côté CLIENT

1. **Jean** crée un compte sur `http://localhost:8080/app.html`
2. Il crée une commande pour son restaurant (20 avis)
3. Il paie via Stripe
4. Il voit sa commande sur son dashboard avec le statut "Payée"

### Du côté ADMIN (Leo)

5. **Leo** se connecte sur `http://localhost:8080/admin.html`
6. Il voit la commande de Jean dans la liste
7. Il publie l'avis sur Google
8. Il copie le lien de l'avis : `https://maps.google.com/place/xyz/review/abc123`
9. Il clique sur **"📝 Ajouter le lien"** sur la commande de Jean
10. Il colle le lien et clique sur **"💾 Enregistrer"**

### Retour côté CLIENT

11. **Jean** va sur son dashboard
12. Il voit maintenant une **carte verte** avec :
    - ✅ "Preuve d'avis disponible"
    - Un bouton **"🔗 Voir l'avis sur Google"**
13. Il clique et voit son avis sur Google Maps
14. Jean est **rassuré** : il a la preuve que l'avis existe ! 🎉

---

## 🔍 Fonctionnalités de l'interface Admin

### Filtres disponibles

- **Recherche** : Chercher par numéro de commande, nom d'entreprise, email client
- **Statut** : Filtrer par En attente, Payée, Active, Complétée, Annulée
- **Paiement** : Filtrer par Payé / Non payé

### Informations affichées pour chaque commande

- 📋 Numéro de commande
- 👤 Nom et email du client
- 🏢 Nom et type d'entreprise
- 📊 Quantité d'avis commandés
- 💰 Montant TTC
- 📅 Date de création
- 🗺️ Lien Google Maps de l'entreprise
- ✅ Lien de preuve (si ajouté)

### Actions possibles

- 📝 Ajouter/Modifier le lien de preuve
- ✅ Marquer comme complétée
- 🗺️ Voir sur Google Maps

---

## 🔐 Sécurité

- ✅ Seuls les utilisateurs avec le rôle **ADMIN** peuvent accéder à cette interface
- ✅ Les tokens JWT sont vérifiés à chaque requête
- ✅ Si le token expire, vous êtes redirigé vers la page de connexion

---

## 📊 Statistiques disponibles

Sur le dashboard admin, vous voyez :

- 📦 Commandes totales
- 💰 Commandes payées
- 🔄 Commandes en cours (actives)
- ✅ Commandes complétées
- 💵 Revenu total
- 👥 Nombre d'utilisateurs

---

## 🎨 Aperçu visuel

### Interface Admin
```
┌─────────────────────────────────────────────┐
│  ⭐ AvisBoost Admin                         │
│                                             │
│  📊 Dashboard                    [Active]   │
│  📦 Commandes                               │
│  🚪 Déconnexion                             │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  📦 Commandes totales: 15                   │
│  💰 Commandes payées: 12                    │
│  🔄 En cours: 8                             │
│  ✅ Complétées: 4                           │
│  💵 Revenu total: 1,890€                    │
│  👥 Utilisateurs: 8                         │
│                                             │
└─────────────────────────────────────────────┘
```

### Dashboard Client (avec preuve)
```
┌─────────────────────────────────────────────┐
│  Ma Pizzeria                                │
│  📋 Restaurant • 20 avis                    │
│  Commande #CMD12345                         │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ ✅ Preuve d'avis disponible          │  │
│  │                                      │  │
│  │ Votre avis a été publié ! Cliquez   │  │
│  │ ci-dessous pour le consulter.       │  │
│  │                                      │  │
│  │  [🔗 Voir l'avis sur Google]        │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  15 janvier 2026             159€           │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Technique (pour les développeurs)

### Routes API Admin créées

- `GET /api/admin/stats` - Statistiques globales
- `GET /api/admin/orders` - Liste des commandes (avec filtres)
- `PATCH /api/admin/orders/:orderId/review-link` - Ajouter/modifier lien
- `PATCH /api/admin/orders/:orderId/status` - Changer le statut

### Champ ajouté en base de données

Table `orders` :
- Nouveau champ : `reviewProofLink` (String, nullable)

---

## 📝 Notes importantes

1. **Pas besoin de `/addlist` Discord** : Leo préfère l'interface web, donc cette commande n'est plus nécessaire pour ce cas d'usage.

2. **Le lien est optionnel** : Si Leo n'a pas encore ajouté le lien, la carte verte n'apparaît pas chez le client.

3. **Modification possible** : Leo peut modifier le lien autant de fois qu'il veut.

4. **Client notifié automatiquement** : Dès que Leo ajoute le lien, le client le voit immédiatement en rafraîchissant son dashboard.

---

## ✅ C'est prêt !

Tout est fonctionnel ! Leo peut maintenant :
- 📋 Gérer toutes les commandes depuis une interface dédiée
- 🔗 Ajouter les liens de preuve pour chaque commande
- 👀 Les clients voient automatiquement ces preuves sur leur dashboard

**Interface Admin** : `http://localhost:8080/admin.html`  
**Dashboard Client** : `http://localhost:8080/app.html`
