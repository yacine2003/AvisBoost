const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');
const { authMiddleware } = require('../middleware/auth');

// Webhook Stripe (doit être AVANT express.json() dans app.js)
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), paymentsController.stripeWebhook);

// Routes protégées
router.use(authMiddleware);

router.post('/create-intent', paymentsController.createPaymentIntent);
router.post('/create-checkout-session', paymentsController.createCheckoutSession);
router.get('/history', paymentsController.getPaymentHistory);

module.exports = router;
