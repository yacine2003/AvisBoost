const prisma = require('../config/database');

// Récupérer toutes les commandes (admin)
const getAllOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;

    // Construire les filtres
    const where = {
      // Par défaut, exclure les commandes non payées et annulées
      paymentStatus: 'PAID',
      status: {
        notIn: ['CANCELLED'],
      },
    };

    // Si des filtres sont explicitement fournis, les utiliser
    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Récupérer les commandes
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour le lien de preuve d'avis
const updateReviewProofLink = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reviewProofLink } = req.body;

    // Vérifier que la commande existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande introuvable',
      });
    }

    // Mettre à jour le lien
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        reviewProofLink,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Lien d\'avis mis à jour avec succès',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour le statut d'une commande
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Vérifier que le statut est valide
    const validStatuses = ['PENDING', 'PAID', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide',
      });
    }

    // Mettre à jour
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        updatedAt: new Date(),
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// Statistiques admin
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalOrders,
      activeOrders,
      completedOrders,
      totalRevenue,
      totalUsers,
    ] = await Promise.all([
      // Compter uniquement les commandes payées (exclure annulées et non payées)
      prisma.order.count({
        where: {
          paymentStatus: 'PAID',
          status: { not: 'CANCELLED' },
        },
      }),
      // Commandes en cours = toutes les commandes payées SAUF les complétées
      prisma.order.count({
        where: {
          paymentStatus: 'PAID',
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
        },
      }),
      // Commandes complétées
      prisma.order.count({
        where: {
          paymentStatus: 'PAID',
          status: 'COMPLETED',
        },
      }),
      // Revenu total (uniquement commandes payées)
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }),
      // Tous les utilisateurs (clients)
      prisma.user.count({ where: { role: 'USER' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        activeOrders,
        completedOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer tous les utilisateurs
const getAllUsers = async (req, res, next) => {
  try {
    const { search } = req.query;

    const where = {
      role: 'USER', // Seulement les clients, pas les admins
    };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        lastLogin: true,
        status: true,
        _count: {
          select: {
            orders: {
              where: {
                paymentStatus: 'PAID',
                status: { not: 'CANCELLED' },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculer le montant total dépensé par chaque utilisateur
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalSpent = await prisma.order.aggregate({
          where: {
            userId: user.id,
            paymentStatus: 'PAID',
            status: { not: 'CANCELLED' },
          },
          _sum: { total: true },
        });

        return {
          ...user,
          totalOrders: user._count.orders,
          totalSpent: totalSpent._sum.total || 0,
        };
      })
    );

    res.json({
      success: true,
      data: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  updateReviewProofLink,
  updateOrderStatus,
  getAdminStats,
  getAllUsers,
};
