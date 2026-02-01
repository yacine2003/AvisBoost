# 🤖 AvisBoost Discord Bot

Bot Discord pour interagir avec la plateforme AvisBoost directement depuis Discord.

## 📦 Installation

### Prérequis
- Node.js 18+
- Compte Discord Developer avec un bot créé

### Configuration du bot Discord

1. Aller sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créer une nouvelle application
3. Aller dans "Bot" et créer un bot
4. Copier le token du bot
5. Activer les intents nécessaires:
   - `GUILDS`
   - `GUILD_MESSAGES`
   - `MESSAGE_CONTENT`

### Installation

```bash
cd discord-bot
npm install
```

### Configuration

1. Copier `.env.example` en `.env`:
```bash
cp .env.example .env
```

2. Configurer les variables:
```env
DISCORD_BOT_TOKEN=votre_token_bot
DISCORD_CLIENT_ID=votre_client_id
DISCORD_GUILD_ID=votre_server_id_optionnel
```

## 🚀 Démarrage

### Développement
```bash
npm run dev
```

### Production
```bash
npm start
```

## 🎯 Commandes disponibles

### `/order`
Créer une nouvelle commande d'avis Google
```
/order entreprise:MonEntreprise type:Restaurant quantite:20 lien:https://maps.google.com/...
```

### `/addlist`
Ajouter une liste de clients
```
/addlist nom:MesClients clients:Jean Dupont|jean@email.com|0612345678, Marie Martin|marie@email.com|0687654321
```

### `/stats`
Afficher vos statistiques AvisBoost
```
/stats
```

### `/help`
Afficher l'aide des commandes
```
/help
```

## 🔧 Inviter le bot sur votre serveur

URL d'invitation (remplacer CLIENT_ID):
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=2147485696&scope=bot%20applications.commands
```

Permissions requises:
- Envoyer des messages
- Intégrer des liens
- Ajouter des réactions
- Utiliser les commandes slash

## 📁 Structure

```
discord-bot/
├── src/
│   ├── commands/          # Commandes slash
│   │   ├── addlist.js    # Ajouter liste clients
│   │   ├── order.js      # Créer commande
│   │   ├── stats.js      # Statistiques
│   │   └── help.js       # Aide
│   ├── events/           # Événements Discord
│   │   ├── ready.js      # Bot prêt
│   │   └── interactionCreate.js
│   └── bot.js           # Point d'entrée
├── .env.example
└── package.json
```

## 🎨 Personnalisation

### Ajouter une nouvelle commande

1. Créer un fichier dans `src/commands/`
2. Structure de base:
```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('commande')
    .setDescription('Description'),
  
  async execute(interaction) {
    await interaction.reply('Réponse');
  },
};
```

3. Le bot chargera automatiquement la commande au démarrage

## 🔗 Intégration avec l'API

Pour connecter le bot à l'API backend, modifier les commandes pour appeler les endpoints API:

```javascript
const axios = require('axios');

const response = await axios.post(`${process.env.API_URL}/api/orders`, {
  // données
}, {
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});
```

## 📝 License

MIT
