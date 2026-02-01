const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addlist')
    .setDescription('Ajouter une liste de clients pour votre service')
    .addStringOption(option =>
      option.setName('nom')
        .setDescription('Nom de la liste de clients')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('clients')
        .setDescription('Clients (format: Nom|email|phone, séparés par des virgules)')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const listName = interaction.options.getString('nom');
      const clientsInput = interaction.options.getString('clients');

      // Parser les clients
      const clientsArray = clientsInput.split(',').map(client => {
        const parts = client.trim().split('|');
        return {
          name: parts[0]?.trim() || '',
          email: parts[1]?.trim() || '',
          phone: parts[2]?.trim() || '',
        };
      });

      // Valider les données
      if (clientsArray.length === 0) {
        return await interaction.editReply({
          content: '❌ Aucun client valide trouvé. Format attendu: `Nom|email|phone, Nom2|email2|phone2`',
        });
      }

      // TODO: Appeler l'API backend pour enregistrer la liste
      // Pour l'instant, simuler la réponse
      
      const embed = {
        color: 0x667eea,
        title: '✅ Liste de clients créée',
        description: `La liste **${listName}** a été créée avec succès !`,
        fields: [
          {
            name: '📋 Nom de la liste',
            value: listName,
            inline: true,
          },
          {
            name: '👥 Nombre de clients',
            value: `${clientsArray.length} clients`,
            inline: true,
          },
          {
            name: '📝 Clients ajoutés',
            value: clientsArray.slice(0, 5).map(c => `• ${c.name}`).join('\n') +
                   (clientsArray.length > 5 ? `\n_... et ${clientsArray.length - 5} autres_` : ''),
          },
        ],
        footer: {
          text: 'AvisBoost • Liste enregistrée',
        },
        timestamp: new Date(),
      };

      await interaction.editReply({
        embeds: [embed],
      });

      // Log dans un canal si configuré
      const logChannel = interaction.guild.channels.cache.find(
        ch => ch.name === 'avisboost-logs'
      );

      if (logChannel) {
        await logChannel.send({
          embeds: [{
            color: 0x34a853,
            title: '📊 Nouvelle liste créée',
            fields: [
              {
                name: 'Utilisateur',
                value: `${interaction.user.tag} (${interaction.user.id})`,
                inline: true,
              },
              {
                name: 'Liste',
                value: listName,
                inline: true,
              },
              {
                name: 'Clients',
                value: `${clientsArray.length} clients`,
                inline: true,
              },
            ],
            timestamp: new Date(),
          }],
        });
      }

    } catch (error) {
      console.error('Erreur commande /addlist:', error);
      await interaction.editReply({
        content: '❌ Une erreur est survenue lors de la création de la liste.',
      });
    }
  },
};
