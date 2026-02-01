// Variables globales
let currentPage = 1;
let currentOrderId = null;
let searchTimeout = null;
let userSearchTimeout = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier l'authentification
    if (!TokenManager.exists()) {
        window.location.href = 'app.html';
        return;
    }
    
    // Charger le dashboard par défaut
    showView('dashboard');
    loadDashboardStats();
    
    // Navigation
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const view = this.dataset.view;
            
            // Mettre à jour la navigation active
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Afficher la vue
            showView(view);
            
            if (view === 'orders') {
                loadOrders();
            } else if (view === 'dashboard') {
                loadDashboardStats();
            } else if (view === 'users') {
                loadUsers();
            }
        });
    });
});

// Afficher une vue
function showView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewName + 'View').classList.add('active');
}

// Charger les statistiques du dashboard
async function loadDashboardStats() {
    try {
        const response = await adminApi.getStats();
        
        if (response.success) {
            const stats = response.data;
            document.getElementById('statTotalOrders').textContent = stats.totalOrders;
            document.getElementById('statActiveOrders').textContent = stats.activeOrders;
            document.getElementById('statCompletedOrders').textContent = stats.completedOrders;
            document.getElementById('statTotalRevenue').textContent = `${stats.totalRevenue}€`;
            document.getElementById('statTotalUsers').textContent = stats.totalUsers;
        }
    } catch (error) {
        console.error('Erreur chargement stats:', error);
    }
}

// Charger les commandes
async function loadOrders(page = 1) {
    currentPage = page;
    const container = document.getElementById('ordersContainer');
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    try {
        const params = {
            page,
            limit: 20,
        };
        
        const search = document.getElementById('searchInput').value;
        if (search) params.search = search;
        
        const status = document.getElementById('statusFilter').value;
        if (status) params.status = status;
        
        const response = await adminApi.getAllOrders(params);
        
        if (response.success && response.data.orders.length > 0) {
            container.innerHTML = response.data.orders.map(order => renderOrderItem(order)).join('');
            renderPagination(response.data.pagination);
        } else {
            container.innerHTML = '<div class="loading">Aucune commande payée trouvée</div>';
        }
    } catch (error) {
        console.error('Erreur chargement commandes:', error);
        container.innerHTML = '<div class="loading">Erreur de chargement</div>';
    }
}

// Rendu d'un item de commande
function renderOrderItem(order) {
    const statusLabels = {
        PENDING: 'En attente',
        PAID: 'Payée',
        ACTIVE: 'Active',
        COMPLETED: 'Complétée',
        CANCELLED: 'Annulée'
    };
    
    const paymentStatusLabels = {
        UNPAID: 'Non payé',
        PAID: 'Payé'
    };
    
    const statusClass = order.status.toLowerCase();
    const paymentStatusClass = order.paymentStatus.toLowerCase();
    
    return `
        <div class="order-item">
            <div class="order-header">
                <div class="order-number">${order.orderNumber}</div>
                <div class="order-badges">
                    <span class="badge status-${statusClass}">${statusLabels[order.status]}</span>
                    <span class="badge status-${paymentStatusClass}">${paymentStatusLabels[order.paymentStatus]}</span>
                </div>
            </div>
            
            <div class="order-details">
                <div class="order-detail">
                    <strong>🏢 Entreprise</strong>
                    ${order.companyName} (${order.companyType})
                </div>
                <div class="order-detail">
                    <strong>👤 Client</strong>
                    ${order.user.fullName}<br>
                    <span style="font-size: 12px; color: #718096;">${order.user.email}</span>
                </div>
                <div class="order-detail">
                    <strong>📊 Quantité</strong>
                    ${order.quantity} avis
                </div>
                <div class="order-detail">
                    <strong>💰 Montant</strong>
                    ${order.total}€ TTC
                </div>
                <div class="order-detail">
                    <strong>📅 Créée le</strong>
                    ${new Date(order.createdAt).toLocaleDateString('fr-FR')}
                </div>
            </div>
            
            ${order.reviewProofLink ? `
                <div class="review-link-display">
                    <strong>✅ Lien de preuve ajouté :</strong>
                    <a href="${order.reviewProofLink}" target="_blank">${order.reviewProofLink}</a>
                </div>
            ` : ''}
            
            <div class="order-actions">
                <button class="btn btn-primary" onclick="openEditReviewLinkModal('${order.id}', '${order.orderNumber}', '${order.user.fullName}', '${order.companyName}', '${order.reviewProofLink || ''}')">
                    📝 ${order.reviewProofLink ? 'Modifier le lien' : 'Ajouter le lien'}
                </button>
                
                ${order.status !== 'COMPLETED' && order.paymentStatus === 'PAID' ? `
                    <button class="btn btn-success" onclick="updateStatus('${order.id}', 'COMPLETED')">
                        ✅ Marquer comme complétée
                    </button>
                ` : ''}
                
                <a href="${order.googleMapsLink}" target="_blank" class="btn btn-secondary">
                    🗺️ Voir sur Google Maps
                </a>
            </div>
        </div>
    `;
}

