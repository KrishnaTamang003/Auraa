// ========================================
// AURA COLLECTION - REFINED SCRIPT
// ========================================

// ========================================
// PRODUCT DATA
// ========================================
const productData = {
    lavender: { 
        edition: 1,
        name: 'Deep Lavender', 
        color: '#8b5cf6', 
        description: 'A handcrafted monolith of serenity. Notes of French Highland Lavender fused with smoked cedarwood. Designed for the ritual of stillness.',
        longevity: '60 Hours',
        price: 4850
    },
    rose: { 
        edition: 2,
        name: 'Rose Quartz', 
        color: '#f472b6',
        description: 'A delicate balance of strength and softness. Damask Rose tempered with mineral salt. The essence of gentle power.',
        longevity: '58 Hours',
        price: 4850
    },
    forest: { 
        edition: 3,
        name: 'Forest Green', 
        color: '#10b981',
        description: 'The scent of earth after rain. Damp moss, crushed pine needles, and ancient sandalwood. A grounding meditation.',
        longevity: '65 Hours',
        price: 4850
    },
    citrus: { 
        edition: 4,
        name: 'Citrus Gold', 
        color: '#fbbf24',
        description: 'Ethereal morning light captured in form. Bergamot, Sicilian Lemon, and a hint of white peppercorn. An awakening ritual.',
        longevity: '55 Hours',
        price: 4850
    }
};

// ========================================
// STATE MANAGEMENT
// ========================================
let currentTheme = 'lavender';
let isChanging = false;
let autoChangeTimer = null;

