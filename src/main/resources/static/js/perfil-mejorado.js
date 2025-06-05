// Variables globales
let userProfile = null
let userRentals = []
const userStats = {
    totalRentals: 0,
    activeRentals: 0,
    memberDays: 0,
    nextLevelProgress: 0,
}

// Función principal para cargar el perfil
async function loadProfile() {
    try {
        // Verificar autenticación
        if (!requireAuth()) return

        // Mostrar loading
        showLoading(true)

        // Obtener usuario actual
        const user = getUser()
        if (!user) {
            throw new Error("No se pudo obtener la información del usuario")
        }

        userProfile = user

        // Forzar actualización desde servidor
        await window.forceUserUpdate()

        // Cargar datos actualizados
        const updatedUser = getUser()
        if (updatedUser) {
            userProfile = updatedUser
        }

        // Mostrar datos del usuario
        displayUserProfile(userProfile)

        // Cargar estadísticas y alquileres
        await Promise.all([loadUserStats(), loadUserRentals()])

        // Ocultar loading y mostrar contenido
        showLoading(false)
    } catch (error) {
        console.error("Error:", error)
        showToast("Error", error.message || "Error al cargar el perfil", "error")
        showLoading(false)
    }
}

// Función para mostrar/ocultar loading
function showLoading(show) {
    const loadingElement = document.querySelector(".loading-placeholder")
    const contentElement = document.querySelector(".profile-content")

    if (show) {
        loadingElement?.classList.remove("d-none")
        contentElement?.classList.add("d-none")
    } else {
        loadingElement?.classList.add("d-none")
        contentElement?.classList.remove("d-none")
    }
}

// Función para mostrar los datos del usuario
function displayUserProfile(user) {
    // Información básica
    document.getElementById("user-name").textContent = user.nombre || "Usuario"
    document.getElementById("user-email").textContent = user.email || ""

    // Avatar con iniciales
    const initials = getInitials(user.nombre)
    document.getElementById("avatar-initials").textContent = initials

    // Nivel de membresía
    const nivelInfo = getNivelInfo(user.nivelUsuario || "BRONCE")
    const membershipBadge = document.getElementById("membership-level")
    if (membershipBadge) {
        membershipBadge.innerHTML = `
      <i class="bi bi-award"></i>
      <span style="color: ${nivelInfo.color};">${nivelInfo.nombre}</span>
    `
        membershipBadge.style.background = nivelInfo.gradient
    }

    // Formulario de perfil
    document.getElementById("profile-nombre").value = user.nombre || ""
    document.getElementById("profile-email").value = user.email || ""
    document.getElementById("profile-telefono").value = user.telefono || ""
    document.getElementById("profile-fecha-nacimiento").value = user.fechaNacimiento || ""
    document.getElementById("profile-direccion").value = user.direccion || ""
}

