const nodemailer = require('nodemailer');

// Vérifier si la configuration email est disponible
const isEmailConfigured = () => {
  return process.env.SMTP_HOST && 
         process.env.SMTP_USER && 
         process.env.SMTP_PASSWORD;
};

// Créer le transporteur email seulement si configuré
let transporter = null;

if (isEmailConfigured()) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Vérifier la configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Erreur de configuration email:', error);
    } else {
      console.log('✅ Serveur email prêt');
    }
  });
} else {
  console.log('ℹ️  Configuration email non définie - Les emails ne seront pas envoyés');
}

// Envoyer un email de réinitialisation de mot de passe
const sendPasswordResetEmail = async (email, fullName, resetToken) => {
  if (!transporter) {
    console.log('⚠️  Email non configuré - Email de réinitialisation non envoyé');
    return;
  }

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Réinitialisation de votre mot de passe - AvisBoost',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⭐ AvisBoost</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${fullName},</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            <p>Ce lien est valable pendant 1 heure.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
            <p>Cordialement,<br>L'équipe AvisBoost</p>
          </div>
          <div class="footer">
            <p>© 2026 AvisBoost. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de réinitialisation envoyé à ${email}`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

// Envoyer un email de confirmation de commande
const sendOrderConfirmationEmail = async (email, fullName, order) => {
  if (!transporter) {
    console.log('⚠️  Email non configuré - Email de confirmation non envoyé');
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Commande ${order.orderNumber} confirmée - AvisBoost`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; font-size: 18px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Commande confirmée !</h1>
          </div>
          <div class="content">
            <h2>Merci ${fullName} !</h2>
            <p>Votre paiement a été reçu avec succès et votre commande est en cours de traitement.</p>
            
            <div class="order-details">
              <h3>Détails de la commande</h3>
              <div class="detail-row">
                <span>Numéro de commande :</span>
                <strong>${order.orderNumber}</strong>
              </div>
              <div class="detail-row">
                <span>Entreprise :</span>
                <strong>${order.companyName}</strong>
              </div>
              <div class="detail-row">
                <span>Nombre d'avis :</span>
                <strong>${order.quantity} avis Google 5⭐</strong>
              </div>
              <div class="detail-row total">
                <span>Total payé :</span>
                <strong>${order.total}€</strong>
              </div>
            </div>

            <p>Vous pouvez suivre la progression de votre commande en temps réel depuis votre dashboard.</p>
            <p>Les premiers avis commenceront à apparaître dans les 48-72 heures.</p>
            
            <p>Cordialement,<br>L'équipe AvisBoost</p>
          </div>
          <div class="footer">
            <p>© 2026 AvisBoost. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de confirmation envoyé à ${email}`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
};
