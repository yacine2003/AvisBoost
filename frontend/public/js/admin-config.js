// Configuration API pour l'admin
const API_BASE_URL = 'http://localhost:3000/api';

const TokenManager = {
    getToken() {
        return localStorage.getItem('avisboost_token');
    },
    
    setToken(token) {
        localStorage.setItem('avisboost_token', token);
    },
    
    removeToken() {
        localStorage.removeItem('avisboost_token');
    },
    
    exists() {
        return !!this.getToken();
    }
};

// API Client pour l'admin
const adminApi = {
    async request(endpoint, options = {}) {
        const token = TokenManager.getToken();
        
        if (!token) {
            window.location.href = 'app.html';
            throw new Error('Non authentifié');
        }
        
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            },
        };
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                TokenManager.removeToken();
                window.location.href = 'app.html';
            }
            throw new Error(data.message || 'Erreur API');
        }
        
        return data;
    },
    
    // Statistiques
    async getStats() {
        return await this.request('/admin/stats');
    },
    
    // Commandes
    async getAllOrders(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/admin/orders?${queryString}`);
    },
    
    async updateReviewLink(orderId, reviewProofLink) {
        return await this.request(`/admin/orders/${orderId}/review-link`, {
            method: 'PATCH',
            body: JSON.stringify({ reviewProofLink }),
        });
    },
    
    async updateOrderStatus(orderId, status) {
        return await this.request(`/admin/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    },
    
    // Utilisateurs
    async getAllUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/admin/users?${queryString}`);
    },
};
