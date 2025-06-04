// Variables globales
let carritoItems = []
let totalCarrito = 0
let descuentoAplicado = 0
let subtotalCarrito = 0

// Función para cargar el carrito
async function cargarCarrito() {
    try {
        const user = getUser()
        if (!user) {
            mostrarCarritoVacio()
            return
        }

        const token = getToken()
        const response = await fetch(`https://tfgpriv.onrender.com/api/carrito/${user.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error("Error al cargar el carrito")
        }

        carritoItems = await response.json()
        console.log("Items del carrito cargados:", carritoItems)

        if (carritoItems.length === 0) {
            mostrarCarritoVacio()
        } else {
            mostrarCarrito()
            calcularTotales()
        }
    } catch (error) {
        console.error("Error:", error)
        mostrarCarritoVacio()
    }
}

// Función para mostrar el carrito
function mostrarCarrito() {
    const carritoContainer = document.getElementById("carrito-items")
    const carritoVacio = document.getElementById("carrito-vacio")

    carritoVacio.classList.add("d-none")
    carritoContainer.classList.remove("d-none")

    let html = ""

    carritoItems.forEach((item, index) => {
        // Calcular subtotal y descuento por item
        const subtotalItem = item.subtotal || item.vehiculo.precio * item.dias
        const descuentoItem = item.descuentoAplicado || 0
        const totalItem = item.totalConDescuento || subtotalItem - descuentoItem

        html += `
      <div class="cart-item" data-item-id="${item.id}" style="animation-delay: ${index * 0.1}s;">
        <div class="row align-items-center">
          <div class="col-md-3">
            <img src="${item.vehiculo.imagen || "/placeholder.svg?height=200&width=300"}" 
                 class="cart-item-img" alt="${item.vehiculo.marca} ${item.vehiculo.modelo}">
          </div>
          <div class="col-md-6">
            <h5 class="cart-item-title">${item.vehiculo.marca} ${item.vehiculo.modelo}</h5>
            <p class="cart-item-details">
              <i class="bi bi-calendar3"></i> ${item.dias} día${item.dias > 1 ? "s" : ""}
              <br>
              <i class="bi bi-geo-alt"></i> Matrícula: ${item.vehiculo.matricula}
              <br>
              <i class="bi bi-currency-euro"></i> ${item.vehiculo.precio.toFixed(2)}€/día
            </p>
            ${
            descuentoItem > 0
                ? `
              <div class="discount-info">
                <i class="bi bi-tag-fill text-success"></i>
                <span class="text-success">Descuento aplicado: -${descuentoItem.toFixed(2)}€</span>
              </div>
            `
                : ""
        }
          </div>
          <div class="col-md-3 text-end">
            <div class="cart-item-price">
              ${
            descuentoItem > 0
                ? `
                <div class="original-price">${subtotalItem.toFixed(2)}€</div>
                <div class="discounted-price">${totalItem.toFixed(2)}€</div>
              `
                : `
                <div class="final-price">${totalItem.toFixed(2)}€</div>
              `
        }
            </div>
            <button class="btn btn-outline-danger btn-sm mt-2" onclick="eliminarDelCarrito(${item.id})">
              <i class="bi bi-trash"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    `
    })

    carritoContainer.innerHTML = html
}

// Función para calcular totales
function calcularTotales() {
    const user = getUser()

    // Calcular subtotal
    subtotalCarrito = carritoItems.reduce((total, item) => {
        return total + (item.subtotal || item.vehiculo.precio * item.dias)
    }, 0)

    // Calcular descuento total
    descuentoAplicado = carritoItems.reduce((total, item) => {
        return total + (item.descuentoAplicado || 0)
    }, 0)

    // Calcular total final
    totalCarrito = carritoItems.reduce((total, item) => {
        return total + (item.totalConDescuento || item.subtotal - item.descuentoAplicado)
    }, 0)

    // Mostrar información del usuario y descuento
    const userInfo = document.getElementById("user-discount-info")
    if (userInfo && user) {
        const nivelInfo = getNivelInfo(user.nivelUsuario || "BRONCE")
        const descuentoPorcentaje = user.descuentoPorcentaje || 0

        userInfo.innerHTML = `
      <div class="user-level-info">
        <div class="level-badge" style="background: ${nivelInfo.gradient};">
          <i class="bi bi-star-fill"></i>
          <span>Nivel ${nivelInfo.nombre}</span>
        </div>
        ${
            descuentoPorcentaje > 0
                ? `
          <div class="discount-badge">
            <i class="bi bi-percent"></i>
            <span>${descuentoPorcentaje}% de descuento aplicado</span>
          </div>
        `
                : ""
        }
      </div>
    `
    }

    // Actualizar resumen
    actualizarResumen()
}

// Función para actualizar el resumen
function actualizarResumen() {
    document.getElementById("subtotal").textContent = `${subtotalCarrito.toFixed(2)}€`

    const descuentoElement = document.getElementById("descuento")
    const descuentoRow = descuentoElement.closest("tr")

    if (descuentoAplicado > 0) {
        descuentoElement.textContent = `-${descuentoAplicado.toFixed(2)}€`
        descuentoRow.style.display = "table-row"
    } else {
        descuentoRow.style.display = "none"
    }

    const iva = totalCarrito * 0.21
    document.getElementById("iva").textContent = `${iva.toFixed(2)}€`

    const totalFinal = totalCarrito + iva
    document.getElementById("total").textContent = `${totalFinal.toFixed(2)}€`

    // Actualizar contador del carrito en navbar
    actualizarContadorCarrito()
}

// Función para mostrar carrito vacío
function mostrarCarritoVacio() {
    const carritoContainer = document.getElementById("carrito-items")
    const carritoVacio = document.getElementById("carrito-vacio")

    carritoContainer.classList.add("d-none")
    carritoVacio.classList.remove("d-none")

    // Limpiar totales
    subtotalCarrito = 0
    descuentoAplicado = 0
    totalCarrito = 0
    actualizarResumen()
}

// Función para eliminar item del carrito
async function eliminarDelCarrito(itemId) {
    try {
        const token = getToken()
        const response = await fetch(`https://tfgpriv.onrender.com/api/carrito/item/${itemId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error("Error al eliminar el item")
        }

        showToast("Éxito", "Vehículo eliminado del carrito", "success")
        await cargarCarrito()
    } catch (error) {
        console.error("Error:", error)
        showToast("Error", "Error al eliminar el vehículo del carrito", "error")
    }
}

