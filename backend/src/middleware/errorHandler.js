const errorHandler = (err, req, res, next) => {
  console.error('❌ Erreur:', err);

  // Erreur Prisma
  if (err.code && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Cette ressource existe déjà',
        field: err.meta?.target?.[0] || 'unknown',
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Ressource introuvable',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Erreur de base de données',
    });
  }

  // Erreur de validation Joi
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  // Erreur par défaut
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Gestionnaire pour les routes non trouvées
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} introuvable`,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
