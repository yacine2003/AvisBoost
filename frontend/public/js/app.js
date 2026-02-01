// ==================== GESTION DES PAGES ====================

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
}

function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

function showOrderPage() {
    showPage('orderPage');
}

function showDashboard() {
    showPage('dashboardPage');
    loadDashboard();
}

// ==================== GESTION DES ERREURS ====================

function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    errorEl.textContent = message;
    errorEl.classList.add('show');
    setTimeout(() => errorEl.classList.remove('show'), 5000);
}

function hideError(elementId) {
    const errorEl = document.getElementById(elementId);
    errorEl.classList.remove('show');
}

// ==================== AUTHENTIFICATION ====================

async function handleLogin(event) {
    event.preventDefault();
    hideError('loginError');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    
    try {
        loginBtn.disabled = true;
        loginBtn.innerHTML = 'Connexion...<span class="loading"></span>';
        
        const response = await api.login(email, password);
        
        if (response.success) {
            showDashboard();
        }
    } catch (error) {
        showError('loginError', error.message || 'Erreur de connexion');
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Se connecter';
    }
}

async function handleSignup(event) {
    event.preventDefault();
    hideError('signupError');
    
    const fullName = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const signupBtn = document.getElementById('signupBtn');
    
    try {
        signupBtn.disabled = true;
        signupBtn.innerHTML = 'Création du compte...<span class="loading"></span>';
        
        const response = await api.register(email, password, fullName);
        
        if (response.success) {
            showDashboard();
        }
    } catch (error) {
        showError('signupError', error.message || 'Erreur lors de la création du compte');
    } finally {
        signupBtn.disabled = false;
        signupBtn.textContent = 'Créer mon compte';
    }
}

function handleLogout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        TokenManager.remove();
        showPage('authPage');
        showLogin();
    }
}

// ==================== COMMANDES ====================

function updatePrice() {
    const quantity = document.getElementById('quantity').value;
    const priceDisplay = document.getElementById('priceDisplay');
    const displayPrice = document.getElementById('displayPrice');
    
    const prices = {
        '10': 89,
        '20': 159,
        '50': 329
    };
    
    if (quantity && prices[quantity]) {
        const price = prices[quantity];
        const tax = price * 0.2;
        const total = price + tax;
        
        displayPrice.textContent = total.toFixed(2);
        priceDisplay.style.display = 'block';
    } else {
        priceDisplay.style.display = 'none';
    }
}

async function handleCreateOrder(event) {
    event.preventDefault();
    hideError('orderError');
    
    const companyName = document.getElementById('companyName').value;
    const companyType = document.getElementById('companyType').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const googleMapsLink = document.getElementById('googleMapsLink').value;
    const orderBtn = document.getElementById('orderBtn');
    
    try {
        orderBtn.disabled = true;
        orderBtn.innerHTML = 'Création en cours...<span class="loading"></span>';
        
        const response = await api.createOrder({
            companyName,
            companyType,
            googleMapsLink,
            quantity
        });
        
        if (response.success) {
            const order = response.data;
            
            // Demander à l'utilisateur s'il veut payer maintenant
            const payNow = confirm(
                `✅ Commande créée avec succès !\n\n` +
                `📋 Numéro : ${order.orderNumber}\n` +
                `💰 Montant : ${order.total}€ TTC\n` +
                `🏢 Entreprise : ${companyName}\n` +
                `📊 ${quantity} avis\n\n` +
                `Voulez-vous procéder au paiement maintenant ?`
            );
            
            // Réinitialiser le formulaire
            event.target.reset();
            document.getElementById('priceDisplay').style.display = 'none';
            
            if (payNow) {
                // Rediriger vers le paiement Stripe
                await handlePayment(order.id);
            } else {
                // Aller au dashboard
                showDashboard();
            }
        }
    } catch (error) {
        showError('orderError', error.message || 'Erreur lors de la création de la commande');
    } finally {
        orderBtn.disabled = false;
        orderBtn.textContent = 'Créer la commande';
    }
}

// ==================== DASHBOARD ====================

async function loadDashboard() {
    try {
        // Charger le profil utilisateur
        const profileResponse = await api.getMe();
        if (profileResponse.success) {
            document.getElementById('userName').textContent = profileResponse.data.fullName.split(' ')[0];
        }
        
        // Charger les statistiques
        const statsResponse = await api.getStats();
        if (statsResponse.success) {
            const stats = statsResponse.data;
            document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
            document.getElementById('totalReviews').textContent = stats.totalReviewsOrdered || 0;
            document.getElementById('deliveredReviews').textContent = stats.totalReviewsDelivered || 0;
            document.getElementById('totalSpent').textContent = (stats.totalSpent || 0) + '€';
        }
        
        // Charger les commandes
        await loadOrders();
        
    } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
        // Si erreur d'auth, retour à la page de connexion
        if (error.message.includes('Token') || error.message.includes('authentification')) {
            TokenManager.remove();
            showPage('authPage');
        }
    }
}

