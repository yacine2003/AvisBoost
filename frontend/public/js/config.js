// Configuration de l'API
const API_CONFIG = {
    baseURL: 'http://localhost:3000',
    endpoints: {
        // Auth
        register: '/api/auth/register',
        login: '/api/auth/login',
        me: '/api/auth/me',
        
        // Orders
        createOrder: '/api/orders',
        getOrders: '/api/orders',
        getOrder: '/api/orders/',
        
        // Services
        getServices: '/api/services',
        
        // Users
        getStats: '/api/users/stats',
        getProfile: '/api/users/profile'
    }
};

// Gestion du token
const TokenManager = {
    get: () => localStorage.getItem('avisboost_token'),
    set: (token) => localStorage.setItem('avisboost_token', token),
    remove: () => localStorage.removeItem('avisboost_token'),
    exists: () => !!localStorage.getItem('avisboost_token')
};

// Client API
class APIClient {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = TokenManager.get();
        
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            }
        };

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Une erreur est survenue');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    async register(email, password, fullName) {
        const response = await this.request(API_CONFIG.endpoints.register, {
            method: 'POST',
            body: JSON.stringify({ email, password, fullName })
        });
        
        if (response.data && response.data.token) {
            TokenManager.set(response.data.token);
        }
        
        return response;
    }

    async login(email, password) {
        const response = await this.request(API_CONFIG.endpoints.login, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (response.data && response.data.token) {
            TokenManager.set(response.data.token);
        }
        
        return response;
    }

    async getMe() {
        return await this.request(API_CONFIG.endpoints.me);
    }

    // Orders
    async createOrder(orderData) {
        return await this.request(API_CONFIG.endpoints.createOrder, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getOrders() {
        return await this.request(API_CONFIG.endpoints.getOrders);
    }

    async getOrder(id) {
        return await this.request(API_CONFIG.endpoints.getOrder + id);
    }

    async deleteOrder(id) {
        return await this.request(API_CONFIG.endpoints.getOrder + id, {
            method: 'DELETE'
        });
    }

    // Services
    async getServices() {
        return await this.request(API_CONFIG.endpoints.getServices);
    }

    // Stats
    async getStats() {
        return await this.request(API_CONFIG.endpoints.getStats);
    }
}

// Instance globale
window.api = new APIClient();
window.TokenManager = TokenManager;
