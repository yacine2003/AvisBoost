const { SlashCommandBuilder } = require('discord.js');
const { apiClient } = require('../utils/apiClient');

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
    await interaction.deferReply({ flags: 64 }); // Ephemeral

    try {
      // Vérifier si l'utilisateur est connecté
      const token = apiClient.getUserToken(interaction.user.id);
      
      if (!token) {
        return await interaction.editReply({
          content: '❌ **Vous devez vous connecter d\'abord !**\n\nUtilisez la commande `/login` avec vos identifiants AvisBoost.\n\nExemple:\n```/login email:votre@email.com password:VotreMotDePasse```',
        });
      }

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

      // Appeler l'API backend pour enregistrer la liste
      const response = await apiClient.createClientList(token, listName, clientsArray);

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la création de la liste');
      }

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
      
      // Vérifier si c'est une erreur d'authentification
      if (error.response?.status === 401 || error.response?.status === 403) {
        await interaction.editReply({
          content: '❌ **Session expirée**\n\nVeuillez vous reconnecter avec `/login`.',
        });
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Erreur inconnue';
        await interaction.editReply({
          content: `❌ **Erreur lors de la création de la liste**\n\n${errorMsg}`,
        });
      }
    }
  },
};
