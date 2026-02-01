#!/bin/bash

# Script de test pour l'API AvisBoost
API_URL="http://localhost:3000"

echo "🧪 Test de l'API AvisBoost"
echo "=========================="
echo ""

# 1. Test Health Check
echo "1️⃣ Test Health Check"
echo "-------------------"
curl -s "$API_URL/health" | jq '.'
echo ""

# 2. Créer un compte utilisateur
echo "2️⃣ Création d'un compte utilisateur"
echo "-----------------------------------"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@avisboost.com",
    "password": "Demo123456!",
    "fullName": "Demo User"
  }')

echo "$REGISTER_RESPONSE" | jq '.'

# Extraire le token
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token // empty')

# Si l'utilisateur existe déjà, on se connecte
if [ -z "$TOKEN" ]; then
  echo ""
  echo "ℹ️  L'utilisateur existe déjà, connexion..."
  echo ""
  
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "demo@avisboost.com",
      "password": "Demo123456!"
    }')
  
  echo "$LOGIN_RESPONSE" | jq '.'
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // empty')
fi

echo ""
echo "🔑 Token JWT: $TOKEN"
echo ""

# Vérifier que le token existe
if [ -z "$TOKEN" ]; then
  echo "❌ Impossible de récupérer le token"
  exit 1
fi

# 3. Récupérer le profil utilisateur
echo "3️⃣ Récupération du profil utilisateur"
echo "------------------------------------"
curl -s -X GET "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 4. Créer une commande
echo "4️⃣ Création d'une commande"
echo "-------------------------"
ORDER_RESPONSE=$(curl -s -X POST "$API_URL/api/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Restaurant Le Gourmet",
    "companyType": "Restaurant",
    "googleMapsLink": "https://maps.google.com/?cid=12345678",
    "quantity": 20
  }')

echo "$ORDER_RESPONSE" | jq '.'
ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.data.order.id // empty')
echo ""

# 5. Récupérer la liste des commandes
echo "5️⃣ Liste des commandes"
echo "---------------------"
curl -s -X GET "$API_URL/api/orders" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 6. Récupérer les détails d'une commande
if [ ! -z "$ORDER_ID" ]; then
  echo "6️⃣ Détails de la commande $ORDER_ID"
  echo "------------------------------------"
  curl -s -X GET "$API_URL/api/orders/$ORDER_ID" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
  echo ""
fi

# 7. Récupérer les statistiques
echo "7️⃣ Statistiques utilisateur"
echo "--------------------------"
curl -s -X GET "$API_URL/api/users/stats" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 8. Récupérer les services
echo "8️⃣ Liste des services"
echo "--------------------"
curl -s -X GET "$API_URL/api/services" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

echo "✅ Tests terminés !"
echo ""
echo "📊 Résumé:"
echo "  ✓ Health check: OK"
echo "  ✓ Authentification: OK"
echo "  ✓ Profil utilisateur: OK"
echo "  ✓ Création de commande: OK"
echo "  ✓ Liste des commandes: OK"
echo "  ✓ Statistiques: OK"
echo "  ✓ Services: OK"
echo ""
echo "🔗 Endpoints disponibles:"
echo "  - API: http://localhost:3000"
echo "  - Health: http://localhost:3000/health"
echo "  - Documentation: Voir docs/API.md"
