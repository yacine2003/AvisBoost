const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;

// Générer un QR code et le sauvegarder
const generateQRCode = async (url) => {
  try {
    // Créer le dossier qrcodes s'il n'existe pas
    const qrcodesDir = path.join(__dirname, '../../uploads/qrcodes');
    await fs.mkdir(qrcodesDir, { recursive: true });

    // Nom de fichier unique
    const filename = `qrcode_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
    const filepath = path.join(qrcodesDir, filename);

    // Options du QR code
    const options = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 500,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    };

    // Générer le QR code
    await QRCode.toFile(filepath, url, options);

    // Retourner l'URL relative
    return `/uploads/qrcodes/${filename}`;
  } catch (error) {
    console.error('❌ Erreur lors de la génération du QR code:', error);
    throw new Error('Impossible de générer le QR code');
  }
};

// Générer un QR code en base64 (pour envoi direct)
const generateQRCodeBase64 = async (url) => {
  try {
    const options = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 500,
    };

    const qrCodeDataURL = await QRCode.toDataURL(url, options);
    return qrCodeDataURL;
  } catch (error) {
    console.error('❌ Erreur lors de la génération du QR code:', error);
    throw new Error('Impossible de générer le QR code');
  }
};

module.exports = {
  generateQRCode,
  generateQRCodeBase64,
};
