const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Afficher l\'aide des commandes AvisBoost'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x667eea)
      .setTitle('⭐ Aide AvisBoost')
      .setDescription('Voici toutes les commandes disponibles pour gérer vos avis Google :')
      .addFields(
        {
          name: '📝 /order',
          value: 'Créer une nouvelle commande d\'avis Google\n`/order entreprise:<nom> type:<type> quantite:<nb> lien:<url>`',
          inline: false,
        },
        {
          name: '📋 /addlist',
          value: 'Ajouter une liste de clients\n`/addlist nom:<nom> clients:<liste>`\nFormat: `Nom|email|phone, Nom2|email2|phone2`',
          inline: false,
        },
        {
          name: '📊 /stats',
          value: 'Afficher vos statistiques\n`/stats`',
          inline: false,
        },
        {
          name: '❓ /help',
          value: 'Afficher cette aide\n`/help`',
          inline: false,
        },
        {
          name: '\u200B',
          value: '**📦 Packs disponibles**\n• **Starter** - 10 avis → 89€\n• **Pro** - 20 avis → 159€ (⭐ Populaire)\n• **Business** - 50 avis → 329€',
          inline: false,
        },
        {
          name: '\u200B',
          value: '**🔗 Liens utiles**\n[Dashboard](https://avisboost.com/dashboard) • [Support](https://avisboost.com/support) • [Documentation](https://avisboost.com/docs)',
          inline: false,
        }
      )
      .setFooter({
        text: 'AvisBoost • Besoin d\'aide ? contact@avisboost.com',
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
