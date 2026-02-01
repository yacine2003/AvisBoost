require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');

// Vérifier les variables d'environnement
if (!process.env.DISCORD_BOT_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN manquant dans .env');
  process.exit(1);
}

if (!process.env.DISCORD_CLIENT_ID) {
  console.error('❌ DISCORD_CLIENT_ID manquant dans .env');
  process.exit(1);
}

// Créer le client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Collection pour stocker les commandes
client.commands = new Collection();

// Charger les commandes
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commands = [];

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
    console.log(`✅ Commande chargée: ${command.data.name}`);
  } else {
    console.log(`⚠️  La commande ${filePath} est incomplète`);
  }
}

// Charger les événements
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  
  console.log(`✅ Événement chargé: ${event.name}`);
}

// Enregistrer les commandes slash
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log(`🔄 Enregistrement de ${commands.length} commandes slash...`);

    // Enregistrer globalement ou pour un serveur spécifique
    if (process.env.DISCORD_GUILD_ID) {
      // Pour un serveur spécifique (développement - instantané)
      await rest.put(
        Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
        { body: commands }
      );
      console.log('✅ Commandes enregistrées pour le serveur spécifique');
    } else {
      // Globalement (production - peut prendre jusqu'à 1h)
      await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
        { body: commands }
      );
      console.log('✅ Commandes enregistrées globalement');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement des commandes:', error);
  }
})();

// Connexion du bot
client.login(process.env.DISCORD_BOT_TOKEN);

// Gestion des erreurs
client.on('error', error => {
  console.error('❌ Erreur du client Discord:', error);
});

process.on('unhandledRejection', error => {
  console.error('❌ Promesse rejetée non gérée:', error);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM reçu, fermeture du bot...');
  client.destroy();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT reçu, fermeture du bot...');
  client.destroy();
  process.exit(0);
});

module.exports = client;
