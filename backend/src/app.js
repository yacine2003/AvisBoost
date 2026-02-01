require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import des routes
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const ordersRoutes = require('./routes/orders.routes');
const paymentsRoutes = require('./routes/payments.routes');
const servicesRoutes = require('./routes/services.routes');
const clientListsRoutes = require('./routes/clientlists.routes');
const adminRoutes = require('./routes/admin.routes');

// Import des middlewares
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import de la configuration
require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARES ====================

// Sécurité
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
});

app.use('/api/', limiter);

// Body parser (IMPORTANT: après le webhook Stripe qui utilise raw body)
app.use('/api/payments/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (QR codes, etc.)
app.use('/uploads', express.static('uploads'));

// ==================== ROUTES ====================

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API AvisBoost fonctionnelle',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/clientlists', clientListsRoutes);
app.use('/api/admin', adminRoutes);

// ==================== ERROR HANDLERS ====================

// Route non trouvée
app.use(notFoundHandler);

// Gestionnaire d'erreurs global
app.use(errorHandler);

// ==================== DÉMARRAGE SERVEUR ====================

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║                                            ║');
  console.log('║       ⭐  AVISBOOST API SERVER  ⭐        ║');
  console.log('║                                            ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('📋 Routes disponibles:');
  console.log('   - POST   /api/auth/register');
  console.log('   - POST   /api/auth/login');
  console.log('   - POST   /api/auth/forgot-password');
  console.log('   - POST   /api/auth/reset-password');
  console.log('   - GET    /api/auth/me');
  console.log('   - GET    /api/users/profile');
  console.log('   - PUT    /api/users/profile');
  console.log('   - PUT    /api/users/password');
  console.log('   - GET    /api/users/stats');
  console.log('   - POST   /api/orders');
  console.log('   - GET    /api/orders');
  console.log('   - GET    /api/orders/:id');
  console.log('   - GET    /api/orders/:id/reviews');
  console.log('   - POST   /api/payments/create-intent');
  console.log('   - POST   /api/payments/webhooks/stripe');
  console.log('   - GET    /api/payments/history');
  console.log('   - GET    /api/services');
  console.log('   - GET    /api/services/active');
  console.log('   - POST   /api/services/:id/qrcode');
  console.log('');
  console.log('✅ Prêt à recevoir des requêtes !');
  console.log('');
});

// Gestion de l'arrêt propre
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu, fermeture du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT reçu, fermeture du serveur...');
  process.exit(0);
});

module.exports = app;
