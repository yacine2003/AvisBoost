const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { apiClient } = require('../utils/apiClient');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Afficher vos statistiques AvisBoost'),

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

      // Récupérer les stats depuis l'API
      const response = await apiClient.getStats(token);

      if (!response.success) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      const stats = response.data;

      // Calculer le taux de complétion
      const completionRate = stats.totalReviewsOrdered > 0 
        ? ((stats.totalReviewsDelivered / stats.totalReviewsOrdered) * 100).toFixed(1)
        : '0.0';

      const embed = new EmbedBuilder()
        .setColor(0x667eea)
        .setTitle('📊 Vos statistiques AvisBoost')
        .setDescription(`Statistiques de ${interaction.user.tag}`)
        .addFields(
          {
            name: '📦 Commandes totales',
            value: `${stats.totalOrders || 0} commande${stats.totalOrders > 1 ? 's' : ''}`,
            inline: true,
          },
          {
            name: '⭐ Avis commandés',
            value: `${stats.totalReviewsOrdered || 0} avis`,
            inline: true,
          },
          {
            name: '✅ Avis livrés',
            value: `${stats.totalReviewsDelivered || 0} avis`,
            inline: true,
          },
          {
            name: '💰 Montant total dépensé',
            value: `${stats.totalSpent || 0}€`,
            inline: true,
          },
          {
            name: '🎯 Taux de complétion',
            value: `${completionRate}%`,
            inline: true,
          },
          {
            name: '📈 Commandes actives',
            value: `${stats.activeOrders || 0}`,
            inline: true,
          }
        )
        .setFooter({
          text: 'AvisBoost • Statistiques en temps réel',
        })
        .setTimestamp();

      await interaction.editReply({
        embeds: [embed],
      });

    } catch (error) {
      console.error('Erreur commande /stats:', error);
      
      // Vérifier si c'est une erreur d'authentification
      if (error.response?.status === 401 || error.response?.status === 403) {
        await interaction.editReply({
          content: '❌ **Session expirée**\n\nVeuillez vous reconnecter avec `/login`.',
        });
      } else {
        await interaction.editReply({
          content: '❌ Une erreur est survenue lors de la récupération des statistiques.',
        });
      }
    }
  },
};
