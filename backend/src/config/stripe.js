const Stripe = require('stripe');

let stripe = null;
let isStripeConfigured = false;

if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    isStripeConfigured = true;
    console.log('✅ Stripe configuré');
  } catch (error) {
    console.warn('⚠️  Erreur de configuration Stripe:', error.message);
  }
} else {
  console.warn('⚠️  STRIPE_SECRET_KEY non défini - Mode démo (paiements désactivés)');
}

// Prix des packs (en centimes)
const PRICING = {
  starter: {
    quantity: 10,
    price: parseInt(process.env.PRICE_STARTER || 89) * 100, // 8900 centimes
    name: 'Starter',
  },
  pro: {
    quantity: 20,
    price: parseInt(process.env.PRICE_PRO || 159) * 100, // 15900 centimes
    name: 'Pro',
  },
  business: {
    quantity: 50,
    price: parseInt(process.env.PRICE_BUSINESS || 329) * 100, // 32900 centimes
    name: 'Business',
  },
};

module.exports = {
  stripe,
  isStripeConfigured,
  PRICING,
};