// ========================================
// MOBILE MENU MANAGEMENT
// ========================================
const mobileMenu = {
    menuToggle: null,
    mobileMenuPanel: null,
    overlay: null,
    
    init() {
        this.menuToggle = document.getElementById('menuToggle');
        this.mobileMenuPanel = document.getElementById('mobileMenu');
        this.overlay = document.getElementById('overlay');
        
        this.setupEvents();
    },
    
    setupEvents() {
        // Toggle button click
        this.menuToggle?.addEventListener('click', () => this.toggle());
        
        // Close menu when clicking on navigation links
        const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
        mobileNavItems.forEach(item => {
            item.addEventListener('click', () => this.close());
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    },
    
    toggle() {
        if (this.isOpen()) {
            this.close();
        } else {
            this.open();
        }
    },
    
    open() {
        this.mobileMenuPanel?.classList.add('active');
        this.menuToggle?.classList.add('active');
        
        // Only show overlay if no other modals are open
        const cartOpen = document.getElementById('cartBox')?.classList.contains('active');
        const loginOpen = document.getElementById('loginBox')?.classList.contains('active');
        
        if (!cartOpen && !loginOpen) {
            this.overlay?.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    close() {
        this.mobileMenuPanel?.classList.remove('active');
        this.menuToggle?.classList.remove('active');
        
        // Only hide overlay if no other modals are open
        const cartOpen = document.getElementById('cartBox')?.classList.contains('active');
        const loginOpen = document.getElementById('loginBox')?.classList.contains('active');
        
        if (!cartOpen && !loginOpen) {
            this.overlay?.classList.remove('active');
            document.body.style.overflow = '';
        }
    },
    
    isOpen() {
        return this.mobileMenuPanel?.classList.contains('active');
    }
};

// ========================================
// CART SYSTEM
// ========================================
const cart = {
    items: [],
    
    init() {
        this.loadFromStorage();
        this.setupEvents();
        this.updateDisplay();
    },

    setupEvents() {
        const events = [
            { id: 'cartBtn', event: 'click', handler: () => this.open() },
            { id: 'closeCartBtn', event: 'click', handler: () => this.close() },
            { id: 'overlay', event: 'click', handler: () => this.handleOverlayClick() },
            { id: 'loginBtn', event: 'click', handler: () => this.openLogin() },
            { id: 'guestBtn', event: 'click', handler: () => this.closeLogin() },
            { id: 'loginForm', event: 'submit', handler: (e) => { e.preventDefault(); this.handleLogin(); } },
            { id: 'addCartBtn', event: 'click', handler: () => this.addCurrentProduct() }
        ];

        events.forEach(({ id, event, handler }) => {
            document.getElementById(id)?.addEventListener(event, handler);
        });
    },
    
    handleOverlayClick() {
        // Close all modals and mobile menu when overlay is clicked
        this.close();
        this.closeLogin();
        mobileMenu.close();
    },

    addCurrentProduct() {
        const product = productData[currentTheme];
        this.addItem({
            id: currentTheme,
            name: product.name,
            price: product.price,
            edition: product.edition
        });
    },

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }

        this.saveToStorage();
        this.updateDisplay();
        this.showNotification(product.name, 'added');
    },

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToStorage();
        this.updateDisplay();
    },

    updateQuantity(productId, change) {
        const item = this.items.find(item => item.id === productId);
        if (!item) return;
        
        item.quantity += change;
        
        if (item.quantity <= 0) {
            this.removeItem(productId);
        } else {
            this.saveToStorage();
            this.updateDisplay();
        }
    },

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    },

    updateDisplay() {
        this.updateBadge();
        this.updateCartList();
        this.updateTotal();
    },

    updateBadge() {
        const badge = document.getElementById('cartBadge');
        if (!badge) return;
        
        const itemCount = this.getItemCount();
        badge.textContent = itemCount;
        badge.classList.toggle('visible', itemCount > 0);
    },

    updateCartList() {
        const itemsList = document.getElementById('cartItemsList');
        if (!itemsList) return;

        if (this.items.length === 0) {
            itemsList.innerHTML = this.getEmptyCartHTML();
        } else {
            itemsList.innerHTML = this.items.map(item => this.getCartItemHTML(item)).join('');
        }
    },

    getEmptyCartHTML() {
        return `
            <div style="text-align: center; padding: 3rem 0; opacity: 0.6;">
                <svg style="width: 4rem; height: 4rem; margin: 0 auto 1rem; opacity: 0.3;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                <p style="font-size: 0.875rem;">Your cart is empty</p>
            </div>
        `;
    },

    getCartItemHTML(item) {
        return `
            <div class="cart-item">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <div>
                        <h3 style="font-weight: 500; font-size: 1rem;">${item.name}</h3>
                        <p style="font-size: 0.75rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.1em;">Edition ${String(item.edition).padStart(2, '0')}</p>
                    </div>
                    <button onclick="cart.removeItem('${item.id}')" class="remove-btn">Remove</button>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <button onclick="cart.updateQuantity('${item.id}', -1)" class="glass-btn" 
                                style="width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; padding: 0;">−</button>
                        <span style="font-size: 0.875rem; font-weight: 300; width: 2rem; text-align: center;">${item.quantity}</span>
                        <button onclick="cart.updateQuantity('${item.id}', 1)" class="glass-btn" 
                                style="width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; padding: 0;">+</button>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.75rem; opacity: 0.6;">Rs. ${item.price.toLocaleString()} each</div>
                        <div style="font-weight: 400; font-size: 1rem;">Rs. ${(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                </div>
            </div>
        `;
    },

    updateTotal() {
        const totalPrice = document.getElementById('totalPrice');
        if (totalPrice) {
            totalPrice.textContent = `Rs. ${this.getTotal().toLocaleString()}`;
        }
    },

    showNotification(productName, type) {
        const notification = document.createElement('div');
        const message = type === 'added' ? 'Added to cart' : 'Welcome back!';
        
        notification.className = 'glass-effect';
        notification.style.cssText = `
            position: fixed; top: 6rem; right: 1.5rem; z-index: 2000;
            transform: translateX(150%); padding: 1rem 1.5rem; border-radius: 12px;
            transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <svg style="width: 1.25rem; height: 1.25rem; color: #4ade80;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <div>
                    <div style="font-size: 0.875rem; font-weight: 500;">${message}</div>
                    <div style="font-size: 0.75rem; opacity: 0.6;">${productName}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        setTimeout(() => {
            notification.style.transform = 'translateX(150%)';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    },

    toggleModal(boxId, overlayId, show) {
        const box = document.getElementById(boxId);
        const overlay = document.getElementById(overlayId);
        
        if (box) box.classList.toggle('active', show);
        if (overlay) overlay.classList.toggle('active', show);
        document.body.style.overflow = show ? 'hidden' : '';
        
        // Close mobile menu when opening other modals
        if (show) {
            mobileMenu.close();
        }
    },

    open() {
        this.toggleModal('cartBox', 'overlay', true);
    },

    close() {
        this.toggleModal('cartBox', 'overlay', false);
    },

    openLogin() {
        this.toggleModal('loginBox', 'overlay', true);
    },

    closeLogin() {
        this.toggleModal('loginBox', 'overlay', false);
    },

    saveToStorage() {
        try {
            localStorage.setItem('auraCart', JSON.stringify(this.items));
        } catch (e) {
            console.error('Failed to save cart:', e);
        }
    },

    loadFromStorage() {
        try {
            const savedCart = localStorage.getItem('auraCart');
            this.items = savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            this.items = [];
            console.error('Failed to load cart:', e);
        }
    },

    handleLogin() {
        const email = document.getElementById('emailInput')?.value;
        const password = document.getElementById('passwordInput')?.value;

        if (!email || !password) return;

        const username = email.split('@')[0];
        const initials = username.substring(0, 2).toUpperCase();
        const userData = { email, username, initials };

        try {
            localStorage.setItem('auraUser', JSON.stringify(userData));
            this.showUserProfile(userData);
            this.closeLogin();
            this.showNotification(username, 'login');
        } catch (e) {
            console.error('Login failed:', e);
        }
    },

    showUserProfile(userData) {
        const loginBtn = document.getElementById('loginBtn');
        const userProfile = document.getElementById('userProfile');
        const userAvatar = document.getElementById('userAvatar');
        
        if (loginBtn) loginBtn.style.display = 'none';
        if (userProfile) userProfile.classList.remove('hidden');
        
        if (userAvatar) {
            userAvatar.textContent = userData.initials;
            userAvatar.title = userData.email;
            
            // Remove any existing listeners by cloning
            const newAvatar = userAvatar.cloneNode(true);
            userAvatar.parentNode.replaceChild(newAvatar, userAvatar);
            
            newAvatar.addEventListener('click', () => {
                if (confirm('Do you want to sign out?')) {
                    this.handleLogout();
                }
            });
        }
    },

    handleLogout() {
        try {
            localStorage.removeItem('auraUser');
            const loginBtn = document.getElementById('loginBtn');
            const userProfile = document.getElementById('userProfile');
            
            if (loginBtn) loginBtn.style.display = 'block';
            if (userProfile) userProfile.classList.add('hidden');
        } catch (e) {
            console.error('Logout failed:', e);
        }
    },

    checkUserStatus() {
        try {
            const userData = localStorage.getItem('auraUser');
            if (userData) {
                this.showUserProfile(JSON.parse(userData));
            }
        } catch (e) {
            localStorage.removeItem('auraUser');
            console.error('Failed to check user status:', e);
        }
    }
};

// ========================================
// 3D MOUSE TRACKING EFFECT
// ========================================
function init3DEffect() {
    const container = document.getElementById('imageContainer');
    if (!container || window.innerWidth <= 1024) return;
    
    let animationFrameId = null;
    
    const handleMouseMove = (e) => {
        if (isChanging || animationFrameId) return;
        
        animationFrameId = requestAnimationFrame(() => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateY = ((x - centerX) / centerX) * 20;
            const rotateX = ((centerY - y) / centerY) * 20;
            
            const activeImage = container.querySelector('.product-image.active');
            if (activeImage) {
                activeImage.style.setProperty('--rotate-x', `${rotateX}deg`);
                activeImage.style.setProperty('--rotate-y', `${rotateY}deg`);
            }
            
            animationFrameId = null;
        });
    };
    
    const handleMouseLeave = () => {
        if (isChanging) return;
        
        const activeImage = container.querySelector('.product-image.active');
        if (activeImage) {
            activeImage.style.setProperty('--rotate-x', '0deg');
            activeImage.style.setProperty('--rotate-y', '0deg');
        }
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
}

// ========================================
// SEAMLESS THEME TRANSITIONS
// ========================================
function changeTheme(themeName, themeIndex) {
    if (isChanging || themeName === currentTheme) return;
    
    isChanging = true;
    const product = productData[themeName];
    
    // Update background
    document.querySelectorAll('.bg-gradient').forEach(layer => layer.classList.remove('active'));
    document.querySelector(`.bg-gradient[data-theme="${themeName}"]`)?.classList.add('active');

    // Update navigation dots
    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === themeIndex);
    });

    // Fade out content
    const infoBox = document.getElementById('infoContent');
    const detailsBox = document.getElementById('detailsContent');
    infoBox?.classList.remove('active');
    detailsBox?.classList.remove('active');

    // Transition images
    const currentImg = document.querySelector(`.product-image[data-theme="${currentTheme}"]`);
    const nextImg = document.querySelector(`.product-image[data-theme="${themeName}"]`);
    currentImg?.classList.remove('active');
    
    setTimeout(() => {
        nextImg?.classList.add('active');
        const glow = document.getElementById('imageGlow');
        if (glow) glow.style.background = product.color;
    }, 200);

    // Update content
    setTimeout(() => {
        updateProductContent(product);
        
        setTimeout(() => {
            infoBox?.classList.add('active');
            detailsBox?.classList.add('active');
        }, 150);

        currentTheme = themeName;
        setTimeout(() => { isChanging = false; }, 400);
    }, 400);
}

function updateProductContent(product) {
    const updates = [
        { id: 'editionNum', value: `Edition ${String(product.edition).padStart(2, '0')}` },
        { id: 'productTitle', value: product.name },
        { id: 'productDesc', value: product.description },
        { id: 'longevityValue', value: product.longevity },
        { id: 'priceValue', value: `Rs. ${product.price.toLocaleString()}` }
    ];

    updates.forEach(({ id, value }) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

// ========================================
// NAVIGATION CONTROLS
// ========================================
const themes = ['lavender', 'rose', 'forest', 'citrus'];

function navigateTheme(direction) {
    const currentIndex = themes.indexOf(currentTheme);
    const newIndex = (currentIndex + direction + themes.length) % themes.length;
    changeTheme(themes[newIndex], newIndex);
    stopAutoChange();
}

function goToPrevious() {
    navigateTheme(-1);
}

function goToNext() {
    navigateTheme(1);
}

function stopAutoChange() {
    if (autoChangeTimer) {
        clearInterval(autoChangeTimer);
        autoChangeTimer = null;
    }
}

function startAutoChange() {
    stopAutoChange();
    autoChangeTimer = setInterval(() => {
        const currentIndex = themes.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        changeTheme(themes[nextIndex], nextIndex);
    }, 8000);
}

// ========================================
// KEYBOARD NAVIGATION
// ========================================
function handleKeyboardNav(e) {
    // Don't handle keyboard navigation if mobile menu is open
    if (mobileMenu.isOpen()) return;
    
    if (isChanging) return;
    
    const keyActions = {
        'ArrowRight': goToNext,
        'ArrowDown': goToNext,
        'ArrowLeft': goToPrevious,
        'ArrowUp': goToPrevious
    };
    
    const action = keyActions[e.key];
    if (action) {
        e.preventDefault();
        action();
    }
}

// ========================================
// TOUCH SWIPE SUPPORT
// ========================================
let touchStartX = 0;
let touchEndX = 0;

function handleSwipe() {
    const swipeDistance = 50;
    const diff = touchEndX - touchStartX;
    
    if (Math.abs(diff) > swipeDistance) {
        diff < 0 ? goToNext() : goToPrevious();
    }
}

// ========================================
// INITIALIZATION
// ========================================
function initialize() {
    // Initialize mobile menu
    mobileMenu.init();
    
    // Initialize cart system
    cart.init();
    cart.checkUserStatus();
    
    // Initialize 3D effect
    init3DEffect();
    
    // Setup keyboard navigation
    document.addEventListener('keydown', handleKeyboardNav);
    
    // Setup touch swipe
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    // Setup dot navigation
    document.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', stopAutoChange);
    });
    
    // Start auto rotation
    startAutoChange();
    
    // Pause auto-rotate on first user interaction
    document.addEventListener('mousedown', stopAutoChange, { once: true });
}

// ========================================
// EVENT LISTENERS
// ========================================
document.addEventListener('DOMContentLoaded', initialize);
window.addEventListener('resize', init3DEffect);

