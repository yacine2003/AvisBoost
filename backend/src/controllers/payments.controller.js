const { stripe, isStripeConfigured } = require('../config/stripe');
const prisma = require('../config/database');

// Créer une intention de paiement Stripe
const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    // Vérifier que la commande existe et appartient à l'utilisateur
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande introuvable',
      });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Cette commande est déjà payée',
      });
    }

    // Créer l'intention de paiement Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(order.total) * 100), // Convertir en centimes
      currency: 'eur',
      metadata: {
        orderId: order.id,
        userId: userId,
        orderNumber: order.orderNumber,
      },
      description: `Commande ${order.orderNumber} - ${order.quantity} avis Google`,
    });

    // Enregistrer le paiement en BDD
    await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: order.total,
        currency: 'EUR',
        status: 'PENDING',
      },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Créer une session Stripe Checkout
const createCheckoutSession = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    // Vérifier que Stripe est configuré
    if (!isStripeConfigured) {
      return res.status(503).json({
        success: false,
        message: 'Le système de paiement n\'est pas encore configuré. Veuillez contacter l\'administrateur.',
      });
    }

    // Vérifier que la commande existe et appartient à l'utilisateur
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande introuvable',
      });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Cette commande est déjà payée',
      });
    }

    // Créer une session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${order.quantity} avis Google`,
              description: `Commande ${order.orderNumber} - ${order.companyName}`,
            },
            unit_amount: Math.round(parseFloat(order.total) * 100), // Convertir en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/app.html?payment=success&orderId=${order.id}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/app.html?payment=cancelled`,
      customer_email: order.user.email,
      metadata: {
        orderId: order.id,
        userId: userId,
        orderNumber: order.orderNumber,
      },
    });

    // Enregistrer le paiement en BDD
    await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: userId,
        stripePaymentIntentId: session.payment_intent || session.id,
        amount: order.total,
        currency: 'EUR',
        status: 'PENDING',
      },
    });

    res.json({
      success: true,
      data: {
        url: session.url,
        sessionId: session.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Webhook Stripe (appelé par Stripe lors d'événements)
const stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Erreur de vérification webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer les différents types d'événements
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Erreur lors du traitement du webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Gérer la complétion d'une session Checkout Stripe
const handleCheckoutSessionCompleted = async (session) => {
  const { orderId, userId, orderNumber } = session.metadata;

  console.log(`💳 Checkout session complétée pour la commande ${orderNumber}`);

  // Mettre à jour le paiement
  try {
    await prisma.payment.updateMany({
      where: {
        orderId: orderId,
        status: 'PENDING',
      },
      data: {
        status: 'SUCCEEDED',
        stripePaymentIntentId: session.payment_intent || session.id,
        paymentMethod: session.payment_method_types?.[0] || 'card',
      },
    });
  } catch (error) {
    console.error('⚠️  Erreur lors de la mise à jour du paiement:', error);
  }

  // Mettre à jour la commande
  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'PAID',
      status: 'PAID',
      paymentId: session.payment_intent || session.id,
      paidAt: new Date(),
    },
  });

  // Créer le service actif
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  // Vérifier si le service n'existe pas déjà
  const existingService = await prisma.service.findFirst({
    where: { orderId: orderId },
  });

  if (!existingService) {
    await prisma.service.create({
      data: {
        userId: userId,
        orderId: orderId,
        serviceType: 'google_reviews',
        status: 'ACTIVE',
        totalCapacity: order.quantity,
        usedCapacity: 0,
      },
    });
  }

  console.log(`✅ Paiement réussi pour la commande ${order.orderNumber}`);

  // TODO: Envoyer email de confirmation
  // TODO: Notification Discord si configuré
};

// Gérer le succès du paiement
const handlePaymentSuccess = async (paymentIntent) => {
  const { orderId, userId } = paymentIntent.metadata || {};

  // Si pas de métadonnées, ignorer (déjà traité par checkout.session.completed)
  if (!orderId || !userId) {
    console.log('ℹ️  PaymentIntent sans métadonnées - Probablement déjà traité par checkout.session.completed');
    return;
  }

  // Vérifier si la commande est déjà payée
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    console.error(`❌ Commande ${orderId} introuvable`);
    return;
  }

  if (order.paymentStatus === 'PAID') {
    console.log(`ℹ️  Commande ${order.orderNumber} déjà payée - Webhook ignoré`);
    return;
  }

  // Mettre à jour le paiement si il existe
  const existingPayment = await prisma.payment.findFirst({
    where: {
      orderId: orderId,
      status: 'PENDING',
    },
  });

  if (existingPayment) {
    await prisma.payment.update({
      where: {
        id: existingPayment.id,
      },
      data: {
        status: 'SUCCEEDED',
        paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
        stripeCustomerId: paymentIntent.customer,
        stripePaymentIntentId: paymentIntent.id,
      },
    });
  }

  // Mettre à jour la commande
  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'PAID',
      status: 'PAID',
      paymentId: paymentIntent.id,
      paidAt: new Date(),
    },
  });

  // Créer le service actif si il n'existe pas déjà
  const existingService = await prisma.service.findFirst({
    where: { orderId: orderId },
  });

  if (!existingService) {
    await prisma.service.create({
      data: {
        userId: userId,
        orderId: orderId,
        serviceType: 'google_reviews',
        status: 'ACTIVE',
        totalCapacity: order.quantity,
        usedCapacity: 0,
        startedAt: new Date(),
      },
    });
  }

  console.log(`✅ Paiement réussi pour la commande ${order.orderNumber}`);

  // TODO: Envoyer email de confirmation
  // TODO: Notification Discord si configuré
};

// Gérer l'échec du paiement
const handlePaymentFailure = async (paymentIntent) => {
  await prisma.payment.update({
    where: {
      stripePaymentIntentId: paymentIntent.id,
    },
    data: {
      status: 'FAILED',
    },
  });

  console.log(`❌ Paiement échoué: ${paymentIntent.id}`);
};

// Récupérer l'historique des paiements
const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const payments = await prisma.payment.findMany({
      where: { userId },
      include: {
        order: {
          select: {
            orderNumber: true,
            companyName: true,
            quantity: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentIntent,
  createCheckoutSession,
  stripeWebhook,
  getPaymentHistory,
};
