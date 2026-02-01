const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { generateQRCode } = require('../services/qrcode.service');

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// Récupérer les services disponibles (packs)
router.get('/', async (req, res, next) => {
  try {
    const services = [
      {
        id: 'starter',
        name: 'Starter',
        quantity: 10,
        price: 89,
        pricePerReview: 8.9,
        features: [
          '10 avis Google 5⭐',
          'Livraison en 48-72h',
          'Support client par email',
          'Dashboard de suivi',
        ],
      },
      {
        id: 'pro',
        name: 'Pro',
        quantity: 20,
        price: 159,
        pricePerReview: 7.95,
        discount: 11,
        popular: true,
        features: [
          '20 avis Google 5⭐',
          'Livraison en 48-72h',
          'Support prioritaire 7j/7',
          'Dashboard de suivi avancé',
          'Conseils personnalisés',
        ],
      },
      {
        id: 'business',
        name: 'Business',
        quantity: 50,
        price: 329,
        pricePerReview: 6.58,
        discount: 26,
        features: [
          '50 avis Google 5⭐',
          'Livraison en 5-7 jours',
          'Support VIP dédié',
          'Dashboard premium',
          'Audit SEO local gratuit',
        ],
      },
    ];

    res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    next(error);
  }
});

// Récupérer les services actifs de l'utilisateur
router.get('/active', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const services = await prisma.service.findMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            companyName: true,
            googleMapsLink: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    next(error);
  }
});

// Générer un QR code pour un service
router.post('/:id/qrcode', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const service = await prisma.service.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        order: true,
      },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service introuvable',
      });
    }

    // Générer le QR code
    const qrCodeUrl = await generateQRCode(service.order.googleMapsLink);

    // Mettre à jour le service avec l'URL du QR code
    const updatedService = await prisma.service.update({
      where: { id },
      data: { qrCodeUrl },
    });

    res.json({
      success: true,
      message: 'QR code généré avec succès',
      data: {
        qrCodeUrl,
        service: updatedService,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Récupérer les statistiques d'un service
router.get('/:id/stats', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const service = await prisma.service.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        order: {
          include: {
            reviews: true,
          },
        },
      },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service introuvable',
      });
    }

    const stats = {
      totalCapacity: service.totalCapacity,
      usedCapacity: service.order.reviews.length,
      remainingCapacity: service.totalCapacity - service.order.reviews.length,
      completionRate: ((service.order.reviews.length / service.totalCapacity) * 100).toFixed(2),
      publishedReviews: service.order.reviews.filter(r => r.status === 'PUBLISHED').length,
      pendingReviews: service.order.reviews.filter(r => r.status === 'PENDING').length,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