// Pagination
function renderPagination(pagination) {
    const container = document.getElementById('pagination');
    
    if (pagination.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Bouton précédent
    html += `<button ${pagination.page === 1 ? 'disabled' : ''} onclick="loadOrders(${pagination.page - 1})">← Précédent</button>`;
    
    // Pages
    for (let i = 1; i <= pagination.totalPages; i++) {
        if (
            i === 1 ||
            i === pagination.totalPages ||
            (i >= pagination.page - 2 && i <= pagination.page + 2)
        ) {
            html += `<button class="${i === pagination.page ? 'active' : ''}" onclick="loadOrders(${i})">${i}</button>`;
        } else if (i === pagination.page - 3 || i === pagination.page + 3) {
            html += `<button disabled>...</button>`;
        }
    }
    
    // Bouton suivant
    html += `<button ${pagination.page === pagination.totalPages ? 'disabled' : ''} onclick="loadOrders(${pagination.page + 1})">Suivant →</button>`;
    
    container.innerHTML = html;
}

// Recherche avec debounce
function debounceSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        loadOrders(1);
    }, 500);
}

// Ouvrir le modal d'édition
function openEditReviewLinkModal(orderId, orderNumber, clientName, companyName, currentLink) {
    currentOrderId = orderId;
    document.getElementById('modalOrderNumber').textContent = orderNumber;
    document.getElementById('modalClientName').textContent = clientName;
    document.getElementById('modalCompanyName').textContent = companyName;
    document.getElementById('reviewLinkInput').value = currentLink || '';
    document.getElementById('editReviewLinkModal').classList.add('active');
}

// Fermer le modal
function closeModal() {
    document.getElementById('editReviewLinkModal').classList.remove('active');
    currentOrderId = null;
}

// Sauvegarder le lien de l'avis
async function saveReviewLink() {
    const reviewLink = document.getElementById('reviewLinkInput').value.trim();
    
    if (!reviewLink) {
        alert('❌ Veuillez entrer un lien');
        return;
    }
    
    try {
        const response = await adminApi.updateReviewLink(currentOrderId, reviewLink);
        
        if (response.success) {
            alert('✅ Lien d\'avis enregistré avec succès !');
            closeModal();
            loadOrders(currentPage);
        }
    } catch (error) {
        alert(`❌ Erreur : ${error.message}`);
    }
}

// Mettre à jour le statut d'une commande
async function updateStatus(orderId, status) {
    if (!confirm(`Êtes-vous sûr de vouloir marquer cette commande comme ${status === 'COMPLETED' ? 'complétée' : status} ?`)) {
        return;
    }
    
    try {
        const response = await adminApi.updateOrderStatus(orderId, status);
        
        if (response.success) {
            alert('✅ Statut mis à jour !');
            loadOrders(currentPage);
        }
    } catch (error) {
        alert(`❌ Erreur : ${error.message}`);
    }
}

// Déconnexion
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        TokenManager.removeToken();
        window.location.href = 'app.html';
    }
}

// ==================== GESTION DES UTILISATEURS ====================

// Fonction pour afficher la vue utilisateurs (depuis la carte du dashboard)
function showUsersView() {
    // Mettre à jour la navigation
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    document.querySelector('.nav-item[data-view="users"]').classList.add('active');
    
    // Afficher la vue
    showView('users');
    loadUsers();
}

// Fonction pour afficher les commandes avec un filtre de statut
function showOrdersView(status = null) {
    // Mettre à jour la navigation
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    document.querySelector('.nav-item[data-view="orders"]').classList.add('active');
    
    // Afficher la vue
    showView('orders');
    
    // Réinitialiser la recherche
    document.getElementById('searchInput').value = '';
    
    // Appliquer le filtre de statut
    const statusFilter = document.getElementById('statusFilter');
    if (status) {
        statusFilter.value = status;
    } else {
        statusFilter.value = '';
    }
    
    // Charger les commandes avec le filtre
    currentPage = 1;
    loadOrders();
}

// Charger les utilisateurs
async function loadUsers() {
    const container = document.getElementById('usersContainer');
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    try {
        const params = {};
        
        const search = document.getElementById('userSearchInput').value;
        if (search) params.search = search;
        
        const response = await adminApi.getAllUsers(params);
        
        if (response.success && response.data.length > 0) {
            container.innerHTML = response.data.map(user => renderUserItem(user)).join('');
        } else {
            container.innerHTML = '<div class="loading">Aucun utilisateur trouvé</div>';
        }
    } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
        container.innerHTML = '<div class="loading">Erreur de chargement</div>';
    }
}

// Rendu d'un utilisateur
function renderUserItem(user) {
    const statusLabels = {
        ACTIVE: 'Actif',
        SUSPENDED: 'Suspendu',
        DELETED: 'Supprimé'
    };
    
    const statusClass = user.status.toLowerCase();
    
    return `
        <div class="order-item">
            <div class="order-header">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                        👤
                    </div>
                    <div>
                        <div style="font-size: 18px; font-weight: 700; color: #2d3748;">${user.fullName}</div>
                        <div style="font-size: 14px; color: #718096;">${user.email}</div>
                    </div>
                </div>
                <span class="badge status-${statusClass}">${statusLabels[user.status]}</span>
            </div>
            
            <div class="order-details">
                <div class="order-detail">
                    <strong>📦 Commandes</strong>
                    ${user.totalOrders} commande${user.totalOrders > 1 ? 's' : ''}
                </div>
                <div class="order-detail">
                    <strong>💰 Total dépensé</strong>
                    ${user.totalSpent}€
                </div>
                <div class="order-detail">
                    <strong>📅 Inscrit le</strong>
                    ${new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </div>
                <div class="order-detail">
                    <strong>🔐 Dernière connexion</strong>
                    ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}
                </div>
            </div>
        </div>
    `;
}

// Recherche utilisateurs avec debounce
function debounceUserSearch() {
    clearTimeout(userSearchTimeout);
    userSearchTimeout = setTimeout(() => {
        loadUsers();
    }, 500);
}
