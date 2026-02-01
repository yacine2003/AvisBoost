const prisma = require('../config/database');

// Calculer les prix
const calculatePrice = (quantity) => {
  const prices = {
    10: { price: 89, tax: 17.8 },
    20: { price: 159, tax: 31.8 },
    30: { price: 219, tax: 43.8 },
    40: { price: 279, tax: 55.8 },
    50: { price: 329, tax: 65.8 },
  };

  const priceData = prices[quantity];
  if (!priceData) {
    throw new Error('Quantité invalide');
  }

  return {
    price: priceData.price,
    tax: priceData.tax,
    total: priceData.price + priceData.tax,
  };
};

// Générer un numéro de commande unique
const generateOrderNumber = () => {
  return 'CMD' + Math.floor(10000 + Math.random() * 90000);
};

// Créer une commande
const createOrder = async (req, res, next) => {
  try {
    const { companyName, companyType, googleMapsLink, quantity } = req.body;
    const userId = req.user.id;

    // Calculer les prix
    const pricing = calculatePrice(quantity);

    // Générer un numéro de commande unique
    let orderNumber;
    let isUnique = false;
    
    while (!isUnique) {
      orderNumber = generateOrderNumber();
      const existing = await prisma.order.findUnique({
        where: { orderNumber },
      });
      if (!existing) isUnique = true;
    }

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        userId,
        orderNumber,
        companyName,
        companyType,
        googleMapsLink,
        quantity,
        price: pricing.price,
        tax: pricing.tax,
        total: pricing.total,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer toutes les commandes de l'utilisateur
const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        reviews: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            reviewerName: true,
            rating: true,
            comment: true,
            publishedAt: true,
          },
        },
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer une commande spécifique
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        reviews: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        payments: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande introuvable',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer les avis d'une commande
const getOrderReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que la commande appartient à l'utilisateur
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande introuvable',
      });
    }

    const reviews = await prisma.review.findMany({
      where: { orderId: id },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Annuler une commande (si non payée)
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: {
        id,
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
        message: 'Impossible d\'annuler une commande déjà payée',
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });

    res.json({
      success: true,
      message: 'Commande annulée avec succès',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getOrderReviews,
  cancelOrder,
};
