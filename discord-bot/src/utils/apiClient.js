const axios = require('axios');
const { API_CONFIG } = require('../config/api');

/**
 * Client pour communiquer avec l'API AvisBoost
 * Gère l'authentification et les requêtes
 */
class APIClient {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.token = null;
    this.userCache = new Map(); // Cache Discord ID -> User Token
  }

  /**
   * Connecter un utilisateur Discord avec ses identifiants AvisBoost
   */
  async login(email, password) {
    try {
      const response = await axios.post(
        `${this.baseURL}${API_CONFIG.endpoints.login}`,
        { email, password }
      );

      if (response.data.success && response.data.data.token) {
        return response.data.data.token;
      }

      throw new Error('Échec de connexion');
    } catch (error) {
      console.error('Erreur login API:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Créer une commande
   */
  async createOrder(token, orderData) {
    try {
      const response = await axios.post(
        `${this.baseURL}${API_CONFIG.endpoints.createOrder}`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erreur création commande:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques d'un utilisateur
   */
  async getStats(token) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_CONFIG.endpoints.getStats}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erreur récupération stats:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Récupérer les commandes d'un utilisateur
   */
  async getOrders(token) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_CONFIG.endpoints.getOrders}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erreur récupération commandes:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Stocker le token d'un utilisateur Discord
   */
  cacheUserToken(discordId, token) {
    this.userCache.set(discordId, token);
  }

  /**
   * Récupérer le token d'un utilisateur Discord
   */
  getUserToken(discordId) {
    return this.userCache.get(discordId);
  }

  /**
   * Vérifier si un utilisateur Discord est connecté
   */
  isUserConnected(discordId) {
    return this.userCache.has(discordId);
  }

  /**
   * Créer une liste de clients
   */
  async createClientList(token, listName, clients) {
    try {
      const response = await axios.post(
        `${this.baseURL}${API_CONFIG.endpoints.createClientList}`,
        { listName, clients },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erreur création liste:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Instance singleton
const apiClient = new APIClient();

module.exports = { apiClient };