// Función para proceder al pago
async function procederAlPago() {
    if (carritoItems.length === 0) {
        showToast("Error", "El carrito está vacío", "error")
        return
    }

    try {
        const user = getUser()
        const token = getToken()

        // Confirmar el alquiler
        const response = await fetch(`https://tfgpriv.onrender.com/api/carrito/${user.id}/confirmar`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error("Error al confirmar el alquiler")
        }

        // Guardar datos del pago para la página de confirmación
        const paymentData = {
            subtotal: subtotalCarrito,
            descuento: descuentoAplicado,
            iva: totalCarrito * 0.21,
            total: totalCarrito + totalCarrito * 0.21,
            vehicles: carritoItems.map((item) => ({
                marca: item.vehiculo.marca,
                modelo: item.vehiculo.modelo,
                matricula: item.vehiculo.matricula,
                dias: item.dias,
                precioPorDia: item.vehiculo.precio,
                total: item.totalConDescuento || item.subtotal,
                fechaInicio: item.fechaInicio,
                fechaFin: item.fechaFin,
            })),
            paymentMethod: "card",
        }

        localStorage.setItem("lastPayment", JSON.stringify(paymentData))

        showToast("Éxito", "Alquiler confirmado con éxito", "success")

        // Redirigir a la página de confirmación
        setTimeout(() => {
            window.location.href = "confirmacion.html"
        }, 1500)
    } catch (error) {
        console.error("Error:", error)
        showToast("Error", error.message || "Error al procesar el pago", "error")
    }
}

