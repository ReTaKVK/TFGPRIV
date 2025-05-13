document.addEventListener('DOMContentLoaded', async () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartLoading = document.getElementById('cart-loading');
    const cartContent = document.getElementById('cart-content');
    const emptyCart = document.getElementById('empty-cart');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTax = document.getElementById('cart-tax');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Obtener el ID del usuario del localStorage (si está autenticado)
    const usuarioId = obtenerUsuarioId();

    // Cargar carrito desde el backend
    let carrito = await loadCart(usuarioId);

    function actualizarCarrito() {
        if (!carrito || carrito.length === 0) {
            cartLoading.classList.add('d-none');
            emptyCart.classList.remove('d-none');
            cartContent.classList.add('d-none');
        } else {
            cartLoading.classList.add('d-none');
            emptyCart.classList.add('d-none');
            cartContent.classList.remove('d-none');

            cartItemsContainer.innerHTML = '';
            let subtotal = 0;

            carrito.forEach(item => {
                // Adaptación para manejar la estructura de datos que viene del backend
                const nombre = item.vehiculoMarca + " " + item.vehiculoModelo;
                const dias = item.dias || 0;
                const precioUnitario = item.precioPorDia || 0;
                const totalItem = item.subtotal || (dias * precioUnitario);

                // Formatear fechas si existen
                let fechasText = "";
                if (item.fechaInicio && item.fechaFin) {
                    const fechaInicio = new Date(item.fechaInicio);
                    const fechaFin = new Date(item.fechaFin);
                    fechasText = `<small class="text-muted d-block">Del ${fechaInicio.toLocaleDateString()} al ${fechaFin.toLocaleDateString()}</small>`;
                }

                // Crear elemento para cada item del carrito
                const itemElement = document.createElement('div');
                itemElement.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-3', 'pb-3', 'border-bottom');
                itemElement.innerHTML = `
                <div>
                    <h6 class="mb-0">${nombre}</h6>
                    <small class="text-muted d-block">${dias} días x ${precioUnitario.toFixed(2)}€</small>
                    ${fechasText}
                </div>
                <div class="d-flex align-items-center">
                    <span class="fw-bold me-3">${totalItem.toFixed(2)}€</span>
                    <button class="btn btn-sm btn-outline-danger" data-id="${item.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;

                // Agregar evento para eliminar item
                const deleteBtn = itemElement.querySelector('button');
                deleteBtn.addEventListener('click', async () => {
                    await eliminarDelCarrito(item.id);
                    carrito = await loadCart(usuarioId);
                    actualizarCarrito();
                });

                cartItemsContainer.appendChild(itemElement);
                subtotal += totalItem;
            });

            // Calcular IVA y total
            const iva = subtotal * 0.21;
            const total = subtotal + iva;

            // Actualizar los elementos del DOM
            cartSubtotal.textContent = `${subtotal.toFixed(2)}€`;
            cartTax.textContent = `${iva.toFixed(2)}€`;
            cartTotal.textContent = `${total.toFixed(2)}€`;
        }
    }

    // Función para obtener el ID del usuario autenticado
    function obtenerUsuarioId() {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                return userData.id;
            } catch (error) {
                console.error('Error al parsear datos del usuario:', error);
                return null;
            }
        }
        return null;
    }

    // Función para cargar el carrito desde el backend
    async function loadCart(usuarioId) {
        try {
            if (!usuarioId) {
                // Si no hay usuario autenticado, mostrar carrito vacío
                return [];
            }

            const token = localStorage.getItem('token');
            if (!token) {
                return [];
            }

            const response = await fetch(`http://localhost:8080/api/carrito/${usuarioId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('No se pudo cargar el carrito');
            return await response.json();
        } catch (error) {
            console.error('Error al cargar el carrito:', error);
            showToast('Error', 'No se pudo cargar el carrito', 'error');
            return [];
        }
    }

    // Función para eliminar un item del carrito
    async function eliminarDelCarrito(itemId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Error', 'Debes iniciar sesión', 'error');
                return false;
            }

            const response = await fetch(`http://localhost:8080/api/carrito/item/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('No se pudo eliminar el item');

            showToast('Éxito', 'Item eliminado del carrito', 'success');
            return true;
        } catch (error) {
            console.error('Error al eliminar item:', error);
            showToast('Error', 'No se pudo eliminar el item', 'error');
            return false;
        }
    }

    // Función para mostrar notificaciones
    function showToast(title, message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');

        if (!toast || !toastTitle || !toastMessage) return;

        toastTitle.textContent = title;
        toastMessage.textContent = message;

        // Aplicar clase según el tipo
        toast.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'text-white');
        if (type === 'success') {
            toast.classList.add('bg-success', 'text-white');
        } else if (type === 'error') {
            toast.classList.add('bg-danger', 'text-white');
        } else if (type === 'warning') {
            toast.classList.add('bg-warning');
        }

        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }

    // Comprobar si el usuario está autenticado
    function isAuthenticated() {
        return localStorage.getItem('token') !== null;
    }

    // Evento para el botón de checkout
    checkoutBtn.addEventListener('click', async () => {
        if (!isAuthenticated()) {
            // Guardar la URL actual para redirigir después del login
            sessionStorage.setItem('redirectAfterLogin', window.location.href);

            // Mostrar el modal de login
            const loginModalElement = document.getElementById('loginModal');
            if (loginModalElement) {
                const loginModal = new bootstrap.Modal(loginModalElement);
                loginModal.show();
            }

            showToast('Información', 'Debes iniciar sesión para completar el alquiler', 'warning');
            return;
        }

        // Realizar la confirmación del alquiler
        try {
            const token = localStorage.getItem('token');
            const usuarioId = obtenerUsuarioId();

            if (!token || !usuarioId) {
                showToast('Error', 'Debes iniciar sesión', 'error');
                return;
            }

            const response = await fetch(`http://localhost:8080/api/carrito/confirmar/${usuarioId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al confirmar el alquiler');

            showToast('Éxito', '¡Alquiler completado con éxito!', 'success');

            // Vaciar el carrito y actualizar la UI
            carrito = [];
            actualizarCarrito();

            // Redirigir a la página de confirmación después de 2 segundos
            setTimeout(() => {
                window.location.href = 'confirmacion.html';
            }, 2000);
        } catch (error) {
            console.error('Error al confirmar el alquiler:', error);
            showToast('Error', 'No se pudo completar el alquiler', 'error');
        }
    });

    // Verificar autenticación al cargar la página
    if (!isAuthenticated()) {
        showToast('Información', 'Debes iniciar sesión para ver tu carrito', 'warning');

        // Redirigir al inicio si no está autenticado
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }

    // Actualización inicial del carrito
    actualizarCarrito();
});