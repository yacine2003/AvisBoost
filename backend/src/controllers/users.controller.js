const bcrypt = require('bcrypt');
const prisma = require('../config/database');

// Récupérer le profil
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour le profil
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, email } = req.body;
    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email.toLowerCase();

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Changer le mot de passe
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Récupérer l'utilisateur avec le mot de passe
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect',
      });
    }

    // Hasher le nouveau mot de passe
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès',
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir les statistiques utilisateur
const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Statistiques des commandes (exclure les commandes annulées)
    const orders = await prisma.order.findMany({
      where: { 
        userId,
        status: { not: 'CANCELLED' }  // Exclure les commandes annulées
      },
      include: {
        reviews: {
          where: { status: 'PUBLISHED' },
        },
      },
    });

    const stats = {
      totalOrders: orders.length,
      totalReviewsOrdered: orders.reduce((sum, order) => sum + order.quantity, 0),
      totalReviewsDelivered: orders.reduce((sum, order) => sum + order.reviews.length, 0),
      totalSpent: orders
        .filter(order => order.paymentStatus === 'PAID')
        .reduce((sum, order) => sum + parseFloat(order.total), 0),
      activeOrders: orders.filter(order => ['PAID', 'ACTIVE'].includes(order.status)).length,
      completedOrders: orders.filter(order => order.status === 'COMPLETED').length,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getUserStats,
};
