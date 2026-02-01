const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authMiddleware } = require('../middleware/auth');
const { validate, updateProfileSchema, changePasswordSchema } = require('../middleware/validation');

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

router.get('/profile', usersController.getProfile);
router.put('/profile', validate(updateProfileSchema), usersController.updateProfile);
router.put('/password', validate(changePasswordSchema), usersController.changePassword);
router.get('/stats', usersController.getUserStats);

module.exports = router;
