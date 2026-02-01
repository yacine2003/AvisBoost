const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

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
    await interaction.deferReply({ ephemeral: true });

    try {
      const companyName = interaction.options.getString('entreprise');
      const companyType = interaction.options.getString('type');
      const quantity = interaction.options.getInteger('quantite');
      const googleMapsLink = interaction.options.getString('lien');

      // Calculer le prix
      const prices = {
        10: { price: 89, tax: 17.8 },
        20: { price: 159, tax: 31.8 },
        30: { price: 219, tax: 43.8 },
        40: { price: 279, tax: 55.8 },
        50: { price: 329, tax: 65.8 },
      };

      const pricing = prices[quantity];
      const total = pricing.price + pricing.tax;

      // TODO: Appeler l'API backend pour créer la commande
      // Pour l'instant, créer une commande simulée

      const orderNumber = 'CMD' + Math.floor(10000 + Math.random() * 90000);

      const embed = new EmbedBuilder()
        .setColor(0x667eea)
        .setTitle('🎉 Commande créée avec succès !')
        .setDescription(`Votre commande **${orderNumber}** a été créée.`)
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
            value: `${total.toFixed(2)}€ TTC`,
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
            value: orderNumber,
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
      await interaction.editReply({
        content: '❌ Une erreur est survenue lors de la création de la commande.',
      });
    }
  },
};
