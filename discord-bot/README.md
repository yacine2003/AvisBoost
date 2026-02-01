# 🤖 AvisBoost Discord Bot

Bot Discord pour gérer vos commandes et avis Google directement depuis Discord.

## 🚀 Fonctionnalités

- **🔐 Authentification** : Connexion avec votre compte AvisBoost
- **📝 Création de commandes** : Commander des avis Google en quelques clics
- **📊 Statistiques** : Voir vos stats en temps réel
- **📋 Gestion de listes** : Ajouter des listes de clients
- **⚡ Notifications** : Recevoir des alertes sur vos commandes

## 📋 Prérequis

- Node.js 18+ et npm
- Un compte Discord Developer
- Backend AvisBoost en cours d'exécution

## ⚙️ Installation

### 1. Créer une application Discord

1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez une nouvelle application
3. Dans "Bot", cliquez sur "Add Bot"
4. Activez les "Privileged Gateway Intents" :
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent
5. Copiez le token du bot

### 2. Inviter le bot sur votre serveur

Générez un lien d'invitation avec ces permissions :
- `applications.commands` (pour les slash commands)
- `bot` avec les permissions suivantes :
  - Send Messages
  - Embed Links
  - Read Message History

URL d'invitation :
```
https://discord.com/api/oauth2/authorize?client_id=VOTRE_CLIENT_ID&permissions=274877991936&scope=bot%20applications.commands
```

### 3. Configuration

1. Copiez `.env.example` en `.env` :
```bash
cp .env.example .env
```

2. Remplissez les variables :
```env
# ==================== DISCORD ====================
DISCORD_BOT_TOKEN=votre_token_discord_bot
DISCORD_CLIENT_ID=votre_client_id
DISCORD_GUILD_ID=votre_server_id_optional

# ==================== API ====================
API_URL=http://localhost:3000

# ==================== BOT CONFIG ====================
BOT_PREFIX=/
NODE_ENV=development
```

### 4. Installation des dépendances

```bash
npm install
```

### 5. Démarrer le bot

```bash
npm start
```

Le bot enregistrera automatiquement les commandes slash sur votre serveur Discord.

## 🎮 Commandes disponibles

### `/login`
Connectez votre compte AvisBoost au bot Discord.

**Exemple :**
```
/login email:votre@email.com password:votremotdepasse
```

### `/order`
Créez une nouvelle commande d'avis Google.

**Paramètres :**
- `entreprise` : Nom de votre entreprise
- `type` : Type d'entreprise (Restaurant, Coiffeur, etc.)
- `quantite` : Nombre d'avis (10, 20, 30, 40, 50)
- `lien` : Lien Google Maps de votre établissement

**Exemple :**
```
/order entreprise:"Ma Super Pizzeria" type:Restaurant quantite:20 lien:https://maps.google.com/...
```

### `/stats`
Affichez vos statistiques AvisBoost.

**Exemple :**
```
/stats
```

### `/addlist`
Ajoutez une liste de clients.

**Format :**
```
Nom|email|phone, Nom2|email2|phone2
```

**Exemple :**
```
/addlist nom:"Clients VIP" clients:"Jean Dupont|jean@email.com|0612345678, Marie Martin|marie@email.com|0623456789"
```

### `/help`
Affiche l'aide et la liste des commandes.

## 🔧 Développement

### Structure du projet

```
discord-bot/
├── src/
│   ├── bot.js              # Point d'entrée du bot
│   ├── config/
│   │   └── api.js          # Configuration de l'API
│   ├── commands/
│   │   ├── login.js        # Commande /login
│   │   ├── order.js        # Commande /order
│   │   ├── stats.js        # Commande /stats
│   │   ├── addlist.js      # Commande /addlist
│   │   └── help.js         # Commande /help
│   ├── events/
│   │   ├── ready.js        # Event : Bot prêt
│   │   └── interactionCreate.js  # Event : Slash commands
│   └── utils/
│       └── apiClient.js    # Client pour l'API backend
├── .env.example
├── package.json
└── README.md
```

### Ajouter une nouvelle commande

1. Créez un nouveau fichier dans `src/commands/` :

```javascript
const { SlashCommandBuilder } = require('discord.js');
const { apiClient } = require('../utils/apiClient');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('macommande')
    .setDescription('Description de ma commande'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
      const token = apiClient.getUserToken(interaction.user.id);
      
      if (!token) {
        return await interaction.editReply({
          content: '❌ Vous devez vous connecter d\'abord avec `/login`',
        });
      }

      // Votre logique ici
      
      await interaction.editReply({
        content: '✅ Succès !',
      });
    } catch (error) {
      console.error('Erreur:', error);
      await interaction.editReply({
        content: '❌ Une erreur est survenue.',
      });
    }
  },
};
```

2. Le bot chargera automatiquement la commande au démarrage

## 📝 Scripts disponibles

- `npm start` : Démarre le bot
- `npm run dev` : Démarre en mode développement avec nodemon
- `npm test` : Lance les tests (à configurer)

## 🐛 Dépannage

### Le bot ne répond pas aux commandes

1. Vérifiez que le bot est en ligne sur Discord
2. Vérifiez les logs dans la console
3. Assurez-vous que les permissions sont correctes
4. Réinvitez le bot avec le bon lien d'invitation

### Erreur "Session expirée"

Reconnectez-vous avec la commande `/login`.

### Erreur "API non accessible"

1. Vérifiez que le backend est démarré (`npm start` dans `/backend`)
2. Vérifiez l'URL de l'API dans `.env` (`API_URL`)
3. Vérifiez que CORS est activé sur le backend

## 📦 Déploiement en production

### Option 1 : VPS (Linux)

```bash
# Installation PM2
npm install -g pm2

# Démarrer le bot
pm2 start src/bot.js --name avisboost-discord

# Sauvegarder la configuration
pm2 save

# Auto-démarrage au reboot
pm2 startup
```

### Option 2 : Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["node", "src/bot.js"]
```

```bash
docker build -t avisboost-discord .
docker run -d --name avisboost-discord --env-file .env avisboost-discord
```

## 🔒 Sécurité

- ⚠️ Ne partagez **JAMAIS** votre token Discord
- ⚠️ Ne commitez **JAMAIS** le fichier `.env`
- 🔐 Les mots de passe sont envoyés de manière éphémère (messages visibles uniquement par l'utilisateur)
- 🔐 Les tokens utilisateur sont stockés en mémoire et supprimés au redémarrage du bot

## 📄 Licence

Voir le fichier LICENSE à la racine du projet.

## 🆘 Support

Pour toute question ou problème :
- 📧 Email : contact@avisboost.com
- 💬 Discord : Rejoignez notre serveur support
- 📚 Documentation : https://docs.avisboost.com
