require('dotenv').config();

const API_CONFIG = {
  baseURL: process.env.API_URL || 'http://localhost:3000',
  endpoints: {
    // Auth
    login: '/api/auth/login',
    register: '/api/auth/register',
    // Orders
    createOrder: '/api/orders',
    getOrders: '/api/orders',
    // Stats
    getStats: '/api/users/stats',
    // Users
    getProfile: '/api/users/profile',
    // Client Lists
    createClientList: '/api/clientlists',
    getClientLists: '/api/clientlists',
  },
};

module.exports = { API_CONFIG };
