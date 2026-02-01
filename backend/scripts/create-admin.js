const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Vérifier si un admin existe déjà
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (adminExists) {
      console.log('✅ Un administrateur existe déjà:', adminExists.email);
      await prisma.$disconnect();
      return;
    }

    // Créer le compte admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@avisboost.com',
        passwordHash: hashedPassword,
        fullName: 'Administrateur',
        role: 'ADMIN',
        emailVerified: true,
        status: 'ACTIVE',
      },
    });

    console.log('✅ Compte administrateur créé avec succès !');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Mot de passe: admin123');
    console.log('\n⚠️  IMPORTANT: Changez ce mot de passe après votre première connexion !');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
