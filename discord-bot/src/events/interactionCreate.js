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
        console.error(`❌ Erreur lors de l'exécution de /${interaction.commandName}:`, error);
        
        const errorMessage = {
          content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
          ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
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
