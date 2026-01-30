// ============================================
// LANA CLOTHING SHOP - MAIN JAVASCRIPT
// ============================================

// ============ Product Data ============
let products = [];

// Load products from JSON file
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        products = await response.json();
        // Initialize the page once products are loaded
        initializePage();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function initializePage() {
    // Update cart count on page load
    updateCartCount();

    // Products page
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterProducts(this.dataset.category);
        });
    });

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortProducts(this.value);
        });
        renderProducts();
    }

    // Cart page
    if (document.getElementById('cart-items-list')) {
        renderCart();
    }

    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            showNotification('Purchase successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'products.html';
            }, 1500);
        });
    }

    const continueShoppingBtn = document.querySelector('.btn-continue');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            window.location.href = 'products.html';
        });
    }

    // Auth forms
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Login successful!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Account created successfully!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }
}

// ============ Cart Management ============
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({...product, quantity: 1});
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification('Added to cart!');
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, quantity);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }
}

// ============ Products Page ============
function renderProducts(productsToRender = products) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.innerHTML = productsToRender.map(product => `
        <div class="product-card">
            <div class="product-image" style="background-image: url('${product.image}'); background-size: cover; background-position: center; background-color: rgba(126, 200, 217, 0.2);">
                <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; display: none;" onerror="this.style.display='none'">
                <button class="wishlist-btn" onclick="toggleWishlist(${product.id})">❤️</button>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">🛒</button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterProducts(category) {
    const filtered = category === 'All' ? products : products.filter(p => p.category === category);
    renderProducts(filtered);
    updateProductCount(filtered.length);
}

function sortProducts(sortBy) {
    let sorted = [...products];
    
    switch(sortBy) {
        case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            // Featured (original order)
            break;
    }
    
    renderProducts(sorted);
}

function updateProductCount(count) {
    const countEl = document.getElementById('product-count');
    if (countEl) {
        countEl.textContent = `${count} items available`;
    }
}

// ============ Cart Page ============
function renderCart() {
    const emptyCart = document.getElementById('empty-cart');
    const cartList = document.getElementById('cart-items-list');
    const orderSummary = document.getElementById('order-summary');

    if (!cartList) return;

    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartList.style.display = 'none';
        orderSummary.style.display = 'none';
        return;
    }

    emptyCart.style.display = 'none';
    cartList.style.display = 'flex';
    orderSummary.style.display = 'block';

    cartList.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image" style="background-image: url('${item.image}'); background-size: cover; background-position: center; background-color: rgba(126, 200, 217, 0.2);"></div>
            <div class="cart-item-details">
                <span class="cart-item-category">${item.category}</span>
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-actions">
                <button class="remove-btn" onclick="removeFromCart(${item.id})">🗑️</button>
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
                    <div class="quantity-display">${item.quantity}</div>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        </div>
    `).join('');

    updateOrderSummary();
}

function updateOrderSummary() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 50 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// ============ Utilities ============
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #7ec8d9;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function toggleWishlist(productId) {
    showNotification('Added to wishlist!');
}

// ============ Event Listeners ============
document.addEventListener('DOMContentLoaded', function() {
    // Load products from JSON and initialize page
    loadProducts();
});

// ============ Animations ============
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