// Función para cargar estadísticas del usuario
async function loadUserStats() {
    try {
        const token = getToken()
        if (!token) return

        // Cargar alquileres para calcular estadísticas
        const response = await fetch(`https://tfgpriv.onrender.com/api/alquileres/usuario/${userProfile.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (response.ok) {
            const alquileres = await response.json()

            // Calcular estadísticas
            userStats.totalRentals = alquileres.length
            userStats.activeRentals = alquileres.filter((a) => {
                const now = new Date()
                const inicio = new Date(a.fechaInicio)
                const fin = new Date(a.fechaFin)
                return inicio <= now && fin >= now
            }).length

            // Calcular días como miembro
            const fechaRegistro = new Date(userProfile.fechaRegistro || Date.now())
            const ahora = new Date()
            userStats.memberDays = Math.floor((ahora - fechaRegistro) / (1000 * 60 * 60 * 24))

            // Calcular progreso hacia siguiente nivel
            const { progress, remaining } = calculateLevelProgress(userStats.totalRentals)
            userStats.nextLevelProgress = progress

            // Actualizar UI
            updateStatsDisplay()
            updateLevelProgress(progress, remaining)
        }
    } catch (error) {
        console.error("Error al cargar estadísticas:", error)
    }
}

// Función para actualizar la visualización de estadísticas
function updateStatsDisplay() {
    // Animar contadores
    animateCounter("total-rentals-stat", userStats.totalRentals)
    animateCounter("active-rentals-stat", userStats.activeRentals)
    animateCounter("member-days-stat", userStats.memberDays)
}

// Función para animar contadores
function animateCounter(elementId, targetValue) {
    const element = document.querySelector(`#${elementId} .stat-number`)
    if (!element) return

    let currentValue = 0
    const increment = targetValue / 50
    const timer = setInterval(() => {
        currentValue += increment
        if (currentValue >= targetValue) {
            currentValue = targetValue
            clearInterval(timer)
        }
        element.textContent = Math.floor(currentValue)
    }, 30)
}

// Función para calcular progreso de nivel
function calculateLevelProgress(totalRentals) {
    const levels = {
        BRONCE: { min: 0, max: 4 },
        PLATA: { min: 5, max: 14 },
        ORO: { min: 15, max: 29 },
        DIAMANTE: { min: 30, max: Number.POSITIVE_INFINITY },
    }

    let currentLevel = "BRONCE"
    let nextLevel = "PLATA"
    let progress = 0
    let remaining = 5

    if (totalRentals >= 30) {
        currentLevel = "DIAMANTE"
        nextLevel = null
        progress = 100
        remaining = 0
    } else if (totalRentals >= 15) {
        currentLevel = "ORO"
        nextLevel = "DIAMANTE"
        progress = ((totalRentals - 15) / 15) * 100
        remaining = 30 - totalRentals
    } else if (totalRentals >= 5) {
        currentLevel = "PLATA"
        nextLevel = "ORO"
        progress = ((totalRentals - 5) / 10) * 100
        remaining = 15 - totalRentals
    } else {
        progress = (totalRentals / 5) * 100
        remaining = 5 - totalRentals
    }

    return { currentLevel, nextLevel, progress, remaining }
}

// Función para actualizar progreso de nivel
function updateLevelProgress(progress, remaining) {
    const progressBar = document.querySelector(".progress-fill")
    const progressPercentage = document.querySelector(".progress-percentage")
    const progressRemaining = document.querySelector(".progress-remaining")

    if (progressBar) {
        progressBar.style.width = `${progress}%`
    }

    if (progressPercentage) {
        progressPercentage.textContent = `${Math.round(progress)}%`
    }

    if (progressRemaining) {
        if (remaining > 0) {
            progressRemaining.textContent = `Faltan ${remaining} alquileres`
        } else {
            progressRemaining.textContent = "¡Nivel máximo alcanzado!"
        }
    }
}

// Función para cargar alquileres del usuario
async function loadUserRentals() {
    try {
        const token = getToken();
        if (!token) {
            // Si no tienes token, no puedes cargar
            showToast("Error", "No estás autenticado", "error");
            return;
        }

        const response = await fetch(`https://tfgpriv.onrender.com/api/alquileres/usuario/${userProfile.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            userRentals = await response.json();

            if (userRentals.length === 0) {
                document.getElementById("no-rentals").classList.remove("d-none");
                document.getElementById("rentals-container").classList.add("d-none");
                return;
            }

            // Cargar info de vehículos para mostrar detalles
            await loadVehiclesInfo();

            // Mostrar alquileres en la tabla
            displayUserRentals();

            // Mostrar la sección
            document.getElementById("rentals-container").classList.remove("d-none");
            document.getElementById("no-rentals").classList.add("d-none");
        } else {
            // Si hubo error
            throw new Error("No se pudieron cargar los alquileres");
        }
    } catch (error) {
        console.error("Error al cargar alquileres:", error);
        document.getElementById("no-rentals").classList.remove("d-none");
        document.getElementById("rentals-container").classList.add("d-none");
    }
}

// Función para cargar información de vehículos
async function loadVehiclesInfo() {
    try {
        const response = await fetch("https://tfgpriv.onrender.com/api/vehiculos")
        if (!response.ok) return

        const vehicles = await response.json()

        // Agregar información del vehículo a cada alquiler
        userRentals = userRentals.map((rental) => {
            const vehicle = vehicles.find((v) => v.id === rental.vehiculoId)
            return { ...rental, vehiculo: vehicle }
        })
    } catch (error) {
        console.error("Error al cargar vehículos:", error)
    }
}

// Función para mostrar alquileres
function displayUserRentals() {
    const tableBody = document.getElementById("rentals-table-body")
    if (!tableBody) return

    let html = ""

    userRentals.forEach((rental) => {
        const fechaInicio = new Date(rental.fechaInicio)
        const fechaFin = new Date(rental.fechaFin)
        const hoy = new Date()

        // Determinar estado
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
      <tr class="rental-row">
        <td>
          <div class="d-flex align-items-center">
            <img src="${rental.vehiculo?.imagen || "/placeholder.svg?height=50&width=80"}" 
                 class="rental-vehicle-img me-3" alt="Vehículo"
                 onerror="this.src='/placeholder.svg?height=50&width=80'">
            <div>
              <strong>${rental.vehiculo?.marca || "N/A"} ${rental.vehiculo?.modelo || ""}</strong>
              <br>
              <small class="text-muted">Matrícula: ${rental.vehiculo?.matricula || "N/A"}</small>
            </div>
          </div>
        </td>
        <td><span class="rental-id">#${rental.id}</span></td>
        <td>${formatDate(rental.fechaInicio)}</td>
        <td>${formatDate(rental.fechaFin)}</td>
        <td><span class="badge ${estadoClass}">${estado}</span></td>
        <td>
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-outline-primary" onclick="viewRentalDetails(${rental.id})" title="Ver detalles">
              <i class="bi bi-eye"></i>
            </button>
            ${
            estado === "Pendiente"
                ? `
              <button class="btn btn-sm btn-outline-danger" onclick="showCancelRentalModal(${rental.id})" title="Cancelar">
                <i class="bi bi-x-circle"></i>
              </button>
            `
                : ""
        }
          </div>
        </td>
      </tr>
    `
    })

    tableBody.innerHTML = html
}

// Función para ver detalles del alquiler
function viewRentalDetails(rentalId) {
    const rental = userRentals.find((r) => r.id === rentalId)
    if (!rental) return

    // Crear modal con detalles
    const modalHtml = `
    <div class="modal fade" id="rentalDetailsModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-info-circle me-2"></i>
              Detalles del Alquiler #${rental.id}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <h6>Información del Vehículo</h6>
                <p><strong>Vehículo:</strong> ${rental.vehiculo?.marca} ${rental.vehiculo?.modelo}</p>
                <p><strong>Matrícula:</strong> ${rental.vehiculo?.matricula}</p>
                <p><strong>Precio por día:</strong> €${rental.vehiculo?.precio}</p>
              </div>
              <div class="col-md-6">
                <h6>Información del Alquiler</h6>
                <p><strong>Fecha inicio:</strong> ${formatDate(rental.fechaInicio)}</p>
                <p><strong>Fecha fin:</strong> ${formatDate(rental.fechaFin)}</p>
                <p><strong>Duración:</strong> ${calculateDuration(rental.fechaInicio, rental.fechaFin)} días</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  `

    // Remover modal existente si existe
    const existingModal = document.getElementById("rentalDetailsModal")
    if (existingModal) {
        existingModal.remove()
    }

    // Agregar nuevo modal
    document.body.insertAdjacentHTML("beforeend", modalHtml)

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById("rentalDetailsModal"))
    modal.show()
}

// Función para calcular duración
function calculateDuration(startDate, endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Función para mostrar modal de cancelación
function showCancelRentalModal(rentalId) {
    document.getElementById("confirm-cancel-rental").dataset.rentalId = rentalId
    const modal = new bootstrap.Modal(document.getElementById("cancelRentalModal"))
    modal.show()
}

// Función para cancelar alquiler
async function cancelRental(rentalId) {
    try {
        const token = getToken()
        if (!token) return

        const response = await fetch(`https://tfgpriv.onrender.com/api/alquileres/${rentalId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error("Error al cancelar el alquiler")
        }

        showToast("Éxito", "Alquiler cancelado correctamente", "success")

        // Recargar datos
        await loadUserRentals()
        await loadUserStats()
    } catch (error) {
        console.error("Error:", error)
        showToast("Error", error.message || "Error al cancelar el alquiler", "error")
    }
}

// Función para actualizar perfil
async function updateProfile(formData) {
    try {
        const token = getToken()
        if (!token) return

        const response = await fetch(`https://tfgpriv.onrender.com/api/usuarios/${userProfile.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ...userProfile,
                ...formData,
            }),
        })

        if (!response.ok) {
            throw new Error("Error al actualizar el perfil")
        }

        const updatedUser = await response.json()

        // Actualizar localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser))
        userProfile = updatedUser

        // Actualizar UI
        displayUserProfile(updatedUser)
        window.updateNavbarButtons()

        showToast("Éxito", "Perfil actualizado correctamente", "success")
    } catch (error) {
        console.error("Error:", error)
        showToast("Error", error.message || "Error al actualizar el perfil", "error")
    }
}

