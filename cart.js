// ============================================
// CARRITO DE COMPRAS - FUNCIONALIDAD
// ============================================

// NOTA: La variable 'cart' es compartida desde script.js (cargado primero)

// Actualizar display del carrito
function updateCartDisplay() {
    const cartEmpty = document.getElementById('cartEmpty');
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    const cartBadge = document.querySelector('.carrito-badge');

    // Actualizar badge en ambas páginas (si existe) - suma total de cantidades
    if (cartBadge) {
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalQuantity;
    }

    // Si estos elementos no existen, estamos en index.html
    if (!cartEmpty || !cartItems || !cartSummary) {
        return;
    }

    // Estamos en cart.html, mostrar carrito
    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartItems.style.display = 'none';
        cartSummary.style.display = 'none';
    } else {
        cartEmpty.style.display = 'none';
        cartItems.style.display = 'block';
        cartSummary.style.display = 'block';

        renderCartItems();
        calculateTotal();
    }
}

// Renderizar items del carrito
function renderCartItems() {
    const cartItems = document.getElementById('cartItems');
    
    // Si cartItems no existe, estamos en index.html
    if (!cartItems) {
        return;
    }
    
    cartItems.innerHTML = '';

    cart.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-image">
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<i class="fas fa-image" style="font-size: 2rem; color: #ccc;"></i>'}
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>Color: <strong>${item.color || 'Estándar'}</strong></p>
                <p class="cart-item-price">$${parseFloat(item.price).toLocaleString('es-CO', {minimumFractionDigits: 2})}</p>
            </div>
            <div class="quantity-control">
                <button onclick="updateQuantity(${index}, -1)">−</button>
                <input type="number" value="${item.quantity}" min="1" readonly>
                <button onclick="updateQuantity(${index}, 1)">+</button>
            </div>
            <div class="cart-item-total">
                <div class="cart-item-total-price">
                    $${(parseFloat(item.price) * item.quantity).toLocaleString('es-CO', {minimumFractionDigits: 2})}
                </div>
                <button class="cart-item-remove" onclick="removeItem(${index})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItems.appendChild(itemElement);
    });
}

// Actualizar cantidad de item
function updateQuantity(index, change) {
    if (!cart || !cart[index]) {
        console.error('❌ Carrito no disponible o índice inválido');
        return;
    }
    
    const newQuantity = cart[index].quantity + change;
    
    if (newQuantity > 0) {
        cart[index].quantity = newQuantity;
        saveCart();
        updateCartDisplay();
        showNotification('Cantidad actualizada');
    }
}

// Eliminar item del carrito
function removeItem(index) {
    const itemName = cart[index].name;
    cart.splice(index, 1);
    saveCart();
    updateCartDisplay();
    showNotification(`${itemName} eliminado del carrito`);
}

// Calcular totales
function calculateTotal() {
    // Verificar que los elementos existen (solo en cart.html)
    if (!document.getElementById('subtotal')) {
        return;
    }

    let subtotal = 0;
    cart.forEach(item => {
        subtotal += parseFloat(item.price) * item.quantity;
    });

    const shipping = subtotal > 500 ? 0 : 50;
    let discount = 0;
    const total = subtotal + shipping - discount;

    document.getElementById('subtotal').textContent = '$' + subtotal.toLocaleString('es-CO', {minimumFractionDigits: 2});
    document.getElementById('shipping').textContent = shipping === 0 ? 'Gratis' : '$' + shipping.toLocaleString('es-CO', {minimumFractionDigits: 2});
    document.getElementById('total').textContent = '$' + total.toLocaleString('es-CO', {minimumFractionDigits: 2});
}

// Aplicar código de promoción
function applyPromo() {
    const promoInput = document.getElementById('promoInput');
    const promoCode = promoInput.value.toUpperCase();

    const promoCodes = {
        'WELCOME10': 0.10,
        'VERANO15': 0.15,
        'PVC20': 0.20
    };

    if (promoCodes[promoCode]) {
        const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace(/[^0-9.-]+/g, ''));
        const discount = subtotal * promoCodes[promoCode];

        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('discount').textContent = '-$' + discount.toLocaleString('es-CO', {minimumFractionDigits: 2});

        const shipping = subtotal > 500 ? 0 : 50;
        const total = subtotal + shipping - discount;
        document.getElementById('total').textContent = '$' + total.toLocaleString('es-CO', {minimumFractionDigits: 2});

        showNotification('¡Código aplicado! Descuento: ' + (promoCodes[promoCode] * 100) + '%');
        promoInput.value = '';
    } else {
        showNotification('Código no válido', 'error');
    }
}

// Proceder al pago
function proceedToCheckout() {
    // Require authentication
    if (!window.isAuthenticated) {
        showNotification('Inicia sesión para completar la compra', 'error');
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.classList.add('active');
        return;
    }

    if (cart.length === 0) {
        showNotification('Tu carrito está vacío', 'error');
        return;
    }

    showNotification('Redirigiendo al pago...');
    setTimeout(() => {
        alert('Página de pago (en desarrollo)');
    }, 1500);
}

