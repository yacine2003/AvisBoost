const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { apiClient } = require('../utils/apiClient');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('order')
    .setDescription('Créer une nouvelle commande d\'avis Google')
    .addStringOption(option =>
      option.setName('entreprise')
        .setDescription('Nom de votre entreprise')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type d\'entreprise')
        .setRequired(true)
        .addChoices(
          { name: 'Restaurant', value: 'Restaurant' },
          { name: 'Maçon', value: 'Maçon' },
          { name: 'Coiffeur', value: 'Coiffeur' },
          { name: 'Plombier', value: 'Plombier' },
          { name: 'Électricien', value: 'Électricien' },
          { name: 'Garage', value: 'Garage' },
          { name: 'Boulangerie', value: 'Boulangerie' },
          { name: 'Autre', value: 'Autre' }
        ))
    .addIntegerOption(option =>
      option.setName('quantite')
        .setDescription('Nombre d\'avis souhaités')
        .setRequired(true)
        .addChoices(
          { name: '10 avis - 89€', value: 10 },
          { name: '20 avis - 159€', value: 20 },
          { name: '30 avis - 219€', value: 30 },
          { name: '40 avis - 279€', value: 40 },
          { name: '50 avis - 329€', value: 50 }
        ))
    .addStringOption(option =>
      option.setName('lien')
        .setDescription('Lien Google Maps de votre établissement')
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

      const companyName = interaction.options.getString('entreprise');
      const companyType = interaction.options.getString('type');
      const quantity = interaction.options.getInteger('quantite');
      const googleMapsLink = interaction.options.getString('lien');

      // Créer la commande via l'API
      const orderData = {
        companyName,
        companyType,
        quantity,
        googleMapsLink,
      };

      const response = await apiClient.createOrder(token, orderData);

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la création de la commande');
      }

      const order = response.data;

      const embed = new EmbedBuilder()
        .setColor(0x667eea)
        .setTitle('🎉 Commande créée avec succès !')
        .setDescription(`Votre commande **${order.orderNumber}** a été créée.`)
        .addFields(
          {
            name: '🏢 Entreprise',
            value: `${companyName} (${companyType})`,
            inline: false,
          },
          {
            name: '📊 Quantité',
            value: `${quantity} avis Google 5⭐`,
            inline: true,
          },
          {
            name: '💰 Prix',
            value: `${order.total}€ TTC`,
            inline: true,
          },
          {
            name: '📍 Lien Google Maps',
            value: `[Voir l'établissement](${googleMapsLink})`,
            inline: false,
          },
          {
            name: '📝 Prochaines étapes',
            value: '1️⃣ Effectuez le paiement via le dashboard web\n2️⃣ Les avis seront livrés en 48-72h\n3️⃣ Suivez la progression en temps réel',
            inline: false,
          }
        )
        .setFooter({
          text: 'AvisBoost • Pour payer, rendez-vous sur le dashboard',
        })
        .setTimestamp();

      await interaction.editReply({
        embeds: [embed],
      });

      // Message de suivi dans le canal
      const followUpEmbed = new EmbedBuilder()
        .setColor(0x4285f4)
        .setTitle('📦 Nouvelle commande Discord')
        .addFields(
          {
            name: 'Utilisateur',
            value: interaction.user.tag,
            inline: true,
          },
          {
            name: 'Commande',
            value: order.orderNumber,
            inline: true,
          },
          {
            name: 'Entreprise',
            value: companyName,
            inline: true,
          }
        )
        .setTimestamp();

      // Envoyer dans un canal de logs si disponible
      const logChannel = interaction.guild.channels.cache.find(
        ch => ch.name === 'avisboost-logs'
      );

      if (logChannel) {
        await logChannel.send({ embeds: [followUpEmbed] });
      }

    } catch (error) {
      console.error('Erreur commande /order:', error);
      
      // Vérifier si c'est une erreur d'authentification
      if (error.response?.status === 401 || error.response?.status === 403) {
        await interaction.editReply({
          content: '❌ **Session expirée**\n\nVeuillez vous reconnecter avec `/login`.',
        });
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Erreur inconnue';
        await interaction.editReply({
          content: `❌ **Erreur lors de la création de la commande**\n\n${errorMsg}`,
        });
      }
    }
  },
};
