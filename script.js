// ============================================
// SISTEMA DE NOTIFICACIONES - GLOBAL
// ============================================

function showNotification(message, type = 'success') {
    console.log('📢 NOTIFICACIÓN MOSTRADA:', message, 'tipo:', type);
    
    // Ignore legacy redirect-to-login notifications
    try {
        const m = (message || '').toString().toLowerCase();
        if (m.includes('redire') && m.includes('login')) return;
    } catch (e) {
        // ignore
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const bgColor = type === 'error' ? '#ef5350' : '#4CAF50';
    const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    // ESTILOS INLINE - MÁS GRANDE Y VISIBLE
    notification.style.cssText = `
        position: fixed;
        top: 80px !important;
        right: 20px !important;
        background: ${bgColor} !important;
        color: white !important;
        padding: 20px 30px !important;
        border-radius: 12px !important;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4) !important;
        z-index: 99999 !important;
        font-size: 1.1rem !important;
        font-weight: 700 !important;
        display: flex !important;
        align-items: center !important;
        gap: 15px !important;
        animation: slideInRight 0.4s ease-out !important;
        border-left: 6px solid ${type === 'error' ? '#d32f2f' : '#1B5E20'} !important;
        min-width: 350px !important;
    `;

    document.body.appendChild(notification);
    console.log('✅ Notificación añadida al DOM');

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease-in';
        setTimeout(() => notification.remove(), 400);
    }, 5000);
}

