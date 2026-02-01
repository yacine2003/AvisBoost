const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { apiClient } = require('../utils/apiClient');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('login')
    .setDescription('Connecter votre compte AvisBoost au bot Discord')
    .addStringOption(option =>
      option.setName('email')
        .setDescription('Votre email AvisBoost')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('password')
        .setDescription('Votre mot de passe')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 }); // Ephemeral

    try {
      const email = interaction.options.getString('email');
      const password = interaction.options.getString('password');

      // Tenter de se connecter
      const token = await apiClient.login(email, password);

      // Stocker le token pour cet utilisateur Discord
      apiClient.cacheUserToken(interaction.user.id, token);

      const embed = new EmbedBuilder()
        .setColor(0x34a853)
        .setTitle('✅ Connexion réussie !')
        .setDescription(`Bienvenue ${interaction.user.username} !`)
        .addFields(
          {
            name: '🔗 Compte connecté',
            value: email,
            inline: false,
          },
          {
            name: '📝 Que faire ensuite ?',
            value: '• `/order` - Créer une commande\n• `/stats` - Voir vos statistiques\n• `/addlist` - Ajouter une liste de clients',
            inline: false,
          }
        )
        .setFooter({
          text: 'AvisBoost • Votre session est active',
        })
        .setTimestamp();

      await interaction.editReply({
        embeds: [embed],
      });

    } catch (error) {
      console.error('Erreur commande /login:', error);
      
      const errorMessage = error.response?.data?.message || 'Identifiants incorrects ou erreur de connexion.';
      
      await interaction.editReply({
        content: `❌ **Connexion échouée**\n\n${errorMessage}\n\n💡 Assurez-vous d'utiliser les mêmes identifiants que sur le site web.`,
      });
    }
  },
};
