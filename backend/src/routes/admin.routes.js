const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification ET le rôle admin
router.use(authMiddleware);
router.use(requireAdmin);

// Statistiques
router.get('/stats', adminController.getAdminStats);

// Gestion des commandes
router.get('/orders', adminController.getAllOrders);
router.patch('/orders/:orderId/review-link', adminController.updateReviewProofLink);
router.patch('/orders/:orderId/status', adminController.updateOrderStatus);

// Gestion des utilisateurs
router.get('/users', adminController.getAllUsers);

module.exports = router;
