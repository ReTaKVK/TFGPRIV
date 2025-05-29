// Función global para actualizar los botones de la navbar
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

        navbarButtons.innerHTML = `
            <a href="carrito.html" class="btn btn-outline-light me-2 position-relative cart-btn">
                <i class="bi bi-cart3"></i>
                <span class="d-none d-lg-inline ms-1">Carrito</span>
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="cart-badge" style="display: none;">
                    0
                </span>
            </a>
            ${
            isAdmin
                ? `
                <a href="admin.html" class="btn admin-link me-2">
                    <i class="bi bi-shield-check"></i>
                    <span class="d-none d-lg-inline ms-1">Panel Admin</span>
                </a>
            `
                : ""
        }
            <div class="dropdown">
                <button class="btn btn-light dropdown-toggle d-flex align-items-center user-dropdown-btn" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <div class="d-flex align-items-center">
                        <div class="avatar-mini me-2" style="background: ${nivelInfo.gradient};">
                            ${getInitials(user?.nombre)}
                        </div>
                        <div class="d-none d-lg-block text-start">
                            <div class="fw-bold ${nivelClass}">${user?.nombre || "Usuario"}</div>
                            <small style="color: ${nivelInfo.color};">
                                <i class="bi bi-star-fill"></i> ${nivelInfo.nombre}
                            </small>
                        </div>
                    </div>
                </button>
                <ul class="dropdown-menu dropdown-menu-end user-dropdown-menu" aria-labelledby="userDropdown">
                    <li class="dropdown-header">
                        <div class="text-center">
                            <div class="fw-bold ${nivelClass}">${user?.nombre}</div>
                            <small class="text-muted">${user?.email}</small>
                            <div class="mt-1">
                                <span class="badge level-badge-${user?.nivelUsuario?.toLowerCase() || "bronce"}" style="background: ${nivelInfo.gradient}; color: white;">
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
                        <a class="dropdown-item" href="perfil.html">
                            <i class="bi bi-person-circle me-2"></i>Mi perfil
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="carrito.html">
                            <i class="bi bi-cart me-2"></i>Mi carrito
                        </a>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <a class="dropdown-item text-danger" href="#" id="logout-link">
                            <i class="bi bi-box-arrow-right me-2"></i>Cerrar sesión
                        </a>
                    </li>
                </ul>
            </div>
        `

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
        navbarButtons.innerHTML = `
            <button class="btn btn-outline-light me-2 auth-btn" data-bs-toggle="modal" data-bs-target="#loginModal">
                <i class="bi bi-box-arrow-in-right"></i>
                <span class="d-none d-lg-inline ms-1">Iniciar sesión</span>
            </button>
            <button class="btn btn-light auth-btn" data-bs-toggle="modal" data-bs-target="#registerModal">
                <i class="bi bi-person-plus"></i>
                <span class="d-none d-lg-inline ms-1">Registrarse</span>
            </button>
        `
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

        const response = await fetch(`http://localhost:8080/api/usuarios/${user.id}`, {
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
        BRONCE: "user-name-bronce",
        PLATA: "user-name-plata",
        ORO: "user-name-oro",
        DIAMANTE: "user-name-diamante",
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

        const response = await fetch(`http://localhost:8080/api/carrito/${user.id}`, {
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
    if (typeof showToast === "function") {
        window.showToast("Sesión cerrada", "Has cerrado sesión correctamente")
    }

    window.location.href = "index.html"
}

// Inicializar cuando se carga el DOM
document.addEventListener("DOMContentLoaded", () => {
    window.updateNavbarButtons()

    // Actualizar cada 30 segundos el badge del carrito
    if (isAuthenticated()) {
        setInterval(updateCartBadge, 30000)
    }
})
