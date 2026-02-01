const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders.controller');
const { authMiddleware } = require('../middleware/auth');
const { validate, createOrderSchema } = require('../middleware/validation');

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

router.post('/', validate(createOrderSchema), ordersController.createOrder);
router.get('/', ordersController.getOrders);
router.get('/:id', ordersController.getOrderById);
router.get('/:id/reviews', ordersController.getOrderReviews);
router.delete('/:id', ordersController.cancelOrder);

module.exports = router;
