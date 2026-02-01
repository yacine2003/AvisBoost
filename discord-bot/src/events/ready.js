const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log('');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║                                            ║');
    console.log('║     ⭐  AVISBOOST DISCORD BOT  ⭐        ║');
    console.log('║                                            ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('');
    console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
    console.log(`🌍 Présent sur ${client.guilds.cache.size} serveur(s)`);
    console.log(`👥 ${client.users.cache.size} utilisateurs accessibles`);
    console.log('');
    console.log('📋 Commandes enregistrées:');
    client.commands.forEach(command => {
      console.log(`   - /${command.data.name} - ${command.data.description}`);
    });
    console.log('');
    console.log('🟢 Bot prêt à recevoir des commandes !');
    console.log('');

    // Définir le statut du bot
    client.user.setPresence({
      activities: [{
        name: '⭐ Boostez vos avis Google !',
        type: 0, // PLAYING
      }],
      status: 'online',
    });
  },
};
