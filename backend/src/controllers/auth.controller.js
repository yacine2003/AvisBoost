const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { sendPasswordResetEmail } = require('../services/email.service');
const crypto = require('crypto');

// Inscription
const register = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé',
      });
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        fullName,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    // Générer un token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Connexion
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    // Vérifier le statut
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Ce compte est suspendu ou supprimé',
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    // Mettre à jour la dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Générer un token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer les infos de l'utilisateur connecté
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Mot de passe oublié
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Ne pas révéler si l'utilisateur existe ou non
    if (!user) {
      return res.json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      });
    }

    // Générer un token unique
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Créer l'entrée de réinitialisation (expire dans 1h)
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + 3600000), // 1 heure
      },
    });

    // Envoyer l'email
    await sendPasswordResetEmail(user.email, user.fullName, resetToken);

    res.json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
    });
  } catch (error) {
    next(error);
  }
};

// Réinitialiser le mot de passe
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Trouver le token
    const resetRequest = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRequest || resetRequest.used || resetRequest.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré',
      });
    }

    // Hasher le nouveau mot de passe
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: resetRequest.userId },
      data: { passwordHash },
    });

    // Marquer le token comme utilisé
    await prisma.passwordReset.update({
      where: { token },
      data: { used: true },
    });

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
};
