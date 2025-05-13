// Variables globales
const API_URL = "http://localhost:8080/api"
const loginForm = document.getElementById("loginForm")
const registerForm = document.getElementById("registerForm")
const loginError = document.getElementById("loginError")
const registerError = document.getElementById("registerError")
const navbarButtons = document.getElementById("navbarButtons")

// Función para mostrar notificaciones
function showToast(title, message, type = "success") {
    const toast = document.getElementById("toast")
    const toastTitle = document.getElementById("toastTitle")
    const toastMessage = document.getElementById("toastMessage")

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

// Función para guardar el token en localStorage
function saveToken(token) {
    localStorage.setItem("token", token)
}

// Función para obtener el token de localStorage
function getToken() {
    return localStorage.getItem("token")
}

// Función para eliminar el token de localStorage
function removeToken() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
}

// Función para guardar los datos del usuario en localStorage
function saveUser(user) {
    localStorage.setItem("user", JSON.stringify(user))
}

// Función para obtener los datos del usuario de localStorage
function getUser() {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
}

// Función para verificar si el usuario está autenticado
function isAuthenticated() {
    return getToken() !== null
}

// Función para decodificar el token JWT
function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1]
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join(""),
        )
        return JSON.parse(jsonPayload)
    } catch (e) {
        return null
    }
}

// Función para obtener el usuario actual desde el token
function getCurrentUser() {
    const token = getToken()
    if (!token) return null

    const decoded = parseJwt(token)
    if (!decoded) return null

    return {
        email: decoded.sub,
        rol: decoded.rol,
    }
}

// Función para actualizar los botones de la barra de navegación según el estado de autenticación
function updateNavbarButtons() {
    if (!navbarButtons) return

    if (isAuthenticated()) {
        const user = getUser()
        navbarButtons.innerHTML = `
            <a href="carrito.html" class="btn btn-outline-light me-2">
                <i class="bi bi-cart"></i> Carrito
            </a>
            <div class="dropdown">
                <button class="btn btn-light dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-person-circle"></i> ${user?.nombre || "Usuario"}
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item" href="perfil.html">Mi perfil</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" id="logout-link">Cerrar sesión</a></li>
                </ul>
            </div>
        `

        // Agregar evento de cierre de sesión
        document.getElementById("logout-link").addEventListener("click", logout)
    } else {
        navbarButtons.innerHTML = `
            <button class="btn btn-outline-light me-2" data-bs-toggle="modal" data-bs-target="#loginModal">Iniciar sesión</button>
            <button class="btn btn-light" data-bs-toggle="modal" data-bs-target="#registerModal">Registrarse</button>
        `
    }
}

// Función para iniciar sesión
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/authenticate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || "Error al iniciar sesión")
        }

        saveToken(data.token)

        // Obtener datos del usuario
        await fetchUserData()

        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

// Función para registrarse
async function register(nombre, email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                nombre,
                email,
                password,
                rol: "USER", // Por defecto, todos los usuarios nuevos son de tipo USER
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || "Error al registrarse")
        }

        saveToken(data.token)

        // Obtener datos del usuario
        await fetchUserData()

        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

// Función para obtener los datos del usuario actual
async function fetchUserData() {
    try {
        const token = getToken()
        if (!token) throw new Error("No hay token")

        const decoded = parseJwt(token)
        if (!decoded) throw new Error("Token inválido")

        const email = decoded.sub

        const response = await fetch(`${API_URL}/usuarios`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error("Error al obtener datos del usuario")
        }

        const users = await response.json()
        const user = users.find((u) => u.email === email)

        if (user) {
            saveUser(user)
        }

        return user
    } catch (error) {
        console.error("Error al obtener datos del usuario:", error)
        return null
    }
}

// Función para cerrar sesión
function logout() {
    removeToken()
    updateNavbarButtons()
    showToast("Sesión cerrada", "Has cerrado sesión correctamente")

    // Redirigir a la página de inicio
    window.location.href = "index.html"
}

// Eventos de formularios
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault()

        const email = document.getElementById("loginEmail").value
        const password = document.getElementById("loginPassword").value

        const result = await login(email, password)

        if (result.success) {
            const loginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"))
            loginModal.hide()

            updateNavbarButtons()
            showToast("Inicio de sesión exitoso", "¡Bienvenido de nuevo!")

            // Redirigir a la página anterior o a la página de inicio
            const redirectUrl = sessionStorage.getItem("redirectAfterLogin") || "index.html"
            sessionStorage.removeItem("redirectAfterLogin")
            window.location.href = redirectUrl
        } else {
            loginError.textContent = result.error || "Error al iniciar sesión"
            loginError.classList.remove("d-none")
        }
    })
}

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault()

        const nombre = document.getElementById("registerNombre").value
        const email = document.getElementById("registerEmail").value
        const password = document.getElementById("registerPassword").value

        const result = await register(nombre, email, password)

        if (result.success) {
            const registerModal = bootstrap.Modal.getInstance(document.getElementById("registerModal"))
            registerModal.hide()

            updateNavbarButtons()
            showToast("Registro exitoso", "¡Bienvenido a RentCar!")

            // Redirigir a la página anterior o a la página de inicio
            const redirectUrl = sessionStorage.getItem("redirectAfterLogin") || "index.html"
            sessionStorage.removeItem("redirectAfterLogin")
            window.location.href = redirectUrl
        } else {
            registerError.textContent = result.error || "Error al registrarse"
            registerError.classList.remove("d-none")
        }
    })
}

// Función para redirigir a la página de login si no está autenticado
function requireAuth() {
    if (!isAuthenticated()) {
        sessionStorage.setItem("redirectAfterLogin", window.location.href)
        window.location.href = "index.html"
        return false
    }
    return true
}

// Inicializar la autenticación al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    updateNavbarButtons()

    // Si hay un botón de logout en la página (fuera del navbar)
    const logoutBtn = document.getElementById("logout-btn")
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout)
    }
})