// Función para actualizar contador del carrito
function actualizarContadorCarrito() {
    const contador = document.getElementById("cart-count")
    if (contador) {
        contador.textContent = carritoItems.length
        contador.style.display = carritoItems.length > 0 ? "inline" : "none"
    }
}

// Función para obtener información del nivel
function getNivelInfo(nivel) {
    const niveles = {
        BRONCE: {
            nombre: "Bronce",
            color: "#CD7F32",
            gradient: "linear-gradient(135deg, #CD7F32, #A0522D)",
        },
        PLATA: {
            nombre: "Plata",
            color: "#C0C0C0",
            gradient: "linear-gradient(135deg, #C0C0C0, #A8A8A8)",
        },
        ORO: {
            nombre: "Oro",
            color: "#FFD700",
            gradient: "linear-gradient(135deg, #FFD700, #FFA500)",
        },
        DIAMANTE: {
            nombre: "Diamante",
            color: "#00BFFF",
            gradient: "linear-gradient(135deg, #00BFFF, #87CEEB)",
        },
    }
    return niveles[nivel] || niveles["BRONCE"]
}

// Funciones de utilidad
function getUser() {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
}

function getToken() {
    return localStorage.getItem("token")
}

function showToast(title, message, type = "success") {
    const toast = document.getElementById("toast")
    const toastTitle = document.getElementById("toastTitle")
    const toastMessage = document.getElementById("toastMessage")

    if (!toast || !toastTitle || !toastMessage) return

    toastTitle.textContent = title
    toastMessage.textContent = message

    toast.classList.remove("bg-success", "bg-danger", "bg-warning", "text-white")
    if (type === "success") {
        toast.classList.add("bg-success", "text-white")
    } else if (type === "error") {
        toast.classList.add("bg-danger", "text-white")
    } else if (type === "warning") {
        toast.classList.add("bg-warning")
    }

    const bsToast = new bootstrap.Toast(toast)
    bsToast.show()
}

