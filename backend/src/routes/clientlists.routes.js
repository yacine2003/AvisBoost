const express = require('express');
const router = express.Router();
const clientListsController = require('../controllers/clientlists.controller');
const { authMiddleware } = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

router.post('/', clientListsController.createClientList);
router.get('/', clientListsController.getClientLists);
router.get('/:id', clientListsController.getClientListById);
router.delete('/:id', clientListsController.deleteClientList);

module.exports = router;
