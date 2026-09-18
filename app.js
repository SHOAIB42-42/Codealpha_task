const API_URL = 'http://localhost:3000/api';

class App {
    constructor() {
        this.products = [];
        this.cart = JSON.parse(localStorage.getItem('alphaCart')) || [];
        this.user = JSON.parse(localStorage.getItem('alphaUser')) || null;
        this.token = localStorage.getItem('alphaToken') || null;
        
        this.init();
    }

    async init() {
        this.updateAuthNav();
        this.updateCartCount();
        await this.fetchProducts();
        
        // Setup simple router
        window.onhashchange = () => this.handleRoute();
        if(!window.location.hash) window.location.hash = '#home';
        else this.handleRoute();
    }

    handleRoute() {
        const hash = window.location.hash.substring(1);
        this.navigate(hash);
    }

    navigate(view) {
        window.location.hash = view;
        const container = document.getElementById('app-container');
        
        if (view === 'home') this.renderHome(container);
        else if (view === 'cart') this.renderCart(container);
        else if (view === 'login') this.renderLogin(container);
        else if (view === 'register') this.renderRegister(container);
        else if (view === 'orders') this.renderOrders(container);
        else this.renderHome(container);
    }

    async fetchProducts() {
        try {
            const res = await fetch(`${API_URL}/products`);
            if(res.ok) this.products = await res.json();
        } catch (err) {
            this.showToast('Failed to load products', 'error');
        }
    }

    renderHome(container) {
        let html = `
            <div class="view-header">
                <h2>Featured Products</h2>
            </div>
            <div class="products-grid">
        `;

        this.products.forEach(p => {
            html += `
                <div class="product-card">
                    <img src="${p.imageUrl}" alt="${p.title}" class="product-img">
                    <div class="product-info">
                        <h3 class="product-title">${p.title}</h3>
                        <p class="product-desc">${p.description}</p>
                        <div class="product-footer">
                            <span class="product-price">$${p.price.toFixed(2)}</span>
                            <button class="btn" onclick="app.addToCart(${p.id})">
                                <i class="fa-solid fa-plus"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;
    }

    renderCart(container) {
        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="cart-container">
                    <div class="empty-cart">
                        <i class="fa-solid fa-cart-shopping"></i>
                        <h2>Your cart is empty</h2>
                        <p>Browse our products and add some items to your cart.</p>
                        <br>
                        <button class="btn" onclick="app.navigate('home')">Start Shopping</button>
                    </div>
                </div>
            `;
            return;
        }

        let total = 0;
        let html = `
            <div class="view-header">
                <h2>Your Shopping Cart</h2>
            </div>
            <div class="cart-container">
        `;

        this.cart.forEach(item => {
            const product = this.products.find(p => p.id === item.id);
            if (!product) return;
            const itemTotal = product.price * item.quantity;
            total += itemTotal;

            html += `
                <div class="cart-item">
                    <img src="${product.imageUrl}" class="cart-item-img" alt="${product.title}">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${product.title}</h4>
                        <div class="cart-item-price">$${product.price.toFixed(2)} each</div>
                    </div>
                    <div class="cart-item-actions">
                        <button class="qty-btn" onclick="app.updateQty(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="app.updateQty(${item.id}, 1)">+</button>
                        <button class="remove-btn" onclick="app.removeFromCart(${item.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        html += `
                <div class="cart-summary">
                    <div class="cart-total">Total: $${total.toFixed(2)}</div>
                    <div style="margin-bottom: 1rem; text-align: left;">
                        <input type="text" id="checkout-address" class="form-control" placeholder="Shipping Address" style="margin-bottom: 0.5rem;" required>
                        <input type="text" id="checkout-phone" class="form-control" placeholder="Phone Number" required>
                    </div>
                    <button class="btn" onclick="app.checkout(${total})">Proceed to Checkout</button>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    renderLogin(container) {
        container.innerHTML = `
            <div class="auth-container">
                <h2 class="auth-title">Welcome Back</h2>
                <form onsubmit="event.preventDefault(); app.login()">
                    <div class="form-group">
                        <input type="email" id="login-email" class="form-control" placeholder="Email Address" required>
                    </div>
                    <div class="form-group">
                        <input type="password" id="login-password" class="form-control" placeholder="Password" required>
                    </div>
                    <button type="submit" class="btn auth-btn">Login</button>
                </form>
                <div class="auth-switch">
                    Don't have an account? <a href="#register">Register</a>
                </div>
            </div>
        `;
    }

    renderRegister(container) {
        container.innerHTML = `
            <div class="auth-container">
                <h2 class="auth-title">Create Account</h2>
                <form onsubmit="event.preventDefault(); app.register()">
                    <div class="form-group">
                        <input type="text" id="reg-name" class="form-control" placeholder="Full Name" required>
                    </div>
                    <div class="form-group">
                        <input type="email" id="reg-email" class="form-control" placeholder="Email Address" required>
                    </div>
                    <div class="form-group">
                        <input type="password" id="reg-password" class="form-control" placeholder="Password" required>
                    </div>
                    <button type="submit" class="btn auth-btn">Register</button>
                </form>
                <div class="auth-switch">
                    Already have an account? <a href="#login">Login</a>
                </div>
            </div>
        `;
    }

    async renderOrders(container) {
        if (!this.token) return this.navigate('login');
        
        container.innerHTML = `<div class="view-header"><h2>Your Orders</h2></div><div id="orders-list">Loading...</div>`;
        
        try {
            const res = await fetch(`${API_URL}/orders`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const orders = await res.json();
            
            let html = '';
            if (orders.length === 0) {
                html = `<div class="cart-container"><div class="empty-cart"><p>You haven't placed any orders yet.</p></div></div>`;
            } else {
                orders.forEach(order => {
                    const date = new Date(order.createdAt).toLocaleDateString();
                    html += `
                        <div class="order-card">
                            <div class="order-header">
                                <div><strong>Order #${order.id}</strong> <span style="color:var(--text-secondary); margin-left:10px;">${date}</span></div>
                                <div class="order-status">${order.status}</div>
                            </div>
                            <ul class="order-item-list">
                    `;
                    order.OrderItems.forEach(item => {
                        html += `<li><span>${item.quantity}x ${item.Product.title}</span> <span>$${(item.price * item.quantity).toFixed(2)}</span></li>`;
                    });
                    html += `
                            </ul>
                            <div style="margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                                <div><strong>Ship To:</strong> ${order.address || 'Not Provided'}</div>
                                <div><strong>Phone:</strong> ${order.phone || 'Not Provided'}</div>
                            </div>
                            <div style="text-align: right; margin-top: 0.5rem; font-weight: bold;">
                                Total: $${order.total.toFixed(2)}
                            </div>
                        </div>
                    `;
                });
            }
            document.getElementById('orders-list').innerHTML = html;
        } catch (e) {
            this.showToast('Failed to load orders', 'error');
        }
    }

    // Cart Logic
    addToCart(productId) {
        if (!this.token) {
            this.showToast('Please login to add items to cart', 'error');
            this.navigate('login');
            return;
        }
        const item = this.cart.find(i => i.id === productId);
        if (item) {
            item.quantity++;
        } else {
            this.cart.push({ id: productId, quantity: 1 });
        }
        this.saveCart();
        this.showToast('Item added to cart', 'success');
    }

    updateQty(productId, change) {
        const item = this.cart.find(i => i.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
                return;
            }
            this.saveCart();
            this.renderCart(document.getElementById('app-container'));
        }
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(i => i.id !== productId);
        this.saveCart();
        this.renderCart(document.getElementById('app-container'));
    }

    saveCart() {
        localStorage.setItem('alphaCart', JSON.stringify(this.cart));
        this.updateCartCount();
    }

    updateCartCount() {
        const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cart-count').innerText = count;
    }

    // Auth Logic
    async login() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('alphaToken', this.token);
                localStorage.setItem('alphaUser', JSON.stringify(this.user));
                this.updateAuthNav();
                this.showToast('Login successful', 'success');
                this.navigate('home');
            } else {
                this.showToast(data.error || 'Login failed', 'error');
            }
        } catch (err) {
            this.showToast('Network error', 'error');
        }
    }

    async register() {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                this.showToast('Registration successful, please login', 'success');
                this.navigate('login');
            } else {
                this.showToast(data.error || 'Registration failed', 'error');
            }
        } catch (err) {
            this.showToast('Network error', 'error');
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('alphaToken');
        localStorage.removeItem('alphaUser');
        this.updateAuthNav();
        this.showToast('Logged out', 'success');
        this.navigate('home');
    }

