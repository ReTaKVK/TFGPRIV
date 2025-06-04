// Función global para actualizar los botones de la navbar con sistema de niveles
window.updateNavbarButtons = () => {
    const navbarButtons = document.getElementById("navbarButtons")
    if (!navbarButtons) return

    if (isAuthenticated()) {
        const user = getUser()
        console.log("Actualizando navbar con usuario:", user)

        const isAdmin = user?.rol === "ADMIN"

        // Determinar el color y texto del nivel
        const nivelInfo = getNivelInfo(user?.nivelUsuario)
        const nivelClass = getUserNameClass(user?.nivelUsuario)

        console.log("Nivel del usuario:", user?.nivelUsuario, "Info:", nivelInfo)

        // Limpiar cualquier contenido existente
        navbarButtons.innerHTML = ""

        // Crear botón de carrito
        const cartButton = document.createElement("a")
        cartButton.href = "carrito.html"
        cartButton.className = "btn btn-outline-light me-2 position-relative cart-btn"
        cartButton.innerHTML = `
      <i class="bi bi-cart3"></i>
      <span class="d-none d-lg-inline ms-1">Carrito</span>
      <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="cart-badge" style="display: none;">
          0
      </span>
    `
        navbarButtons.appendChild(cartButton)

        // Crear botón de admin si es necesario
        if (isAdmin) {
            const adminButton = document.createElement("a")
            adminButton.href = "admin-premium.html"
            adminButton.className = "btn btn-danger me-2 admin-panel-btn"
            adminButton.innerHTML = `
        <i class="bi bi-shield-check"></i>
        <span class="d-none d-lg-inline ms-1">Panel Admin</span>
      `
            navbarButtons.appendChild(adminButton)
        }

        // Crear dropdown de usuario
        const userDropdown = document.createElement("div")
        userDropdown.className = "dropdown"
        userDropdown.innerHTML = `
      <button class="btn btn-light dropdown-toggle d-flex align-items-center user-dropdown-btn ${nivelClass}" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
          <div class="d-flex align-items-center">
              <div class="avatar-mini me-2" style="background: ${nivelInfo.gradient};">
                  ${getInitials(user?.nombre)}
              </div>
              <div class="d-none d-lg-block text-start">
                  <div class="fw-bold user-name-display">${user?.nombre || "Usuario"}</div>
                  <small class="level-indicator" style="color: ${nivelInfo.color};">
                      <i class="bi bi-star-fill"></i> ${nivelInfo.nombre}
                  </small>
              </div>
          </div>
      </button>
      <ul class="dropdown-menu dropdown-menu-end user-dropdown-menu" aria-labelledby="userDropdown">
          <li class="dropdown-header">
              <div class="text-center">
                  <div class="fw-bold user-name-display">${user?.nombre}</div>
                  <small class="text-muted">${user?.email}</small>
                  <div class="mt-1">
                      <span class="badge level-badge" style="background: ${nivelInfo.gradient}; color: white;">
                          <i class="bi bi-star-fill"></i> ${nivelInfo.nombre}
                      </span>
                      ${
            user?.descuentoPorcentaje > 0
                ? `
                          <span class="badge bg-success ms-1">
                              ${user.descuentoPorcentaje}% OFF
                          </span>
                      `
                : ""
        }
                  </div>
              </div>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
              <a class="dropdown-item" href="perfil-mejorado.html">
                  <i class="bi bi-person-circle me-2"></i>Mi Perfil
              </a>
          </li>
          <li>
              <a class="dropdown-item" href="perfil-mejorado.html#my-rentals" onclick="showRentalsTab()">
                  <i class="bi bi-car-front me-2"></i>Mis Alquileres
              </a>
          </li>
          <li>
              <a class="dropdown-item" href="carrito.html">
                  <i class="bi bi-cart me-2"></i>Mi Carrito
              </a>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
              <a class="dropdown-item text-danger" href="#" id="logout-link">
                  <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
              </a>
          </li>
      </ul>
    `
        navbarButtons.appendChild(userDropdown)

        // Agregar evento de cierre de sesión
        const logoutLink = document.getElementById("logout-link")
        if (logoutLink) {
            logoutLink.addEventListener("click", (e) => {
                e.preventDefault()
                logout()
            })
        }

        // Actualizar contador del carrito
        updateCartBadge()
    } else {
        // Crear botones de autenticación que usan el mismo sistema que el index
        navbarButtons.innerHTML = `
      <button class="btn btn-outline-light me-2 auth-btn" onclick="openAuthModal('login')">
          <i class="bi bi-box-arrow-in-right"></i>
          <span class="d-none d-lg-inline ms-1">Iniciar Sesión</span>
      </button>
      <button class="btn btn-light auth-btn" onclick="openAuthModal('register')">
          <i class="bi bi-person-plus"></i>
          <span class="d-none d-lg-inline ms-1">Registrarse</span>
      </button>
    `
    }
}

// Función unificada para abrir modales de autenticación
window.openAuthModal = (formType = "login") => {
    // Si estamos en index.html y existe el UltraAuthSystem
    if (window.authSystem && typeof window.authSystem.open === "function") {
        console.log("Usando UltraAuthSystem del index.html")
        window.authSystem.open(formType)
        return
    }

    // Si existe el authSystem global (desde index.html)
    if (window.authSystem) {
        console.log("Usando authSystem global")
        window.authSystem.open(formType)
        return
    }

    // Buscar si existe la función handleLogin o handleGetStarted del index
    if (formType === "login" && window.handleLogin) {
        console.log("Usando handleLogin del index")
        window.handleLogin()
        return
    }

    if (formType === "register" && window.handleGetStarted) {
        console.log("Usando handleGetStarted del index")
        window.handleGetStarted()
        return
    }

    // Si no hay UltraAuthSystem, intentar usar modales Bootstrap tradicionales
    const modalId = formType === "login" ? "loginModal" : "registerModal"
    const modal = document.getElementById(modalId)

    if (modal && window.bootstrap) {
        console.log("Usando modal Bootstrap:", modalId)
        const bsModal = new window.bootstrap.Modal(modal)
        bsModal.show()
        return
    }

    // Como último recurso, redirigir a index.html
    console.log("Redirigiendo a index.html")
    window.location.href = "index.html"
}

