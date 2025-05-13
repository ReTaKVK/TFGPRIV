// Variables globales
let userProfile = null
let userRentals = []

// Declaración de variables globales (simulando importaciones)
//const API_URL = "https://tu-api.com" // Reemplaza con la URL de tu API
//function requireAuth() {
//  return true
//} // Reemplaza con tu lógica de autenticación
//function getUser() {
//  return JSON.parse(localStorage.getItem("user"))
//} // Reemplaza con tu lógica para obtener el usuario
//function showToast(title, message, type) {
//  console.log(`${title}: ${message} (${type})`)
//} // Reemplaza con tu lógica para mostrar toasts
//function getToken() {
//  return localStorage.getItem("token")
//} // Reemplaza con tu lógica para obtener el token
//function saveUser(user) {
//  localStorage.setItem("user", JSON.stringify(user))
//}
//function updateNavbarButtons() {}

// Función para cargar los datos del perfil
async function loadProfile() {
    try {
        // Verificar si el usuario está autenticado
        if (!requireAuth()) return

        // Obtener el usuario actual
        const user = getUser()
        if (!user) {
            throw new Error("No se pudo obtener la información del usuario")
        }

        userProfile = user

        // Mostrar los datos del usuario
        displayUserProfile(user)

        // Cargar los alquileres del usuario
        await loadUserRentals()
    } catch (error) {
        console.error("Error:", error)
        showToast("Error", error.message || "Error al cargar el perfil", "error")
    }
}

// Función para mostrar los datos del usuario
function displayUserProfile(user) {
    // Nombre y email
    document.getElementById("user-name").textContent = user.nombre
    document.getElementById("user-email").textContent = user.email

    // Iniciales para el avatar
    const initials = user.nombre
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    document.getElementById("avatar-initials").textContent = initials

    // Formulario de perfil
    document.getElementById("profile-nombre").value = user.nombre
    document.getElementById("profile-email").value = user.email
}

// Función para cargar los alquileres del usuario
async function loadUserRentals() {
    try {
        // Mostrar spinner de carga
        document.getElementById("rentals-loading").classList.remove("d-none")
        document.getElementById("rentals-container").classList.add("d-none")
        document.getElementById("no-rentals").classList.add("d-none")

        // Obtener el token
        const token = getToken()
        if (!token) {
            throw new Error("No se pudo obtener el token de autenticación")
        }

        // Obtener los alquileres
        const response = await fetch("http://localhost:8080/api/alquileres", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error("Error al cargar los alquileres")
        }

        const allRentals = await response.json()

        // Filtrar los alquileres del usuario actual
        userRentals = allRentals.filter((rental) => rental.usuarioId === userProfile.id)

        // Verificar si hay alquileres
        if (userRentals.length === 0) {
            document.getElementById("rentals-loading").classList.add("d-none")
            document.getElementById("no-rentals").classList.remove("d-none")
            return
        }

        // Cargar información adicional de los vehículos
        await loadVehiclesInfo()

        // Mostrar los alquileres
        displayUserRentals()

        // Ocultar spinner y mostrar contenido
        document.getElementById("rentals-loading").classList.add("d-none")
        document.getElementById("rentals-container").classList.remove("d-none")
    } catch (error) {
        console.error("Error:", error)
        document.getElementById("rentals-loading").classList.add("d-none")
        document.getElementById("no-rentals").classList.remove("d-none")
    }
}

// Función para cargar información adicional de los vehículos
async function loadVehiclesInfo() {
    try {
        // Obtener todos los vehículos
        const response = await fetch("http://localhost:8080/api/vehiculos")

        if (!response.ok) {
            throw new Error("Error al cargar los vehículos")
        }

        const vehicles = await response.json()

        // Agregar información del vehículo a cada alquiler
        userRentals = userRentals.map((rental) => {
            const vehicle = vehicles.find((v) => v.id === rental.vehiculoId)
            return {
                ...rental,
                vehiculo: vehicle,
            }
        })
    } catch (error) {
        console.error("Error:", error)
    }
}

// Función para mostrar los alquileres del usuario
function displayUserRentals() {
    const rentalsTableBody = document.getElementById("rentals-table-body")
    if (!rentalsTableBody) return

    let html = ""

    userRentals.forEach((rental) => {
        const fechaInicio = new Date(rental.fechaInicio)
        const fechaFin = new Date(rental.fechaFin)
        const hoy = new Date()

        // Determinar el estado del alquiler
        let estado = "Pendiente"
        let estadoClass = "bg-warning"

        if (fechaInicio <= hoy && fechaFin >= hoy) {
            estado = "Activo"
            estadoClass = "bg-success"
        } else if (fechaFin < hoy) {
            estado = "Completado"
            estadoClass = "bg-info"
        }

        html += `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${rental.vehiculo?.imagen || "img/car-placeholder.jpg"}" class="me-2 cart-item-img" alt="Vehículo">
                        <div>
                            <strong>${rental.vehiculo?.marca} ${rental.vehiculo?.modelo}</strong>
                            <br>
                            <small class="text-muted">Matrícula: ${rental.vehiculo?.matricula}</small>
                        </div>
                    </div>
                </td>
                <td>${formatDate(rental.fechaInicio)}</td>
                <td>${formatDate(rental.fechaFin)}</td>
                <td><span class="badge ${estadoClass}">${estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="showCancelRentalModal(${rental.id})" ${estado !== "Pendiente" ? "disabled" : ""}>
                        Cancelar
                    </button>
                </td>
            </tr>
        `
    })

    rentalsTableBody.innerHTML = html
}

