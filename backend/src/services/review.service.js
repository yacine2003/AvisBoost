const prisma = require('../config/database');

// Simuler l'ajout progressif d'avis (pour démo/test)
const simulateReviewDelivery = async (orderId) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { reviews: true },
    });

    if (!order) {
      throw new Error('Commande introuvable');
    }

    const reviewsToAdd = order.quantity - order.reviews.length;
    if (reviewsToAdd <= 0) {
      console.log('Tous les avis ont déjà été livrés');
      return;
    }

    // Noms de reviewers fictifs
    const reviewers = [
      'Marie Dubois', 'Pierre Martin', 'Sophie Laurent', 'Thomas Bernard',
      'Julie Petit', 'Alexandre Robert', 'Camille Durand', 'Lucas Moreau',
      'Emma Simon', 'Nicolas Michel', 'Léa Leroy', 'Antoine Fournier',
      'Chloé Girard', 'Maxime Bonnet', 'Sarah Mercier', 'Hugo Blanc',
      'Laura Rousseau', 'Julien Faure', 'Manon Garnier', 'Vincent Perrin',
    ];

    // Commentaires fictifs
    const comments = [
      'Excellent service, très professionnel !',
      'Je recommande vivement, équipe au top.',
      'Très satisfait de ma visite, merci !',
      'Service impeccable, je reviendrai.',
      'Super expérience, personnel accueillant.',
      'Qualité au rendez-vous, bravo !',
      'Parfait, rien à redire !',
      'Très bonne prestation, merci beaucoup.',
      'Je suis ravi, excellent travail.',
      'Service rapide et efficace.',
      'Équipe sympathique et compétente.',
      'Très professionnel, je recommande.',
      'Expérience exceptionnelle, à refaire !',
      'Service de qualité, très content.',
      'Rien à dire, tout était parfait.',
    ];

    // Ajouter un avis aléatoire
    const randomReviewer = reviewers[Math.floor(Math.random() * reviewers.length)];
    const randomComment = comments[Math.floor(Math.random() * comments.length)];

    const review = await prisma.review.create({
      data: {
        orderId: order.id,
        reviewerName: randomReviewer,
        rating: 5,
        comment: randomComment,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    console.log(`✅ Nouvel avis ajouté: ${randomReviewer}`);

    // Vérifier si la commande est complète
    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { reviews: true },
    });

    if (updatedOrder.reviews.length >= updatedOrder.quantity) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      await prisma.service.updateMany({
        where: { orderId: orderId },
        data: { status: 'COMPLETED' },
      });

      console.log(`🎉 Commande ${order.orderNumber} terminée !`);
    }

    return review;
  } catch (error) {
    console.error('❌ Erreur lors de la simulation:', error);
    throw error;
  }
};

// Démarrer la livraison progressive d'avis pour une commande
const startReviewDelivery = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error('Commande introuvable');
  }

  // Intervalle aléatoire entre 2 et 5 heures
  const interval = Math.floor(Math.random() * (5 - 2 + 1) + 2) * 60 * 60 * 1000;

  console.log(`🚀 Démarrage de la livraison d'avis pour ${order.orderNumber}`);

  // Simuler l'ajout progressif
  const deliveryInterval = setInterval(async () => {
    try {
      const currentOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { reviews: true },
      });

      if (currentOrder.reviews.length >= currentOrder.quantity) {
        clearInterval(deliveryInterval);
        console.log(`✅ Livraison terminée pour ${order.orderNumber}`);
        return;
      }

      await simulateReviewDelivery(orderId);
    } catch (error) {
      console.error('❌ Erreur lors de la livraison:', error);
      clearInterval(deliveryInterval);
    }
  }, interval);

  return deliveryInterval;
};

module.exports = {
  simulateReviewDelivery,
  startReviewDelivery,
};
