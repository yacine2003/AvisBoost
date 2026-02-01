# 🚀 Démarrage Rapide - AvisBoost

## 📋 Prérequis

- ✅ Backend démarré sur le port 3000
- ✅ Frontend servi sur le port 8080
- ✅ Base de données PostgreSQL opérationnelle

## 🎯 Accès rapide

### Pour Leo (Admin)

1. **URL** : http://localhost:8080/admin.html
2. **Email** : `admin@avisboost.com`
3. **Mot de passe** : `admin123`

### Pour les clients

1. **URL** : http://localhost:8080/app.html
2. Créer un compte ou se connecter

---

## 🔧 Lancer les services

### Backend
```bash
cd backend
npm start
```
Le backend démarre sur `http://localhost:3000`

### Frontend
```bash
cd frontend
python3 -m http.server 8080
# ou
npx http-server -p 8080
```
Le frontend est accessible sur `http://localhost:8080`

### Bot Discord (optionnel)
```bash
cd discord-bot
npm start
```

---

## ✅ Workflow complet de test

### 1. Créer un client de test

1. Allez sur http://localhost:8080/app.html
2. Cliquez sur "Créer un compte"
3. Remplissez :
   - Nom : `Test Client`
   - Email : `test@client.com`
   - Mot de passe : `test1234`
4. Cliquez sur "Créer mon compte"

### 2. Créer une commande

1. Une fois connecté, cliquez sur "Créer une commande"
2. Remplissez :
   - Entreprise : `Pizzeria Test`
   - Type : `Restaurant`
   - Quantité : `10 avis`
   - Lien Google Maps : `https://maps.google.com/test`
3. Cliquez sur "Créer la commande"
4. Choisissez "Payer maintenant" ou "Plus tard"

### 3. Payer la commande (si Stripe configuré)

1. Sur le dashboard, cliquez sur "💳 Payer maintenant"
2. Utilisez une carte de test Stripe :
   - Numéro : `4242 4242 4242 4242`
   - Date : n'importe quelle date future
   - CVC : n'importe quel 3 chiffres
3. Validez le paiement

### 4. Leo ajoute le lien de preuve

1. **Leo se connecte** sur http://localhost:8080/admin.html
2. Email : `admin@avisboost.com`
3. Mot de passe : `admin123`
4. Cliquez sur "📦 Commandes" dans le menu
5. Trouvez la commande de `Test Client`
6. Cliquez sur "📝 Ajouter le lien"
7. Collez un lien Google : `https://maps.google.com/place/xyz/review/abc123`
8. Cliquez sur "💾 Enregistrer"

### 5. Client vérifie la preuve

1. **Retournez** sur http://localhost:8080/app.html (toujours connecté comme client)
2. Actualisez la page
3. Vous voyez maintenant une **carte verte** avec :
   - ✅ "Preuve d'avis disponible"
   - Un bouton "🔗 Voir l'avis sur Google"
4. Cliquez sur le bouton → le lien s'ouvre dans un nouvel onglet

---

## 🎉 C'est terminé !

Le système complet est fonctionnel :
- ✅ Les clients peuvent créer des commandes
- ✅ Les clients peuvent payer via Stripe
- ✅ Leo peut gérer toutes les commandes depuis l'interface admin
- ✅ Leo peut ajouter les liens de preuve
- ✅ Les clients voient les preuves sur leur dashboard

---

## 🐛 Dépannage

### Le backend ne démarre pas
```bash
# Vérifier que PostgreSQL est démarré
# Vérifier le fichier .env

cd backend
npm start
```

### L'interface admin ne fonctionne pas
- ✅ Vérifiez que vous êtes connecté avec le compte admin
- ✅ Vérifiez que le backend est démarré sur le port 3000
- ✅ Ouvrez la console du navigateur (F12) pour voir les erreurs

### Les modifications ne s'affichent pas
- Videz le cache du navigateur (Ctrl+Shift+R ou Cmd+Shift+R)
- Vérifiez que vous êtes sur le bon port (8080)

---

## 📚 Documentation complète

- **Guide Admin complet** : Voir `GUIDE_ADMIN.md`
- **Guide Discord Bot** : Voir `discord-bot/README.md`
- **Architecture** : Voir `ARCHITECTURE.md`
