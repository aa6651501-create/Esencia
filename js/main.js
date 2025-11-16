// Configuración global (usa tu número real aquí)
const WHATSAPP_PHONE = '573045649705'; // Ejemplo: Código de país + Número
const STORE_NAME = 'Esencia Perfumes';
const CATALOG_PRODUCTS = [
    { id: 1, name: "Velvet Rose Essence", price: 100000, img: 'img/catalogo/perfumecatalogo1.png', desc: "Dulce y floral, perfecto para destacar con elegancia" },
    { id: 2, name: "Armaf Club de Nuit Intense EDT", price: 139000, img: 'img/catalogo/perfumecatalogo2.png', desc: "Profundo y masculino, ideal para noches especiales." },
    { id: 3, name: "Chrome Tradicional EDT", price: 252890, img: 'img/catalogo/perfumecatalogo3.png', desc: "Refrescante y limpio, perfecto para diario." },
    { id: 4, name: "Cool Water De Davidoff", price: 188000 , img: 'img/catalogo/perfumecatalogo4.png', desc: "El clásico, intenso y seductor." },
    { id: 5, name: "Montblanc Legend Blue", price: 282000, img: 'img/catalogo/perfumecatalogo5.png', desc: "Especiado y cálido, para espíritus aventureros." },
    { id: 6, name: "Eternity For Men Calvin Klein ", price: 350000, img: 'img/catalogo/perfumecatalogo6.png', desc: "Notas amaderadas con un fondo dulce." },
    { id: 7, name: "GUESS Seductive Homme", price: 200000, img: 'img/catalogo/perfumecatalogo7.png', desc: "Simple y elegante, ideal para uso diario." },
    {id: 8, name: "Versace Pour Homme ",price: 400000, img: 'img/catalogo/perfumecatalogo8.png', desc: "Simple y elegante, ideal para uso diario." }
];