// Cargar carrito al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    const cartItemsContainer = document.getElementById("cart-items")
    const cartLoading = document.getElementById("cart-loading")
    const cartContent = document.getElementById("cart-content")
    const emptyCart = document.getElementById("empty-message")
    const cartSubtotal = document.getElementById("cart-subtotal")
    const cartTax = document.getElementById("cart-tax")
    const cartTotal = document.getElementById("cart-total")
    const checkoutBtn = document.getElementById("checkout-btn")

    // Obtener el ID del usuario del localStorage (si está autenticado)
    const usuarioId = obtenerUsuarioId()

    // Cargar carrito desde el backend
    let carrito = await loadCart(usuarioId)

    function actualizarCarrito() {
        if (!carrito || carrito.length === 0) {
            cartLoading.classList.add("d-none")
            emptyCart.classList.remove("d-none")
            cartContent.classList.add("d-none")
        } else {
            cartLoading.classList.add("d-none")
            emptyCart.classList.add("d-none")
            cartContent.classList.remove("d-none")

            cartItemsContainer.innerHTML = ""
            let subtotal = 0

            carrito.forEach((item) => {
                // Adaptación para manejar la estructura de datos que viene del backend
                const nombre = item.vehiculoMarca + " " + item.vehiculoModelo
                const dias = item.dias || 0
                const precioUnitario = item.precioPorDia || 0
                const totalItem = item.subtotal || dias * precioUnitario

                // Formatear fechas si existen
                let fechasText = ""
                if (item.fechaInicio && item.fechaFin) {
                    const fechaInicio = new Date(item.fechaInicio)
                    const fechaFin = new Date(item.fechaFin)
                    fechasText = `<small class="text-muted d-block">Del ${fechaInicio.toLocaleDateString()} al ${fechaFin.toLocaleDateString()}</small>`
                }

                // Crear elemento para cada item del carrito
                const itemElement = document.createElement("div")
                itemElement.classList.add(
                    "d-flex",
                    "justify-content-between",
                    "align-items-center",
                    "mb-3",
                    "pb-3",
                    "border-bottom",
                )
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
            `

                // Agregar evento para eliminar item
                const deleteBtn = itemElement.querySelector("button")
                deleteBtn.addEventListener("click", async () => {
                    await eliminarDelCarrito(item.id)
                    carrito = await loadCart(usuarioId)
                    actualizarCarrito()
                })

                cartItemsContainer.appendChild(itemElement)
                subtotal += totalItem
            })

            // Calcular IVA y total
            const iva = subtotal * 0.21
            const total = subtotal + iva

            // Actualizar los elementos del DOM
            cartSubtotal.textContent = `${subtotal.toFixed(2)}€`
            cartTax.textContent = `${iva.toFixed(2)}€`
            cartTotal.textContent = `${total.toFixed(2)}€`
        }
    }

    // Función para obtener el ID del usuario autenticado
    function obtenerUsuarioId() {
        const user = localStorage.getItem("user")
        if (user) {
            try {
                const userData = JSON.parse(user)
                return userData.id
            } catch (error) {
                console.error("Error al parsear datos del usuario:", error)
                return null
            }
        }
        return null
    }

    // Función para cargar el carrito desde el backend
    async function loadCart(usuarioId) {
        try {
            if (!usuarioId) {
                // Si no hay usuario autenticado, mostrar carrito vacío
                return []
            }

            const token = localStorage.getItem("token")
            if (!token) {
                return []
            }

            const response = await fetch(`https://tfgpriv.onrender.com/api/carrito/${usuarioId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) throw new Error("No se pudo cargar el carrito")
            return await response.json()
        } catch (error) {
            console.error("Error al cargar el carrito:", error)
            showToast("Error", "No se pudo cargar el carrito", "error")
            return []
        }
    }

    // Función para eliminar un item del carrito
    async function eliminarDelCarrito(itemId) {
        try {
            const token = localStorage.getItem("token")
            if (!token) {
                showToast("Error", "Debes iniciar sesión", "error")
                return false
            }

            const response = await fetch(`https://tfgpriv.onrender.com/api/carrito/item/${itemId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) throw new Error("No se pudo eliminar el item")

            showToast("Éxito", "Item eliminado del carrito", "success")
            return true
        } catch (error) {
            console.error("Error al eliminar item:", error)
            showToast("Error", "No se pudo eliminar el item", "error")
            return false
        }
    }

    // Función para mostrar notificaciones
    function showToast(title, message, type = "success") {
        // Crear toast si no existe
        let toast = document.getElementById("toast")
        if (!toast) {
            const toastContainer = document.createElement("div")
            toastContainer.className = "position-fixed bottom-0 end-0 p-3"
            toastContainer.style.zIndex = "11"
            toastContainer.innerHTML = `
                <div id="toast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header">
                        <strong class="me-auto" id="toastTitle">Notificación</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Cerrar"></button>
                    </div>
                    <div class="toast-body" id="toastMessage"></div>
                </div>
            `
            document.body.appendChild(toastContainer)
            toast = document.getElementById("toast")
        }

        const toastTitle = document.getElementById("toastTitle")
        const toastMessage = document.getElementById("toastMessage")

        if (!toast || !toastTitle || !toastMessage) return

        toastTitle.textContent = title
        toastMessage.textContent = message

        // Aplicar clase según el tipo
        toast.classList.remove("bg-success", "bg-danger", "bg-warning", "text-white")
        if (type === "success") {
            toast.classList.add("bg-success", "text-white")
        } else if (type === "error") {
            toast.classList.add("bg-danger", "text-white")
        } else if (type === "warning") {
            toast.classList.add("bg-warning")
        }

        const bsToast = new bootstrap.Toast(toast)
        bsToast.show()
    }

    // Comprobar si el usuario está autenticado
    function isAuthenticated() {
        return localStorage.getItem("token") !== null
    }

    // Función para mostrar el modal de pago
    function mostrarModalPago() {
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        const subtotal = carrito.reduce((total, item) => total + (item.subtotal || item.precioPorDia * item.dias), 0)
        const descuento = carrito.reduce((total, item) => total + (item.descuentoAplicado || 0), 0)
        const iva = (subtotal - descuento) * 0.21
        const total = subtotal - descuento + iva

        // Crear modal de pago
        const modalHTML = `
            <div class="modal fade" id="paymentModal" tabindex="-1" aria-labelledby="paymentModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="paymentModalLabel">
                                <i class="bi bi-credit-card me-2"></i>Completar Pago
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Resumen del pedido -->
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <h6 class="text-primary mb-3">Resumen del Pedido</h6>
                                    <div class="bg-light p-3 rounded">
                                        <div class="d-flex justify-content-between mb-2">
                                            <span>Subtotal:</span>
                                            <span>${subtotal.toFixed(2)}€</span>
                                        </div>
                                        ${
            descuento > 0
                ? `
                                        <div class="d-flex justify-content-between mb-2 text-success">
                                            <span>Descuento ${user?.nivelUsuario}:</span>
                                            <span>-${descuento.toFixed(2)}€</span>
                                        </div>
                                        `
                : ""
        }
                                        <div class="d-flex justify-content-between mb-2">
                                            <span>IVA (21%):</span>
                                            <span>${iva.toFixed(2)}€</span>
                                        </div>
                                        <hr>
                                        <div class="d-flex justify-content-between fw-bold fs-5">
                                            <span>Total:</span>
                                            <span class="text-success">${total.toFixed(2)}€</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-primary mb-3">Información del Cliente</h6>
                                    <div class="bg-light p-3 rounded">
                                        <p class="mb-1"><strong>Nombre:</strong> ${user?.nombre || "No disponible"}</p>
                                        <p class="mb-1"><strong>Email:</strong> ${user?.email || "No disponible"}</p>
                                        <p class="mb-0"><strong>Nivel:</strong> 
                                            <span class="badge bg-primary">${user?.nivelUsuario || "BRONCE"}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Métodos de pago -->
                            <h6 class="text-primary mb-3">Método de Pago</h6>
                            <div class="payment-methods mb-4">
                                <div class="form-check payment-option active" data-method="card">
                                    <input class="form-check-input" type="radio" name="paymentMethod" id="cardPayment" value="card" checked>
                                    <label class="form-check-label w-100" for="cardPayment">
                                        <div class="d-flex align-items-center">
                                            <div class="payment-icon me-3">
                                                <i class="bi bi-credit-card"></i>
                                            </div>
                                            <div>
                                                <h6 class="mb-0">Tarjeta de Crédito/Débito</h6>
                                                <small class="text-muted">Visa, Mastercard, American Express</small>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                                <div class="form-check payment-option" data-method="paypal">
                                    <input class="form-check-input" type="radio" name="paymentMethod" id="paypalPayment" value="paypal">
                                    <label class="form-check-label w-100" for="paypalPayment">
                                        <div class="d-flex align-items-center">
                                            <div class="payment-icon me-3">
                                                <i class="bi bi-paypal"></i>
                                            </div>
                                            <div>
                                                <h6 class="mb-0">PayPal</h6>
                                                <small class="text-muted">Pago seguro con PayPal</small>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <!-- Formulario de tarjeta -->
                            <div id="cardForm" class="payment-form">
                                <h6 class="text-primary mb-3">Datos de la Tarjeta</h6>
                                <div class="row">
                                    <div class="col-12 mb-3">
                                        <label for="cardNumber" class="form-label">Número de Tarjeta</label>
                                        <input type="text" class="form-control" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="cardExpiry" class="form-label">Fecha de Expiración</label>
                                        <input type="text" class="form-control" id="cardExpiry" placeholder="MM/AA" maxlength="5">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="cardCVC" class="form-label">CVC</label>
                                        <input type="text" class="form-control" id="cardCVC" placeholder="123" maxlength="4">
                                    </div>
                                    <div class="col-12 mb-3">
                                        <label for="cardName" class="form-label">Nombre del Titular</label>
                                        <input type="text" class="form-control" id="cardName" placeholder="Nombre completo" value="${user?.nombre || ""}">
                                    </div>
                                </div>
                            </div>

                            <!-- Formulario de PayPal -->
                            <div id="paypalForm" class="payment-form d-none">
                                <div class="text-center p-4">
                                    <i class="bi bi-paypal text-primary" style="font-size: 3rem;"></i>
                                    <h5 class="mt-3">Pago con PayPal</h5>
                                    <p class="text-muted">Usa tu cuenta de PayPal para completar el pago</p>
                                    <div class="mb-3">
                                        <label for="paypalEmail" class="form-label">Email de PayPal</label>
                                        <input type="email" class="form-control" id="paypalEmail" placeholder="tu-email@paypal.com" value="${user?.email || ""}">
                                    </div>
                                    <div class="mb-3">
                                        <label for="paypalPassword" class="form-label">Contraseña de PayPal</label>
                                        <input type="password" class="form-control" id="paypalPassword" placeholder="Tu contraseña de PayPal">
                                    </div>
                                    <div class="alert alert-info">
                                        <i class="bi bi-info-circle me-2"></i>
                                        <small>Para esta demo, puedes usar cualquier email y contraseña</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success btn-lg" id="processPaymentBtn">
                                <i class="bi bi-lock-fill me-2"></i>Pagar ${total.toFixed(2)}€
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `

        // Agregar modal al DOM
        document.body.insertAdjacentHTML("beforeend", modalHTML)

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById("paymentModal"))
        modal.show()

        // Configurar eventos del modal
        configurarEventosModalPago(total, subtotal, descuento, iva)
    }

    // Función para configurar eventos del modal de pago
    function configurarEventosModalPago(total, subtotal, descuento, iva) {
        // Cambio de método de pago
        document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
            radio.addEventListener("change", function () {
                document.querySelectorAll(".payment-option").forEach((option) => {
                    option.classList.remove("active")
                })
                this.closest(".payment-option").classList.add("active")

                if (this.value === "card") {
                    document.getElementById("cardForm").classList.remove("d-none")
                    document.getElementById("paypalForm").classList.add("d-none")
                } else {
                    document.getElementById("cardForm").classList.add("d-none")
                    document.getElementById("paypalForm").classList.remove("d-none")
                }
            })
        })

        // Formateo de número de tarjeta
        const cardNumberInput = document.getElementById("cardNumber")
        if (cardNumberInput) {
            cardNumberInput.addEventListener("input", (e) => {
                const value = e.target.value.replace(/\s/g, "").replace(/[^0-9]/gi, "")
                const formattedValue = value.match(/.{1,4}/g)?.join(" ") || value
                e.target.value = formattedValue
            })
        }

        // Formateo de fecha de expiración
        const cardExpiryInput = document.getElementById("cardExpiry")
        if (cardExpiryInput) {
            cardExpiryInput.addEventListener("input", (e) => {
                let value = e.target.value.replace(/\D/g, "")
                if (value.length >= 2) {
                    value = value.substring(0, 2) + "/" + value.substring(2, 4)
                }
                e.target.value = value
            })
        }

        // Procesar pago
        document.getElementById("processPaymentBtn").addEventListener("click", async function () {
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value

            if (paymentMethod === "card") {
                const cardNumber = document.getElementById("cardNumber").value
                const cardExpiry = document.getElementById("cardExpiry").value
                const cardCVC = document.getElementById("cardCVC").value
                const cardName = document.getElementById("cardName").value

                if (!cardNumber || !cardExpiry || !cardCVC || !cardName) {
                    showToast("Error", "Por favor completa todos los campos de la tarjeta", "error")
                    return
                }
            } else if (paymentMethod === "paypal") {
                const paypalEmail = document.getElementById("paypalEmail").value
                const paypalPassword = document.getElementById("paypalPassword").value

                if (!paypalEmail || !paypalPassword) {
                    showToast("Error", "Por favor completa todos los campos de PayPal", "error")
                    return
                }
            }

            // Simular procesamiento de pago
            this.disabled = true
            this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...'

            try {
                // Simular delay de procesamiento
                await new Promise((resolve) => setTimeout(resolve, 2000))

                // Confirmar el alquiler en el backend
                const user = JSON.parse(localStorage.getItem("user"))
                const token = localStorage.getItem("token")

                const response = await fetch(`https://tfgpriv.onrender.com/api/carrito/confirmar/${user.id}`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (!response.ok) throw new Error("Error al confirmar el alquiler")

                // Guardar datos del pago para la confirmación
                const paymentData = {
                    subtotal: subtotal,
                    descuento: descuento,
                    iva: iva,
                    total: total,
                    vehicles: carrito.map((item) => ({
                        marca: item.vehiculoMarca,
                        modelo: item.vehiculoModelo,
                        matricula: item.vehiculoMatricula || "No disponible",
                        dias: item.dias,
                        precioPorDia: item.precioPorDia,
                        total: item.subtotal,
                        fechaInicio: item.fechaInicio,
                        fechaFin: item.fechaFin,
                        imagen: item.vehiculoImagen || "/placeholder.svg?height=100&width=150",
                    })),
                    paymentMethod: paymentMethod,
                    cardLast4: paymentMethod === "card" ? document.getElementById("cardNumber").value.slice(-4) : null,
                    paypalEmail: paymentMethod === "paypal" ? document.getElementById("paypalEmail").value : null,
                }

                localStorage.setItem("lastPayment", JSON.stringify(paymentData))

                showToast("Éxito", "¡Pago procesado exitosamente!", "success")

                // Cerrar modal y redirigir
                bootstrap.Modal.getInstance(document.getElementById("paymentModal")).hide()

                setTimeout(() => {
                    window.location.href = "confirmacion.html"
                }, 1500)
            } catch (error) {
                console.error("Error:", error)
                showToast("Error", "Error al procesar el pago", "error")
                this.disabled = false
                this.innerHTML = `<i class="bi bi-lock-fill me-2"></i>Pagar ${total.toFixed(2)}€`
            }
        })

        // Limpiar modal al cerrar
        document.getElementById("paymentModal").addEventListener("hidden.bs.modal", function () {
            this.remove()
        })
    }

    // Evento para el botón de checkout
    checkoutBtn.addEventListener("click", async () => {
        if (!isAuthenticated()) {
            // Guardar la URL actual para redirigir después del login
            sessionStorage.setItem("redirectAfterLogin", window.location.href)

            showToast("Información", "Debes iniciar sesión para completar el alquiler", "warning")
            setTimeout(() => {
                window.location.href = "index.html"
            }, 2000)
            return
        }

        if (!carrito || carrito.length === 0) {
            showToast("Error", "Tu carrito está vacío", "error")
            return
        }

        // Mostrar modal de pago
        mostrarModalPago()
    })

    // Verificar autenticación al cargar la página
    if (!isAuthenticated()) {
        showToast("Información", "Debes iniciar sesión para ver tu carrito", "warning")

        // Redirigir al inicio si no está autenticado
        setTimeout(() => {
            window.location.href = "index.html"
        }, 3000)
    }

    // Actualización inicial del carrito
    actualizarCarrito()
})
