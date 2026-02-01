const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../middleware/validation');
const { authMiddleware } = require('../middleware/auth');

// Routes publiques
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Routes protégées
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