async function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    
    try {
        const response = await api.getOrders();
        
        if (response.success && response.data.length > 0) {
            // Filtrer les commandes annulées
            const activeOrders = response.data.filter(order => order.status !== 'CANCELLED');
            
            if (activeOrders.length > 0) {
                ordersList.innerHTML = activeOrders.map(order => `
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                            <div>
                                <h4 style="font-size: 18px; margin-bottom: 6px;">${order.companyName}</h4>
                                <div style="font-size: 14px; color: #5f6368;">
                                    📋 ${order.companyType} • ${order.quantity} avis
                                </div>
                                <div style="font-size: 13px; color: #5f6368; margin-top: 4px;">
                                    Commande #${order.orderNumber}
                                </div>
                            </div>
                            <div class="status-badge ${order.status.toLowerCase()}">
                                ${getStatusText(order.status)}
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #dadce0;">
                            <div style="font-size: 14px; color: #5f6368;">
                                ${new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </div>
                            <div style="font-size: 18px; font-weight: 700; color: #4285F4;">
                                ${order.total}€
                            </div>
                        </div>
                        ${order.paymentStatus === 'UNPAID' && order.status !== 'CANCELLED' ? `
                            <div style="display: flex; gap: 12px; margin-top: 16px;">
                                <button class="btn" style="flex: 1;" onclick="payOrder('${order.id}')">
                                    💳 Payer maintenant
                                </button>
                                <button class="btn" style="flex: 0.4; background: #dc3545;" onclick="deleteOrder('${order.id}')">
                                    🗑️ Supprimer
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `).join('');
            } else {
                ordersList.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; color: #5f6368;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                        <p style="font-size: 16px; margin-bottom: 8px;">Aucune commande pour le moment</p>
                        <p style="font-size: 14px;">Créez votre première commande pour commencer !</p>
                        <button class="btn" style="max-width: 300px; margin: 24px auto 0;" onclick="showOrderPage()">
                            Créer une commande
                        </button>
                    </div>
                `;
            }
        } else {
            ordersList.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #5f6368;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                    <p style="font-size: 16px; margin-bottom: 8px;">Aucune commande pour le moment</p>
                    <p style="font-size: 14px;">Créez votre première commande pour commencer !</p>
                    <button class="btn" style="max-width: 300px; margin: 24px auto 0;" onclick="showOrderPage()">
                        Créer une commande
                    </button>
                </div>
            `;
        }
    } catch (error) {
        ordersList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #c33;">
                ❌ Erreur lors du chargement des commandes
            </div>
        `;
    }
}

function getStatusText(status) {
    const statusMap = {
        'PENDING': 'En attente',
        'PAID': 'Payé',
        'ACTIVE': 'En cours',
        'COMPLETED': 'Terminé',
        'CANCELLED': 'Annulé'
    };
    return statusMap[status] || status;
}

// ==================== PAIEMENT ====================

async function handlePayment(orderId) {
    try {
        // Appeler l'API backend pour créer une session de paiement Stripe
        const response = await api.request(`/api/payments/create-checkout-session`, {
            method: 'POST',
            body: JSON.stringify({ orderId })
        });
        
        if (response.success && response.data.url) {
            // Rediriger vers la page de paiement Stripe
            window.location.href = response.data.url;
        } else {
            throw new Error('Impossible de créer la session de paiement');
        }
    } catch (error) {
        alert(`❌ Erreur lors du paiement : ${error.message}\n\nVous pouvez réessayer depuis le dashboard.`);
        showDashboard();
    }
}

// Fonction appelée depuis les boutons "Payer maintenant" dans le dashboard
window.payOrder = async function(orderId) {
    if (confirm('Voulez-vous procéder au paiement de cette commande ?')) {
        await handlePayment(orderId);
    }
}

// Fonction pour supprimer/annuler une commande
window.deleteOrder = async function(orderId) {
    if (confirm('⚠️ Êtes-vous sûr de vouloir supprimer cette commande ?\n\nCette action est irréversible.')) {
        try {
            const response = await api.deleteOrder(orderId);
            
            if (response.success) {
                alert('✅ Commande supprimée avec succès !');
                // Recharger le dashboard
                await loadDashboard();
            }
        } catch (error) {
            alert(`❌ Erreur lors de la suppression : ${error.message}`);
        }
    }
}

// ==================== INITIALISATION ====================

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est déjà connecté
    if (TokenManager.exists()) {
        showDashboard();
    } else {
        showPage('authPage');
        showLogin();
    }
});