// CSS para animaciones globales
const notificationStyles = document.createElement('style');
notificationStyles.innerHTML = `
    @keyframes slideInRight {
        from {
            transform: translateX(500px);
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
            transform: translateX(500px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// ============================================
// GLOBAL CART INITIALIZATION
// ============================================

let cart = []; // Carrito VACÍO por defecto (no leer del localStorage aún)
// Authentication flag (initialized on load)
window.isAuthenticated = false;
window.authCheckCompleted = false; // ⛔ Bandera de seguridad - checkAuth() debe completar PRIMERO

console.log('⚠️ SCRIPT INICIANDO - Verificación de seguridad...');

// ⛔⛔⛔ LIMPIEZA INMEDIATA E IRREVERSIBLE ⛔⛔⛔
// ANTES de que cualquier cosa suceda, asegurarse de que NO hay carrito sin autenticación
(function() {
    console.log('🔍 BLOQUEO DE SEGURIDAD DE INICIO - Limpiando localStorage...');
    const stored = localStorage.getItem('pvcCart');
    console.log('localStorage.getItem("pvcCart") ANTES:', stored);
    
    // SIEMPRE LIMPIAR localStorage al cargar - se restaurará si hay sesión VERIFICADA
    localStorage.removeItem('pvcCart');
    cart = [];
    console.log('✅ localStorage LIMPIADO - Carrito vacío inicializado');
})();

function checkAuth() {
    return fetch('/pvc/api/me.php', { credentials: 'same-origin' })
        .then(res => res.json())
        .then(data => {
            window.isAuthenticated = !!(data && data.success);
            window.authCheckCompleted = true; // ✅ MARCAR QUE checkAuth COMPLETÓ
            console.log('✅ checkAuth() completó. isAuthenticated:', window.isAuthenticated);
            
            // ⛔ GARANTIZAR que si NO hay sesión, carrito está VACÍO
            if (!window.isAuthenticated) {
                console.warn('⛔ NO HAY SESIÓN - FORZANDO CARRITO VACÍO');
                cart = [];
                localStorage.removeItem('pvcCart');
            }
            
            return window.isAuthenticated;
        })
        .catch(() => {
            window.isAuthenticated = false;
            window.authCheckCompleted = true; // ✅ MARCAR COMO COMPLETADO INCLUSO EN ERROR
            console.error('❌ checkAuth() falló - FORZANDO CARRITO VACÍO');
            cart = [];
            localStorage.removeItem('pvcCart');
            return false;
        });
}

// Actualizar UI según estado de autenticación
function updateAuthUI() {
    const isAuth = window.isAuthenticated;
    
    // Deshabilitar botones "Agregar al carrito"
    document.querySelectorAll('.btn-primary').forEach(btn => {
        if (btn.textContent.includes('Agregar') || btn.textContent.includes('Carrito')) {
            if (!isAuth) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
                btn.title = 'Inicia sesión para agregar al carrito';
            }
        }
    });
    
    // Deshabilitar botones favoritos
    document.querySelectorAll('.btn-secondary').forEach(btn => {
        if (!isAuth) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.title = 'Inicia sesión para agregar a favoritos';
        }
    });
}

// ============================================
// SELECTOR DE TEXTURAS PVC - MICROFUNCIÓN
// ============================================

const textureData = {
    'arezzo': {
        color: '#E8D4C0',
        gradient: 'linear-gradient(135deg, #E8D4C0, #F0E0D0)',
        pattern: 'glossy'
    },
    'qatar': {
        color: '#B8A898',
        gradient: 'linear-gradient(135deg, #B8A898, #C8B8A8)',
        pattern: 'matte'
    },
    'siena': {
        color: '#D4A574',
        gradient: 'linear-gradient(135deg, #D4A574, #E4B584)',
        pattern: 'glossy'
    },
    'zermatt': {
        color: '#A9A9A9',
        gradient: 'linear-gradient(135deg, #A9A9A9, #C0C0C0)',
        pattern: 'matte'
    }
};

document.querySelectorAll('.texture-selector').forEach(selector => {
    selector.addEventListener('click', function() {
        const texture = this.getAttribute('data-texture');
        const data = textureData[texture];
        
        // Remover selección anterior
        document.querySelectorAll('.texture-selector').forEach(s => {
            s.style.borderColor = 'transparent';
            s.style.transform = 'scale(1)';
        });
        
        // Agregar selección actual
        this.style.borderColor = '#1B5E20';
        this.style.transform = 'scale(1.05)';
        
        // Actualizar preview
        const preview = document.getElementById('selectedTexture');
        const sample = preview.querySelector('.pvc-sample');
        
        sample.style.background = data.gradient;
        sample.style.backgroundSize = '40px 40px';
        
        // Agregar patrón visual
        addTexturePattern(sample, data.pattern);
        
        // Animación
        sample.style.animation = 'none';
        setTimeout(() => {
            sample.style.animation = 'textureAnimation 20s linear infinite';
        }, 10);
        
        showNotification(`Textura seleccionada: ${this.querySelector('.deal-name').textContent}`);
    });
});

function addTexturePattern(element, pattern) {
    element.style.backgroundImage = '';
    
    if (pattern === 'wood') {
        element.style.backgroundImage = `
            repeating-linear-gradient(90deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 2px, transparent 2px, transparent 4px),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 3px)
        `;
    } else if (pattern === 'wood-dark') {
        element.style.backgroundImage = `
            repeating-linear-gradient(90deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 3px, transparent 3px, transparent 6px)
        `;
    } else if (pattern === 'glossy') {
        element.style.backgroundImage = `
            linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%),
            repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 2px)
        `;
    } else if (pattern === 'matte') {
        element.style.backgroundImage = `
            repeating-linear-gradient(0deg, transparent 24%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.05) 26%, transparent 27%, transparent 74%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.05) 76%, transparent 77%, transparent),
            repeating-linear-gradient(90deg, transparent 24%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.05) 26%, transparent 27%, transparent 74%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.05) 76%, transparent 77%, transparent)
        `;
    }
}

// ============================================
// CARRUSEL INTERACTIVO
// ============================================

let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.dot');

function showSlide(n) {
    // Guardar si no hay slides/dots definidos
    if (!slides || slides.length === 0) return;
    
    // Limpiar estados si existen
    slides.forEach(slide => { if (slide && slide.classList) slide.classList.remove('active'); });
    if (!dots || dots.length === 0) {
        // Solo slides, marcar el actual si existe
        currentSlide = (n + slides.length) % slides.length;
        if (slides[currentSlide] && slides[currentSlide].classList) slides[currentSlide].classList.add('active');
        return;
    }

    dots.forEach(dot => { if (dot && dot.classList) dot.classList.remove('active'); });
    
    currentSlide = (n + slides.length) % slides.length;
    if (slides[currentSlide] && slides[currentSlide].classList) slides[currentSlide].classList.add('active');
    if (dots[currentSlide] && dots[currentSlide].classList) dots[currentSlide].classList.add('active');
}

// ============================================
// ESPERAR A QUE EL DOM ESTÉ CARGADO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 DOMContentLoaded disparado');
    
    // Initialize authentication flag early so UI handlers can use it
    checkAuth().then(() => {
        console.log('✅ checkAuth completó. window.isAuthenticated =', window.isAuthenticated);
        
        // After auth check, enable buttons if authenticated, disable if not
        updateAuthUI();
        
        // ⛔ Si NO está autenticado, GARANTIZAR que carrito está VACÍO
        if (!window.isAuthenticated) {
            console.warn('⛔⛔⛔ SEGUNDA VERIFICACIÓN: NO AUTENTICADO - LIMPIANDO CARRITO ⛔⛔⛔');
            cart = [];
            localStorage.removeItem('pvcCart');
            const cartBadge = document.querySelector('.carrito-badge');
            if (cartBadge) cartBadge.textContent = '0';
        } else {
            console.log('✅✅✅ USUARIO AUTENTICADO - CARRITO DISPONIBLE ✅✅✅');
        }
    });

    // ============================================
    // CONFIGURAR CAROUSEL (SI EXISTE)
    // ============================================
    if (document.querySelector('.carousel-btn.prev')) {
        document.querySelector('.carousel-btn.prev').addEventListener('click', () => {
            showSlide(currentSlide - 1);
        });
    }

    if (document.querySelector('.carousel-btn.next')) {
        document.querySelector('.carousel-btn.next').addEventListener('click', () => {
            showSlide(currentSlide + 1);
        });
    }

    if (dots && dots.length > 0) {
        dots.forEach((dot, index) => {
            if (dot) dot.addEventListener('click', () => showSlide(index));
        });
    }

    // Auto advance carousel (solo si existen slides)
    if (slides && slides.length > 0) {
        setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    }

// ============================================
// SELECTOR DE COLOR CON CAMBIO DE IMAGEN
// ============================================

const imageSelectorElements = document.querySelectorAll('.image-selector');
console.log('Elementos encontrados:', imageSelectorElements.length);

imageSelectorElements.forEach(swatch => {
    swatch.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Click en selector:', this.getAttribute('data-color'));
        
        const parentContainer = this.parentElement;
        const productCard = this.closest('.product-card');
        
        // Remover selección anterior
        parentContainer.querySelectorAll('.image-selector').forEach(s => {
            s.style.borderColor = 'transparent';
            s.style.transform = 'scale(1)';
        });
        
        // Agregar selección actual
        this.style.borderColor = '#1B5E20';
        this.style.transform = 'scale(1.15)';
        
        // Cambiar imagen del producto
        const imageUrl = this.getAttribute('data-image');
        console.log('Imagen URL:', imageUrl);
        
        const productImage = productCard.querySelector('img');
        if (productImage) {
            console.log('Imagen encontrada, cambiando a:', imageUrl);
            productImage.style.opacity = '0.7';
            productImage.src = imageUrl;
            setTimeout(() => {
                productImage.style.opacity = '1';
            }, 200);
        } else {
            console.log('Imagen no encontrada');
        }
    });
});

// Agregar transición suave a la imagen
const styleImage = document.createElement('style');
styleImage.innerHTML = `
    .product-image img {
        transition: opacity 0.3s ease-in-out;
    }
