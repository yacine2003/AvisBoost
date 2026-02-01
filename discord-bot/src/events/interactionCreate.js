const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Gérer les commandes slash
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`❌ Commande ${interaction.commandName} introuvable`);
        return;
      }

      try {
        await command.execute(interaction);
        console.log(`✅ Commande /${interaction.commandName} exécutée par ${interaction.user.tag}`);
      } catch (error) {
        // Ignorer les erreurs d'interaction déjà répondue ou expirée (normal en mode global)
        if (error.code === 10062 || error.code === 40060) {
          console.log(`⚠️  /${interaction.commandName} - Interaction expirée (ignoré - normal en mode global)`);
          return;
        }
        
        // Autres erreurs : afficher le détail
        console.error(`❌ Erreur lors de l'exécution de /${interaction.commandName}:`, error);
        
        const errorMessage = {
          content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
          flags: 64, // Ephemeral flag
        };

        try {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
          } else {
            await interaction.reply(errorMessage);
          }
        } catch (replyError) {
          // Interaction déjà expirée, on ignore
          console.log('⚠️  Impossible de répondre à l\'interaction');
        }
      }
    }

    // Gérer les boutons (pour futures fonctionnalités)
    if (interaction.isButton()) {
      console.log(`🔘 Bouton cliqué: ${interaction.customId} par ${interaction.user.tag}`);
    }

    // Gérer les menus déroulants (pour futures fonctionnalités)
    if (interaction.isStringSelectMenu()) {
      console.log(`📜 Menu: ${interaction.customId} par ${interaction.user.tag}`);
    }
  },
};