// Función para refrescar datos del usuario
window.refreshUserProfile = async () => {
    try {
        showToast("Información", "Actualizando datos...", "info")
        await window.forceUserUpdate()
        const updatedUser = getUser()
        if (updatedUser) {
            userProfile = updatedUser
            displayUserProfile(updatedUser)
            await loadUserStats()
        }
        showToast("Éxito", "Datos actualizados correctamente", "success")
    } catch (error) {
        showToast("Error", "Error al actualizar los datos", "error")
    }
}

// Funciones auxiliares
function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES")
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

function requireAuth() {
    if (!isAuthenticated()) {
        sessionStorage.setItem("redirectAfterLogin", window.location.href)
        window.location.href = "index.html"
        return false
    }
    return true
}

function isAuthenticated() {
    return localStorage.getItem("token") !== null
}

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

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    // Cargar perfil
    loadProfile()

    const btnHistorial = document.getElementById("show-rentals-btn");
    if (btnHistorial) {
        btnHistorial.addEventListener("click", async (e) => {
            e.preventDefault();
            // Cargar alquileres y mostrar en la pestaña correspondiente
            await loadUserRentals();
            // Mostrar la pestaña de alquileres
            const tabTrigger = document.querySelector('[data-bs-target="#my-rentals"]');
            if (tabTrigger) {
                tabTrigger.click();
            }
        });
    }

    // Evento para formulario de perfil
    const profileForm = document.getElementById("profile-form")
    if (profileForm) {
        profileForm.addEventListener("submit", (e) => {
            e.preventDefault()

            const formData = {
                nombre: document.getElementById("profile-nombre").value,
                telefono: document.getElementById("profile-telefono").value,
                fechaNacimiento: document.getElementById("profile-fecha-nacimiento").value,
                direccion: document.getElementById("profile-direccion").value,
            }

            if (!formData.nombre) {
                showToast("Error", "El nombre es obligatorio", "error")
                return
            }

            updateProfile(formData)
        })
    }

    // Evento para confirmar cancelación de alquiler
    const confirmCancelBtn = document.getElementById("confirm-cancel-rental")
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener("click", function () {
            const rentalId = this.dataset.rentalId
            const modal = bootstrap.Modal.getInstance(document.getElementById("cancelRentalModal"))
            modal.hide()
            cancelRental(rentalId)
        })
    }

    // Evento para logout
    const logoutBtn = document.getElementById("logout-btn")
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault()
            logout()
        })
    }

    // Verificar si hay hash para mostrar pestaña específica
    if (window.location.hash === "#my-rentals") {
        setTimeout(() => {
            const rentalsTab = document.querySelector('[data-bs-target="#my-rentals"]')
            if (rentalsTab) {
                rentalsTab.click()
            }
        }, 500)
    }
})

function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    showToast("Sesión cerrada", "Has cerrado sesión correctamente")
    setTimeout(() => {
        window.location.href = "index.html"
    }, 1000)
}