let cart = JSON.parse(localStorage.getItem('esenciaCart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------------------------------------
    // 1. LÓGICA DE NAVEGACIÓN Y CARRITO (Aplicable a todas las páginas)
    // ------------------------------------------------------------------
    
    // Menú Móvil
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('open');
            menuToggle.classList.toggle('open');
            const isExpanded = menuToggle.classList.contains('open');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    // Carrito Flotante (Modal)
    const cartButton = document.getElementById('cart-button');
    const cartModal = document.getElementById('cart-modal');
    const cartClose = document.getElementById('cart-close');
    const whatsappCheckoutButton = document.getElementById('whatsapp-checkout-btn');

    if (cartButton && cartModal) {
        cartButton.addEventListener('click', () => {
            cartModal.classList.add('open');
            renderCart(); // Renderiza el carrito cada vez que se abre
        });
    }
    if (cartClose && cartModal) {
        cartClose.addEventListener('click', () => cartModal.classList.remove('open'));
    }
    if (cartModal) {
        // Cerrar al hacer clic fuera de la barra lateral
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                cartModal.classList.remove('open');
            }
        });
    }

    if (whatsappCheckoutButton) {
        whatsappCheckoutButton.addEventListener('click', handleWhatsAppCheckout);
    }
    
    // Lógica para todos los botones de "Comprar por WhatsApp" (compra directa)
    document.querySelectorAll('.whatsapp-buy-btn').forEach(button => {
        button.addEventListener('click', function() {
            const name = this.getAttribute('data-product-name');
            const price = this.getAttribute('data-product-price');
            handleDirectWhatsAppBuy(name, price);
        });
    });

    // ------------------------------------------------------------------
    // 2. LÓGICA DEL CARRITO
    // ------------------------------------------------------------------

    function updateCartCount() {
        const countElement = document.getElementById('cart-count');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (countElement) {
            countElement.textContent = totalItems;
            countElement.style.display = totalItems > 0 ? 'block' : 'none';
        }
    }

    function saveCart() {
        localStorage.setItem('esenciaCart', JSON.stringify(cart));
        updateCartCount();
    }

    window.addToCart = (productId) => {
        const product = CATALOG_PRODUCTS.find(p => p.id === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        saveCart();
        showToast(`${product.name} añadido al carrito.`);
        renderCart();
    }

    window.removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        renderCart();
        showToast(`Producto eliminado del carrito.`, 'error');
    }

    function renderCart() {
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartTotalElement = document.getElementById('cart-total');
        const cartFooter = document.getElementById('cart-footer');
        
        if (!cartItemsContainer || !cartTotalElement || !cartFooter) return;

        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío.</p>';
            cartTotalElement.textContent = 'COP 0';
            cartFooter.style.display = 'none';
            return;
        }

        let total = 0;
        cartFooter.style.display = 'block';

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name} (${item.quantity})</h4>
                    <p>COP ${item.price.toLocaleString('es-CO')} c/u</p>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})" aria-label="Eliminar ${item.name}">
                    &times;
                </button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        cartTotalElement.textContent = `COP ${total.toLocaleString('es-CO')}`;
    }

    // ------------------------------------------------------------------
    // 3. LÓGICA DE WHATSAPP
    // ------------------------------------------------------------------
    
    function formatWhatsAppMessage(items) {
        let message = `¡Hola ${STORE_NAME}! Me gustaría realizar el siguiente pedido:\n\n`;
        let total = 0;

        items.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            message += `${index + 1}. ${item.name} (x${item.quantity}) - COP ${itemTotal.toLocaleString('es-CO')}\n`;
        });
        
        message += `\n*TOTAL ESTIMADO: COP ${total.toLocaleString('es-CO')}*`;
        message += "\n\nPor favor, confirmen disponibilidad y el proceso de pago. ¡Gracias!";
        
        return message;
    }

    function handleWhatsAppCheckout() {
        if (cart.length === 0) {
            showToast("El carrito está vacío. Agrega productos antes de comprar.", 'error');
            return;
        }

        const message = formatWhatsAppMessage(cart);
        const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
        
        // Limpiar carrito después de generar el enlace de compra
        cart = [];
        saveCart();
        document.getElementById('cart-modal').classList.remove('open');
        showToast("¡Pedido generado! Redireccionando a WhatsApp...", 'success');
        
        setTimeout(() => window.open(url, '_blank'), 1000);
    }
    
    function handleDirectWhatsAppBuy(name, price) {
        const message = `¡Hola ${STORE_NAME}! Me interesa comprar directamente el perfume: ${name} (Precio: ${price}).\n\nPor favor, confirmarme el proceso de pago y envío.`;
        const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
        showToast(`Comprando ${name}. Redireccionando a WhatsApp...`, 'success');
        setTimeout(() => window.open(url, '_blank'), 1000);
    }

    // Lógica del formulario de contacto (INDEX.HTML)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nombre = document.getElementById('nombre').value;
            const telefono = document.getElementById('telefono').value;
            const mensaje = document.getElementById('mensaje').value;

            // Simple validación de formato de teléfono (solo números)
            if (!/^\+?[0-9]{8,15}$/.test(telefono)) {
                showToast("Por favor, ingrese un número de teléfono válido.", 'error');
                return;
            }

            const customMessage = `Hola ${STORE_NAME}, mi nombre es ${nombre}. Mi número es ${telefono}. Mi consulta es: "${mensaje}"`;
            const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(customMessage)}`;
            
            showToast("Formulario enviado. Abriendo chat de WhatsApp...", 'success');
            setTimeout(() => window.open(url, '_blank'), 1000);
        });
    }

    // ------------------------------------------------------------------
    // 4. LÓGICA ESPECÍFICA POR PÁGINA
    // ------------------------------------------------------------------

    // Lógica de Carrusel (Solo INDEX.HTML)
    if (document.getElementById('banner-carousel')) {
        let currentSlide = 0;
        const slides = document.querySelectorAll('.carousel-slide');
        const totalSlides = slides.length;
        const carouselSlidesContainer = document.querySelector('.carousel-slides');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const dotsContainer = document.querySelector('.carousel-dots');
        let autoSlideInterval;

        function updateCarousel() {
            carouselSlidesContainer.style.transform = `translateX(${-currentSlide * 100}%)`;
            updateDots();
        }

        function updateDots() {
            dotsContainer.innerHTML = '';
            slides.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (index === currentSlide) {
                    dot.classList.add('active');
                }
                dot.addEventListener('click', () => {
                    currentSlide = index;
                    updateCarousel();
                    resetAutoSlide();
                });
                dotsContainer.appendChild(dot);
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateCarousel();
        }
        
        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            autoSlideInterval = setInterval(nextSlide, 5000); // Cambia cada 5 segundos
        }

        prevBtn.addEventListener('click', () => { prevSlide(); resetAutoSlide(); });
        nextBtn.addEventListener('click', () => { nextSlide(); resetAutoSlide(); });

        updateCarousel(); // Inicializar
        resetAutoSlide(); // Iniciar auto-slide
        
        // Renderizar las reseñas de ejemplo en Index
        const reviewData = [
            { name: "— Camilo T., Cliente Verificado", stars: 5, text: "Estaba buscando la Chrome Tradicional EDT por todas partes y la encontré aquí a un precio insuperable. Llegó sellada, totalmente original y la fragancia es perfecta. Me ahorré una buena cantidad comparado con almacenes de cadena."},

            { name: "— Miguel A.", stars: 5, text: "Excelente experiencia comprando mi Versace Pour Homme. Es una fragancia que proyecta mucha frescura y elegancia, y la botella que recibí de Esencia Jade es auténtica en todo sentido. La pedí un martes y me llegó el jueves perfectamente empacada. Los recomiendo por su seriedad y por tener precios tan competitivos en originales." },

            { name: "— Ricardo G", stars: 4, text: "Compro mi Armaf Club de Nuit Intense EDT en Esencia Jade porque sé que es 100% original. Es un perfume que me da mucha seguridad, y encontrarlo a este precio, con envío rápido y garantía de autenticidad, es clave. Llevo dos frascos comprados y el servicio siempre es de primera. Si buscan fragancias de alto impacto sin dudas, este es el lugar." },
        ];
        
        const reviewsSlider = document.querySelector('.reviews-slides');
        if (reviewsSlider) {
            reviewData.forEach(review => {
                const reviewElement = document.createElement('div');
                reviewElement.classList.add('review-card');
                reviewElement.innerHTML = `
                    <div class="review-header">
                        <p>${review.name}</p>
                        <div class="review-stars">${'★'.repeat(review.stars) + '☆'.repeat(5 - review.stars)}</div>
                    </div>
                    <p class="review-text">"${review.text}"</p>
                `;
                reviewsSlider.appendChild(reviewElement);
            });
        }
    }
    
    // Lógica del Catálogo (Solo CATALAGO.HTML)
    if (document.getElementById('catalog-grid')) {
        const catalogGrid = document.getElementById('catalog-grid');
        
        // Simplemente renderiza todos los productos de CATALOG_PRODUCTS
        CATALOG_PRODUCTS.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.setAttribute('data-name', product.name);
            productCard.innerHTML = `
                <img src="${product.img}" alt="Perfume ${product.name}" onerror="this.src='https://placehold.co/250x200/121212/ffffff?text=${product.name.replace(/ /g, '+')}';">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-price">COP ${product.price.toLocaleString('es-CO')}</p>
                    <button class="btn btn-primary" onclick="addToCart(${product.id})" aria-label="Añadir ${product.name} al carrito">
                        <svg viewBox="0 0 24 24" class="icon-svg" style="margin-right:0.5rem;"><path d="M17 18C17 19.1 16.1 20 15 20C13.9 20 13 19.1 13 18C13 16.9 13.9 16 15 16C16.1 16 17 16.9 17 18ZM1.5 2V4H3L6.6 11.59L5.26 14.16C5.04 14.54 4.93 15 4.93 15.5C4.93 16.32 5.6 17 6.42 17H18V15H6.42L7.17 13.59L16.2 11.82L19.5 5H6.21L5.8 4H1.5M19 18C19 19.1 18.1 20 17 20C15.9 20 15 19.1 15 18C15 16.9 15.9 16 17 16C18.1 16 19 16.9 19 18Z"/></svg>
                        Añadir al Carrito
                    </button>
                    <button class="btn btn-whatsapp whatsapp-buy-btn" data-product-name="${product.name}" data-product-price="COP ${product.price.toLocaleString('es-CO')}" aria-label="Comprar ${product.name} por WhatsApp">
                        Comprar por WhatsApp
                    </button>
                </div>
            `;
            catalogGrid.appendChild(productCard);
        });
        
        // Reaplicar listener a los nuevos botones de WhatsApp
        catalogGrid.querySelectorAll('.whatsapp-buy-btn').forEach(button => {
            button.addEventListener('click', function() {
                const name = this.getAttribute('data-product-name');
                const price = this.getAttribute('data-product-price');
                handleDirectWhatsAppBuy(name, price);
            });
        });
    }

    // Lógica de Galería (Solo GALERIA.HTML)
    if (document.getElementById('gallery-grid')) {
        const galleryItems = document.querySelectorAll('.gallery-item');
        const lightboxModal = document.getElementById('lightbox-modal');
        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxClose = document.getElementById('lightbox-close');
        const lightboxPrev = document.getElementById('lightbox-prev');
        const lightboxNext = document.getElementById('lightbox-next');
        let currentIndex = 0;
        
        const galleryImages = [
            'img/galeria/foto1.png',
            'img/galeria/foto2.png',
            'img/galeria/foto3.png',
            'img/galeria/foto4.png',
            'img/galeria/foto5.png',
            'img/galeria/foto6.png',
            'img/galeria/foto7.png',
            'img/galeria/foto8.png',
            'img/galeria/foto9.png',
            'img/galeria/foto10.png',
        ];

        function openLightbox(index) {
            currentIndex = index;
            lightboxImage.src = galleryImages[currentIndex];
            lightboxModal.classList.add('is-open');
        }

        function closeLightbox() {
            lightboxModal.classList.remove('is-open');
        }

        function navigateLightbox(direction) {
            currentIndex = (currentIndex + direction + galleryImages.length) % galleryImages.length;
            lightboxImage.src = galleryImages[currentIndex];
        }

        galleryItems.forEach((item, index) => {
            // Reemplazar placeholders con las imágenes reales
            item.querySelector('img').src = galleryImages[index];
            item.addEventListener('click', () => openLightbox(index));
        });

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightboxPrev) lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
        if (lightboxNext) lightboxNext.addEventListener('click', () => navigateLightbox(1));
        
        // Cerrar al hacer clic en el fondo oscuro
        if (lightboxModal) {
            lightboxModal.addEventListener('click', (e) => {
                if (e.target === lightboxModal) {
                    closeLightbox();
                }
            });
        }
    }

    // Lógica del Toast (Notificaciones)
    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast-message');
        if (!toast) return;
        
        toast.textContent = message;
        
        // Limpiar clases de tipo anterior
        toast.style.backgroundColor = type === 'success' ? '#128c7e' : (type === 'error' ? '#cc0000' : '#121212');

        toast.classList.add('show');
        setTimeout(function(){ toast.classList.remove('show'); }, 3000);
    }
    window.showToast = showToast; // Hacerla global para usar en onclicks
    
    // Inicializar el contador del carrito al cargar
    updateCartCount();
});

// Nota: La función renderCart se llama desde el cart-button listener, por lo que no necesita ser llamada aquí.
// Pero las funciones addToCart/removeFromCart se hacen globales para ser usadas en el HTML.