    updateAuthNav() {
        const authLinks = document.getElementById('auth-links');
        if (this.user) {
            authLinks.innerHTML = `
                <a href="#orders">Orders</a>
                <button class="btn btn-outline" onclick="app.logout()">Logout</button>
            `;
        } else {
            authLinks.innerHTML = `
                <button class="btn btn-outline" onclick="app.navigate('login')">Login</button>
            `;
        }
    }

    // Checkout
    async checkout(total) {
        if (!this.token) {
            this.showToast('Please login to checkout', 'error');
            this.navigate('login');
            return;
        }

        const address = document.getElementById('checkout-address').value;
        const phone = document.getElementById('checkout-phone').value;

        if (!address || !phone) {
            this.showToast('Please provide shipping address and phone', 'error');
            return;
        }

        const itemsForCheckout = this.cart.map(item => {
            const product = this.products.find(p => p.id === item.id);
            return {
                id: item.id,
                quantity: item.quantity,
                price: product.price
            };
        });

        try {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ items: itemsForCheckout, total, address, phone })
            });
            
            if (res.ok) {
                this.cart = [];
                this.saveCart();
                this.showToast('Order placed successfully!', 'success');
                this.navigate('orders');
            } else {
                this.showToast('Failed to place order', 'error');
            }
        } catch (err) {
            this.showToast('Network error', 'error');
        }
    }

    // UI Helpers
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
            <span>${message}</span>
        `;
        document.getElementById('toast-container').appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease-out reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize App
const app = new App();