// Función para formatear fechas
function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES")
}

// Función para mostrar el modal de cancelación de alquiler
function showCancelRentalModal(rentalId) {
    // Guardar el ID del alquiler en el botón de confirmación
    document.getElementById("confirm-cancel-rental").dataset.rentalId = rentalId

    // Mostrar el modal
    const cancelRentalModal = new bootstrap.Modal(document.getElementById("cancelRentalModal"))
    cancelRentalModal.show()
}

// Función para cancelar un alquiler
async function cancelRental(rentalId) {
    try {
        // Obtener el token
        const token = getToken()
        if (!token) {
            throw new Error("No se pudo obtener el token de autenticación")
        }

        // Eliminar el alquiler
        const response = await fetch(`http://localhost:8080/api/alquileres/${rentalId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error("Error al cancelar el alquiler")
        }

        // Mostrar notificación
        showToast("Éxito", "Alquiler cancelado con éxito", "success")

        // Recargar los alquileres
        await loadUserRentals()
    } catch (error) {
        console.error("Error:", error)
        showToast("Error", error.message || "Error al cancelar el alquiler", "error")
    }
}

// Función para actualizar el perfil
async function updateProfile(nombre) {
    try {
        // Obtener el token
        const token = getToken()
        if (!token) {
            throw new Error("No se pudo obtener el token de autenticación")
        }

        // Actualizar el perfil
        const response = await fetch(`http://localhost:8080/api/usuarios/${userProfile.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ...userProfile,
                nombre,
            }),
        })

        if (!response.ok) {
            throw new Error("Error al actualizar el perfil")
        }

        const updatedUser = await response.json()

        // Actualizar el usuario en localStorage
        saveUser(updatedUser)

        // Actualizar la variable global
        userProfile = updatedUser

        // Actualizar la interfaz
        displayUserProfile(updatedUser)

        // Actualizar los botones de la barra de navegación
        updateNavbarButtons()

        // Mostrar notificación
        showToast("Éxito", "Perfil actualizado con éxito", "success")
    } catch (error) {
        console.error("Error:", error)
        showToast("Error", error.message || "Error al actualizar el perfil", "error")
    }
}

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

// Función para verificar si el usuario está autenticado
function requireAuth() {
    if (!isAuthenticated()) {
        sessionStorage.setItem("redirectAfterLogin", window.location.href)
        window.location.href = "index.html"
        return false
    }
    return true
}

// Función para verificar si el usuario está autenticado
function isAuthenticated() {
    return localStorage.getItem("token") !== null
}

// Función para obtener los datos del usuario de localStorage
function getUser() {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
}

// Función para obtener el token de localStorage
function getToken() {
    return localStorage.getItem("token")
}

// Función para guardar los datos del usuario en localStorage
function saveUser(user) {
    localStorage.setItem("user", JSON.stringify(user))
}

// Función para actualizar los botones de la barra de navegación
function updateNavbarButtons() {
    const navbarButtons = document.getElementById("navbarButtons")
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

// Función para cerrar sesión
function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    updateNavbarButtons()
    showToast("Sesión cerrada", "Has cerrado sesión correctamente")
    window.location.href = "index.html"
}

// Eventos
document.addEventListener("DOMContentLoaded", () => {
    // Cargar el perfil
    loadProfile()

    // Evento para el formulario de perfil
    const profileForm = document.getElementById("profile-form")
    if (profileForm) {
        profileForm.addEventListener("submit", (e) => {
            e.preventDefault()

            const nombre = document.getElementById("profile-nombre").value

            if (!nombre) {
                const profileError = document.getElementById("profile-error")
                profileError.textContent = "El nombre es obligatorio"
                profileError.classList.remove("d-none")
                return
            }

            updateProfile(nombre)
        })
    }

    // Evento para el botón de confirmación de cancelación de alquiler
    const confirmCancelRentalBtn = document.getElementById("confirm-cancel-rental")
    if (confirmCancelRentalBtn) {
        confirmCancelRentalBtn.addEventListener("click", function () {
            // Obtener el ID del alquiler
            const rentalId = this.dataset.rentalId

            // Cerrar el modal
            const cancelRentalModalElement = document.getElementById("cancelRentalModal")
            const cancelRentalModal = bootstrap.Modal.getInstance(cancelRentalModalElement)
            cancelRentalModal.hide()

            // Cancelar el alquiler
            cancelRental(rentalId)
        })
    }
})
