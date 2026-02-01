const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Test de connexion
prisma.$connect()
  .then(() => {
    console.log('✅ Base de données connectée avec succès');
  })
  .catch((error) => {
    console.error('❌ Erreur de connexion à la base de données:', error);
    process.exit(1);
  });

// Gestion de la fermeture propre
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