// Función para mostrar la pestaña de alquileres directamente
window.showRentalsTab = () => {
    // Si estamos en la página de perfil, activar la pestaña
    if (window.location.pathname.includes("perfil-mejorado.html")) {
        setTimeout(() => {
            const rentalsTab = document.querySelector('[data-bs-target="#my-rentals"]')
            if (rentalsTab) {
                rentalsTab.click()
            }
        }, 100)
    }
}

// Función para forzar actualización del usuario desde el servidor
window.forceUserUpdate = async () => {
    try {
        const user = getUser()
        if (!user) return

        const token = localStorage.getItem("token")
        if (!token) return

        console.log("Forzando actualización del usuario desde el servidor...")

        const response = await fetch(`https://tfgpriv.onrender.com/api/usuarios/${user.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (response.ok) {
            const usuarioActualizado = await response.json()
            console.log("Usuario actualizado desde servidor:", usuarioActualizado)

            localStorage.setItem("user", JSON.stringify(usuarioActualizado))

            // Actualizar navbar
            window.updateNavbarButtons()

            // Disparar evento personalizado para que otras partes de la app se actualicen
            window.dispatchEvent(new CustomEvent("userUpdated", { detail: usuarioActualizado }))

            return usuarioActualizado
        }
    } catch (error) {
        console.error("Error al forzar actualización del usuario:", error)
    }
}

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
            color: "#B9F2FF",
            gradient: "linear-gradient(135deg, #B9F2FF, #87CEEB)",
        },
    }
    return niveles[nivel] || niveles["BRONCE"]
}

function getUserNameClass(nivel) {
    const clases = {
        BRONCE: "user-level-bronce",
        PLATA: "user-level-plata",
        ORO: "user-level-oro",
        DIAMANTE: "user-level-diamante",
        ADMIN: "user-level-admin",
    }
    return clases[nivel] || clases["BRONCE"]
}

function getInitials(nombre) {
    if (!nombre) return "U"
    return nombre
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
}

async function updateCartBadge() {
    try {
        const user = getUser()
        if (!user) return

        const token = localStorage.getItem("token")
        if (!token) return

        const response = await fetch(`https://tfgpriv.onrender.com/api/carrito/${user.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (response.ok) {
            const carrito = await response.json()
            const cartBadge = document.getElementById("cart-badge")
            if (cartBadge) {
                if (carrito.length > 0) {
                    cartBadge.textContent = carrito.length
                    cartBadge.style.display = "block"
                } else {
                    cartBadge.style.display = "none"
                }
            }
        }
    } catch (error) {
        console.error("Error al actualizar badge del carrito:", error)
    }
}

function isAuthenticated() {
    return localStorage.getItem("token") !== null
}

function getUser() {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
}

function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.updateNavbarButtons()

    // Mostrar notificación si existe la función
    if (window.showToast) {
        window.showToast("Sesión cerrada", "Has cerrado sesión correctamente")
    }

    window.location.href = "index.html"
}

// Función para limpiar botones duplicados al cargar la página
function cleanDuplicateButtons() {
    // Eliminar cualquier botón de administración duplicado
    const adminButtons = document.querySelectorAll('a[href*="admin"]')

    if (adminButtons.length > 1) {
        // Mantener solo el botón con la clase admin-panel-btn
        adminButtons.forEach((btn) => {
            if (!btn.classList.contains("admin-panel-btn")) {
                btn.remove()
            }
        })
    }

    // Eliminar cualquier botón con texto "Administracion" o "Administración"
    document.querySelectorAll(".btn").forEach((btn) => {
        if (btn.textContent.includes("Administracion") || btn.textContent.includes("Administración")) {
            if (!btn.classList.contains("admin-panel-btn")) {
                btn.remove()
            }
        }
    })
}

// Inicializar cuando se carga el DOM
document.addEventListener("DOMContentLoaded", () => {
    // Detectar si estamos en la página de confirmación
    const isConfirmationPage = window.location.pathname.includes("confirmacion.html")

    // Si estamos en la página de confirmación, cargar el CSS específico
    if (isConfirmationPage) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "css/confirmacion-fixes.css"
        document.head.appendChild(link)
    }

    // Actualizar los botones de la navbar
    window.updateNavbarButtons()

    // Limpiar botones duplicados después de cargar
    setTimeout(cleanDuplicateButtons, 200)

    // Volver a limpiar después de un tiempo más largo para asegurarnos
    setTimeout(cleanDuplicateButtons, 500)
    setTimeout(cleanDuplicateButtons, 1000)

    // Actualizar cada 30 segundos el badge del carrito
    if (isAuthenticated()) {
        setInterval(updateCartBadge, 30000)
    }

    // Verificar si hay hash en la URL para mostrar pestaña específica
    if (window.location.hash === "#my-rentals") {
        window.showRentalsTab()
    }
})

// Declaración de la función showToast si no está definida
window.showToast =
    window.showToast ||
    ((message, description) => {
        console.log(message, description)
    })

// Observer para detectar cambios en el DOM y limpiar duplicados
const observer = new MutationObserver(() => {
    setTimeout(cleanDuplicateButtons, 50)
})

// Observar cambios en el navbar
document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar")
    if (navbar) {
        observer.observe(navbar, { childList: true, subtree: true })
    }
})