// Guardar carrito en localStorage (SOLO SI ESTÁ AUTENTICADO)
function saveCart() {
    // ⛔ NUNCA escribir en localStorage sin autenticación
    if (!window.isAuthenticated) {
        console.warn('⛔ NO AUTENTICADO - saveCart() IGNORADO - NO GUARDAR EN localStorage');
        localStorage.removeItem('pvcCart');
        return false;
    }
    
    console.log('✅ AUTENTICADO - Guardando carrito en localStorage');
    localStorage.setItem('pvcCart', JSON.stringify(cart));
    return true;
}

// Notificación
function showNotification(message, type = 'success') {
    // Ignore legacy redirect-to-login notifications (accented/unaccented)
    try {
        const m = (message || '').toString().toLowerCase();
        if (m.includes('redire') && m.includes('login')) return;
    } catch (e) {
        // ignore
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        background: ${type === 'error' ? '#ef5350' : '#4CAF50'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 999;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// WhatsApp Button
function setupWhatsAppButton() {
    // Evitar ejecutar múltiples veces
    if (window.whatsappButtonSetup) return;
    window.whatsappButtonSetup = true;

    const whatsappBtn = document.getElementById('whatsappBtn');
    const phoneNumber = '573242104067';
    const message = encodeURIComponent('Hola Dimafel, me gustaría conocer más sobre sus productos y diseños.');

    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
        });

        whatsappBtn.addEventListener('mouseenter', function() {
            this.style.animation = 'none';
        });

        whatsappBtn.addEventListener('mouseleave', function() {
            this.style.animation = 'floatWhatsapp 3s ease-in-out infinite';
        });
    }
}

// Mi Cuenta Button
function setupMiCuentaButton() {
    const miCuentaBtn = document.getElementById('miCuentaBtn');
    if (miCuentaBtn) {
        miCuentaBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Intentar verificar sesión; si está autenticado, ir a MiCuenta, si no, abrir modal
            fetch('/pvc/api/me.php', { credentials: 'same-origin' })
                .then(res => res.json())
                .then(data => {
                    if (data && data.success) {
                        window.location.href = 'MiCuenta.html';
                    } else {
                        const loginModal = document.getElementById('loginModal');
                        if (loginModal) loginModal.classList.add('active');
                    }
                })
                .catch(err => {
                    console.error('Error verificando sesión:', err);
                    const loginModal = document.getElementById('loginModal');
                    if (loginModal) loginModal.classList.add('active');
                });
        });
    }
}

// Continuar Comprando
function continueShopping() {
    window.location.href = 'index.html';
}

// CSS para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
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

// Inicializar carrito cuando se carga cart.html - ESPERAR A checkAuth()
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('⏳ cart.js DOMContentLoaded - Esperando checkAuth() si es necesario...');
        
        // Si checkAuth ya se ejecutó (desde script.js), usamos el resultado
        // Si no, este bloque espera un poco más
        setTimeout(function() {
            console.log('✅ Después del timeout, window.isAuthenticated =', window.isAuthenticated);
            
            // ⛔ Si no está autenticado, limpiar carrito
            if (!window.isAuthenticated) {
                console.warn('⛔⛔⛔ NO AUTENTICADO EN CART - LIMPIANDO COMPLETAMENTE ⛔⛔⛔');
                cart = [];
                localStorage.removeItem('pvcCart');
                const cartBadge = document.querySelector('.carrito-badge');
                if (cartBadge) cartBadge.textContent = '0';
            } else {
                console.log('✅✅✅ AUTENTICADO - Cargar carrito desde localStorage ✅✅✅');
                const stored = localStorage.getItem('pvcCart');
                if (stored && stored !== '[]') {
                    cart = JSON.parse(stored) || [];
                    console.log('Carrito cargado:', cart);
                } else {
                    cart = [];
                }
            }
            updateCartDisplay();
            setupWhatsAppButton();
            setupMiCuentaButton();
        }, 100); // Pequeño delay para permitir que checkAuth() se ejecute
    });
} else {
    // DOM ya cargado (raro pero por seguridad)
    setTimeout(function() {
        console.log('⏳ cart.js (DOM ya cargado) - Esperando checkAuth()...');
        console.log('window.isAuthenticated =', window.isAuthenticated);
        
        if (!window.isAuthenticated) {
            console.warn('⛔⛔⛔ NO AUTENTICADO (TIMEOUT) - LIMPIANDO ⛔⛔⛔');
            cart = [];
            localStorage.removeItem('pvcCart');
            const cartBadge = document.querySelector('.carrito-badge');
            if (cartBadge) cartBadge.textContent = '0';
        } else {
            console.log('✅✅✅ AUTENTICADO (TIMEOUT) - Cargar carrito ✅✅✅');
            const stored = localStorage.getItem('pvcCart');
            if (stored && stored !== '[]') {
                cart = JSON.parse(stored) || [];
            } else {
                cart = [];
            }
        }
        updateCartDisplay();
        setupWhatsAppButton();
        setupMiCuentaButton();
    }, 150); // Delay más largo aquí
}