`;
document.head.appendChild(styleImage);

// ============================================
// BOTONES AÑADIR AL CARRITO
// ============================================

// Los botones de añadir al carrito se manejan con addToCart() que se llama desde el HTML
// Para añadir animación al botón, podemos usar delegación de eventos

// ============================================
// BOTONES FAVORITOS
// ============================================

document.querySelectorAll('.btn-secondary').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();

        // Require authentication - bloqueo absoluto
        if (!window.isAuthenticated) {
            showNotification('Inicia sesión para agregar a favoritos', 'error');
            const loginModal = document.getElementById('loginModal');
            if (loginModal) loginModal.classList.add('active');
            return;
        }

        const icon = this.querySelector('i');
        const isFavorite = icon.classList.contains('fas');

        if (isFavorite) {
            icon.classList.remove('fas');
            icon.classList.add('far');
            this.style.backgroundColor = '';
        } else {
            icon.classList.remove('far');
            icon.classList.add('fas');
            this.style.backgroundColor = '#E8F5E9';
            showNotification('¡Agregado a favoritos!');
        }
    });
});

// ============================================
// BÚSQUEDA
// ============================================

const searchBtn = document.querySelector('.search-bar button');
const searchInput = document.querySelector('.search-bar input');

if (searchBtn) {
    searchBtn.addEventListener('click', function() {
        const query = searchInput.value;
        if (query) {
            showNotification('Buscando: ' + query);
        }
    });
}

if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
}

// ============================================
// WHATSAPP BUTTON FUNCTIONALITY
// ============================================

const whatsappBtn = document.getElementById('whatsappBtn');
const phoneNumber = '573242104067'; // Número de WhatsApp
const message = encodeURIComponent('Hola, me interesa conocer más sobre los productos PVC. ¿Podrías ayudarme?');

if (whatsappBtn) {
    whatsappBtn.addEventListener('click', function(e) {
        e.preventDefault();
        // Redirigir a WhatsApp Web
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
        // Agregar efecto de pulso
        whatsappBtn.classList.remove('pulse');
        setTimeout(() => whatsappBtn.classList.add('pulse'), 100);
    });
    
    // Efecto hover suave - pausar animación
    whatsappBtn.addEventListener('mouseenter', function() {
        this.style.animation = 'none';
    });
    
    whatsappBtn.addEventListener('mouseleave', function() {
        this.style.animation = 'floatWhatsapp 3s ease-in-out infinite';
    });
}

// ============================================
// LOGIN MODAL FUNCTIONALITY
// ============================================

const loginModal = document.getElementById('loginModal');
const miCuentaBtn = document.getElementById('miCuentaBtn');
const closeModal = document.getElementById('closeModal');
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.querySelector('.login-form');
const registerForm = document.querySelector('.register-form');

// Abrir modal (si existe botón)
if (miCuentaBtn) {
    miCuentaBtn.addEventListener('click', function(e) {
        e.preventDefault();
        // Si el usuario ya está autenticado, ir a MiCuenta.html
        fetch('/pvc/api/me.php', { credentials: 'same-origin' })
            .then(res => res.json())
            .then(data => {
                if (data && data.success) {
                    window.location.href = 'MiCuenta.html';
                } else if (loginModal) {
                    loginModal.classList.add('active');
                }
            })
            .catch(err => {
                console.error('Error verificando sesión:', err);
                if (loginModal) loginModal.classList.add('active');
            });
    });
}

// Cerrar modal (si existen los controles)
if (closeModal) {
    closeModal.addEventListener('click', function() {
        if (loginModal) loginModal.classList.remove('active');
    });
}

if (loginModal) {
    // Cerrar al hacer clic fuera del modal
    loginModal.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
        }
    });
}

// Cerrar con tecla ESC (si el modal existe)
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && loginModal) {
        loginModal.classList.remove('active');
    }
});

// Cambiar pestañas (si existen los botones)
if (switchToRegister) {
    switchToRegister.addEventListener('click', function(e) {
        e.preventDefault();
        if (loginTab && registerTab) {
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
        }
    });
}

if (switchToLogin) {
    switchToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        if (loginTab && registerTab) {
            registerTab.classList.remove('active');
            loginTab.classList.add('active');
        }
    });
}

// Manejar envío del formulario de login
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showNotification('Completa los campos de correo y contraseña');
            return;
        }

        fetch('/pvc/api/login.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showNotification(`¡Bienvenido ${data.name || ''}!`);
                setTimeout(() => {
                    // Redirigir a la página de cuenta
                    window.location.href = 'MiCuenta.html';
                }, 800);
            } else {
                showNotification(data.error || 'Credenciales incorrectas');
            }
        })
        .catch(err => {
            console.error(err);
            showNotification('Error al conectar con el servidor');
        });
    });
}

// Manejar envío del formulario de registro
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const phone = document.getElementById('regPhone').value || null;

        if (!name || !email || !password) {
            showNotification('Completa nombre, correo y contraseña');
            return;
        }

        fetch('/pvc/api/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone })
        })
        .then(res => res.json())
        .then(data => {
            if (data && data.success) {
                showNotification(`¡Cuenta creada exitosamente, ${name}!`);
                setTimeout(() => {
                    loginModal.classList.remove('active');
                    registerForm.reset();
                    registerTab.classList.remove('active');
                    loginTab.classList.add('active');
                }, 1000);
            } else {
                showNotification('No se pudo crear la cuenta');
            }
        })
        .catch(err => {
            console.error(err);
            showNotification('Error al conectar con el servidor');
        });
    });
}

}); // Cierre del DOMContentLoaded

// ============================================
// FUNCIÓN GLOBAL PARA AGREGAR AL CARRITO
// ============================================

// ⛔⛔⛔ FUNCIÓN GLOBAL ACCESIBLE DESDE HTML ⛔⛔⛔
function addToCart(product) {
    console.log('🛒🛒🛒 addToCart EJECUTADO 🛒🛒🛒');
    console.log('window.authCheckCompleted:', window.authCheckCompleted);
    console.log('window.isAuthenticated:', window.isAuthenticated);
    
    // ⛔⛔⛔ ESPERAR A QUE checkAuth() COMPLETE ⛔⛔⛔
    if (!window.authCheckCompleted) {
        console.error('❌❌❌ ESPERA: checkAuth() AÚN NO HA COMPLETADO - BLOQUEANDO PRODUCTO ❌❌❌');
        showNotification('Por favor espera un momento...', 'error');
        return false;
    }
    
    // ⛔⛔⛔ BLOQUEO ABSOLUTO - SI NO ESTÁ AUTENTICADO, SALIR YA ⛔⛔⛔
    if (!window.isAuthenticated) {
        console.error('❌❌❌ BLOQUEADO TOTAL: NO AUTENTICADO - PRODUCTO NO SE AGREGA ❌❌❌');
        showNotification('Inicia sesión para añadir al carrito', 'error');
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.classList.add('active');
        return false; // ⛔ NO CONTINÚA - PUNTO FINAL
    }

    console.log('✅✅✅ USUARIO AUTENTICADO - AGREGANDO PRODUCTO ✅✅✅');
    
    const existingItem = cart.find(item => 
        item.name === product.name && item.color === product.color
    );

    if (existingItem) {
        existingItem.quantity += product.quantity || 1;
    } else {
        cart.push({
            name: product.name,
            price: product.price,
            color: product.color || 'Estándar',
            image: product.image,
            quantity: product.quantity || 1
        });
    }

    // Guardar en localStorage SOLO si está autenticado
    localStorage.setItem('pvcCart', JSON.stringify(cart));
    
    // Actualizar badge
    const cartBadge = document.querySelector('.carrito-badge');
    if (cartBadge) {
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalQuantity;
    }
    
    // Animar botón
    const button = event && event.target && event.target.closest ? event.target.closest('.btn-primary, .add-to-cart-btn') : null;
    if (button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> ¡Agregado!';
        button.style.backgroundColor = '#2E7D32';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.backgroundColor = '';
        }, 2000);
    }
    
    showNotification(`${product.name} agregado al carrito`);
    return true;
};

// ============================================
// LOGO SPIN (gira como un dado y vuelve a su posición)
// ============================================
document.addEventListener('click', function(e) {
    const img = e.target.closest && e.target.closest('.logo-img');
    if (!img) return;

    // evitar re-disparo mientras se anima
    if (img.classList.contains('logo-spin')) return;

    img.classList.add('logo-spin');
    img.addEventListener('animationend', function handler() {
        img.classList.remove('logo-spin');
        img.removeEventListener('animationend', handler);
    });
});