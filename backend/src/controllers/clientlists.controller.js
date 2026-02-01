const prisma = require('../config/database');

// Créer une liste de clients
const createClientList = async (req, res, next) => {
  try {
    const { listName, clients } = req.body;
    const userId = req.user.id;

    // Valider les données
    if (!listName || !clients || !Array.isArray(clients) || clients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nom de liste et clients requis',
      });
    }

    // Créer la liste
    const clientList = await prisma.clientList.create({
      data: {
        userId,
        listName,
        clients,
        source: 'discord',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Liste de clients créée avec succès',
      data: clientList,
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer toutes les listes de l'utilisateur
const getClientLists = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const lists = await prisma.clientList.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: lists,
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer une liste spécifique
const getClientListById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const list = await prisma.clientList.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'Liste introuvable',
      });
    }

    res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

// Supprimer une liste
const deleteClientList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const list = await prisma.clientList.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'Liste introuvable',
      });
    }

    await prisma.clientList.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Liste supprimée avec succès',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClientList,
  getClientLists,
  getClientListById,
  deleteClientList,
};
