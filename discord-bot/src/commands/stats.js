const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Afficher vos statistiques AvisBoost'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // TODO: Récupérer les vraies stats depuis l'API
      // Pour l'instant, afficher des stats simulées

      const embed = new EmbedBuilder()
        .setColor(0x667eea)
        .setTitle('📊 Vos statistiques AvisBoost')
        .setDescription(`Statistiques de ${interaction.user.tag}`)
        .addFields(
          {
            name: '📦 Commandes totales',
            value: '3 commandes',
            inline: true,
          },
          {
            name: '⭐ Avis commandés',
            value: '80 avis',
            inline: true,
          },
          {
            name: '✅ Avis livrés',
            value: '65 avis',
            inline: true,
          },
          {
            name: '💰 Montant total dépensé',
            value: '467€',
            inline: true,
          },
          {
            name: '🎯 Taux de complétion',
            value: '81.25%',
            inline: true,
          },
          {
            name: '📈 Note moyenne',
            value: '5.0 ⭐',
            inline: true,
          }
        )
        .setFooter({
          text: 'AvisBoost • Statistiques',
        })
        .setTimestamp();

      await interaction.editReply({
        embeds: [embed],
      });

    } catch (error) {
      console.error('Erreur commande /stats:', error);
      await interaction.editReply({
        content: '❌ Une erreur est survenue lors de la récupération des statistiques.',
      });
    }
  },
};
