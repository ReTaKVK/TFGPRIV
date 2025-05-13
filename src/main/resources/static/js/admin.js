// Variables globales
const API_URL = "http://localhost:8080/api"
let vehiculos = []
let usuarios = []
let alquileres = []
let currentTab = "vehiculos"

// Función para verificar si el usuario es administrador
function checkAdmin() {
    const user = getUser()
    if (!user || user.rol !== "ADMIN") {
        window.location.href = "index.html"
    }
}

// Función para cargar los datos del panel de administración
async function loadAdminData() {
    try {
        // Mostrar spinner de carga
        document.getElementById("admin-loading").classList.remove("d-none")
        document.getElementById("admin-content").classList.add("d-none")

        // Cargar datos según la pestaña activa
        if (currentTab === "vehiculos") {
            await loadVehiculos()
        } else if (currentTab === "usuarios") {
            await loadUsuarios()
        } else if (currentTab === "alquileres") {
            await loadAlquileres()
        }

        // Ocultar spinner y mostrar contenido
        document.getElementById("admin-loading").classList.add("d-none")
        document.getElementById("admin-content").classList.remove("d-none")
    } catch (error) {
        console.error("Error:", error)
        showToast("Error", "Error al cargar los datos del panel de administración", "error")
    }
}

// Función para cargar los vehículos
async function loadVehiculos() {
    try {
        const token = getToken()
        if (!token) {
            throw new Error("No se pudo obtener el token de autenticación")
        }

        const response = await fetch(`${API_URL}/vehiculos`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error("Error al cargar los vehículos")
        }

        vehiculos = await response.json()
        displayVehiculos()
    } catch (error) {
        console.error("Error:", error)
        showToast("Error", error.message || "Error al cargar los vehículos", "error")
    }
}

// Función para mostrar los vehículos
function displayVehiculos() {
    const vehiculosTableBody = document.getElementById("vehiculos-table-body")
    if (!vehiculosTableBody) return

    let html = ""

    vehiculos.forEach((vehiculo) => {
        html += `
            <tr>
                <td>${vehiculo.id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${vehiculo.imagen || "img/car-placeholder.jpg"}" class="me-2 cart-item-img" alt="Vehículo">
                        <div>
                            <strong>${vehiculo.marca} ${vehiculo.modelo}</strong>
                            <br>
                            <small class="text-muted">Matrícula: ${vehiculo.matricula}</small>
                        </div>
                    </div>
                </td>
                <td>${vehiculo.precio}€/día</td>
                <td><span class="badge ${vehiculo.disponible ? "bg-success" : "bg-danger"}">${vehiculo.disponible ? "Disponible" : "No disponible"}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editVehiculo(${vehiculo.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteVehiculo(${vehiculo.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `
    })

    vehiculosTableBody.innerHTML = html
}

// Función para cargar los usuarios
async function loadUsuarios() {
    try {
        const token = getToken()
        if (!token) {
            throw new Error("No se pudo obtener el token de autenticación")
        }

        const response = await fetch(`${API_URL}/usuarios`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error("Error al cargar los usuarios")
        }

        usuarios = await response.json()
        displayUsuarios()
    } catch (error) {
        console.error("Error:", error)
        showToast("Error", error.message || "Error al cargar los usuarios", "error")
    }
}

// Función para mostrar los usuarios
function displayUsuarios() {
    const usuariosTableBody = document.getElementById("usuarios-table-body")
    if (!usuariosTableBody) return

    let html = ""

    usuarios.forEach((usuario) => {
        html += `
            <tr>
                <td>${usuario.id}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.email}</td>
                <td><span class="badge ${usuario.rol === "ADMIN" ? "bg-danger" : "bg-primary"}">${usuario.rol}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editUsuario(${usuario.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUsuario(${usuario.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `
    })

    usuariosTableBody.innerHTML = html
}

// Función para cargar los alquileres
async function loadAlquileres() {
    try {
        const token = getToken()
        if (!token) {
            throw new Error("No se pudo obtener el token de autenticación")
        }

        const [alquileresResponse, vehiculosResponse, usuariosResponse] = await Promise.all([
            fetch(`${API_URL}/alquileres`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
            fetch(`${API_URL}/vehiculos`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
            fetch(`${API_URL}/usuarios`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
        ])

        if (!alquileresResponse.ok || !vehiculosResponse.ok || !usuariosResponse.ok) {
            throw new Error("Error al cargar los datos")
        }

        alquileres = await alquileresResponse.json()
        const vehiculosData = await vehiculosResponse.json()
        const usuariosData = await usuariosResponse.json()

        // Agregar información de vehículo y usuario a cada alquiler
        alquileres = alquileres.map((alquiler) => {
            const vehiculo = vehiculosData.find((v) => v.id === alquiler.vehiculoId)
            const usuario = usuariosData.find((u) => u.id === alquiler.usuarioId)
            return {
                ...alquiler,
                vehiculo,
                usuario,
            }
        })

        displayAlquileres()
    } catch (error) {
        console.error("Error:", error)
        showToast("Error", error.message || "Error al cargar los alquileres", "error")
    }
}

// Función para mostrar los alquileres
function displayAlquileres() {
    const alquileresTableBody = document.getElementById("alquileres-table-body")
    if (!alquileresTableBody) return

    let html = ""

    alquileres.forEach((alquiler) => {
        const fechaInicio = new Date(alquiler.fechaInicio)
        const fechaFin = new Date(alquiler.fechaFin)
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
                <td>${alquiler.id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${alquiler.vehiculo?.imagen || "img/car-placeholder.jpg"}" class="me-2 cart-item-img" alt="Vehículo">
                        <div>
                            <strong>${alquiler.vehiculo?.marca} ${alquiler.vehiculo?.modelo}</strong>
                            <br>
                            <small class="text-muted">Matrícula: ${alquiler.vehiculo?.matricula}</small>
                        </div>
                    </div>
                </td>
                <td>${alquiler.usuario?.nombre}</td>
                <td>${formatDate(alquiler.fechaInicio)}</td>
                <td>${formatDate(alquiler.fechaFin)}</td>
                <td><span class="badge ${estadoClass}">${estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editAlquiler(${alquiler.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteAlquiler(${alquiler.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `
    })

    alquileresTableBody.innerHTML = html
}

// Función para crear un nuevo vehículo
async function createVehiculo(vehiculoData) {
    try {
        const token = getToken()
        if (!token) {
            throw new Error("No se pudo obtener el token de autenticación")
        }

        const response = await fetch(`${API_URL}/vehiculos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(vehiculoData),
        })

        if (!response.ok) {
            throw new Error("Error al crear el vehículo")
        }

        await loadVehiculos()
        showToast("Éxito", "Vehículo creado con éxito", "success")
    } catch (error) {
        console.error("Error:", error)
        showToast("Error", error.message || "Error al crear el vehículo", "error")
    }
}

// Función para editar un vehículo
async function editVehiculo(id) {
    try {
        const vehiculo = vehiculos.find((v) => v.id === id)
        if (!vehiculo) {
            throw new Error("Vehículo no encontrado")
        }

        // Rellenar el formulario con los datos del vehículo
        document.getElementById("vehiculo-id").value = vehiculo.id
        document.getElementById("vehiculo-marca").value = vehiculo.marca
        document.getElementById("vehiculo-modelo").value = vehiculo.modelo
        document.getElementById("vehiculo-matricula").value = vehiculo.matricula
        document.getElementById("vehiculo-precio").value = vehiculo.precio
        document.getElementById("vehiculo-disponible").checked = vehiculo.disponible
        document.getElementById("vehiculo-imagen").value = vehiculo.imagen
        document.getElementById("vehiculo-latitud").value = vehiculo.latitud
        document.getElementById("vehiculo-longitud").value = vehiculo.longitud

        // Mostrar el modal
        const vehiculoModal = new bootstrap.Modal(document.getElementById("vehiculoModal"))
        vehiculoModal.show()
    } catch (error) {
        console.error("Error:", error)
        showToast("Error", error.message || "Error al editar el vehículo", "error")
    }
}

// Función para eliminar un vehículo
async function deleteVehiculo(id) {
    try {
        if (!confirm("¿Estás seguro de que deseas eliminar este vehículo?")) {
            return
        }

        const token = getToken()
        if (!token) {
            throw new Error("No se pudo obtener el token de autenticación")
        }

        const response = await fetch(`${API_URL}/vehiculos/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            throw new Error("Error al eliminar el vehículo")
        }

        await loadVehiculos()
        showToast("Éxito", "Vehículo eliminado con éxito", "success")
    } catch (error) {
        console.error("Error:", error)
        showToast("Error", error.message || "Error al eliminar el vehículo", "error")
    }
}

// Función para guardar un vehículo (crear o actualizar)
async function saveVehiculo() {
    try {
        const id = document.getElementById("vehiculo-id").value
        const vehiculoData = {
            marca: document.getElementById("vehiculo-marca").value,
            modelo: document.getElementById("vehiculo-modelo").value,
            matricula: document.getElementById("vehiculo-matricula").value,
            precio: Number.parseFloat(document.getElementById("vehiculo-precio").value),
            disponible: document.getElementById("vehiculo-disponible").checked,
            imagen: document.getElementById("vehiculo-imagen").value,
            latitud: Number.parseFloat(document.getElementById("vehiculo-latitud").value),
            longitud: Number.parseFloat(document.getElementById("vehiculo-longitud").value),
        }

        const token = getToken()
        if (!token) {
            throw new Error("No se pudo obtener el token de autenticación")
        }

        let response
        if (id) {
            // Actualizar vehículo existente
            response = await fetch(`${API_URL}/vehiculos/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(vehiculoData),
            })
        } else {
            // Crear nuevo vehículo
            response = await fetch(`${API_URL}/vehiculos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(vehiculoData),
            })
        }

        if (!response.ok) {
            throw new Error("Error al guardar el vehículo")
        }

        // Cerrar el modal
        const vehiculoModal = bootstrap.Modal.getInstance(document.getElementById("vehiculoModal"))
        vehiculoModal.hide()

        // Recargar los vehículos
        await loadVehiculos()

        showToast("Éxito", `Vehículo ${id ? "actualizado" : "creado"} con éxito`, "success")
    } catch (error) {
        console.error("Error:", error)
        showToast("Error", error.message || "Error al guardar el vehículo", "error")
    }
}

// Función para formatear fechas
function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES")
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

// Función para obtener el token de localStorage
function getToken() {
    return localStorage.getItem("token")
}

// Función para obtener los datos del usuario de localStorage
function getUser() {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
}

// Eventos
document.addEventListener("DOMContentLoaded", () => {
    // Verificar si el usuario es administrador
    checkAdmin()

    // Cargar datos iniciales
    loadAdminData()

    // Eventos para las pestañas
    const tabLinks = document.querySelectorAll(".nav-link")
    tabLinks.forEach((link) => {
        link.addEventListener("click", function () {
            currentTab = this.dataset.tab
            loadAdminData()
        })
    })

    // Evento para el botón de nuevo vehículo
    const newVehiculoBtn = document.getElementById("new-vehiculo-btn")
    if (newVehiculoBtn) {
        newVehiculoBtn.addEventListener("click", () => {
            // Limpiar el formulario
            document.getElementById("vehiculo-form").reset()
            document.getElementById("vehiculo-id").value = ""

            // Mostrar el modal
            const vehiculoModal = new bootstrap.Modal(document.getElementById("vehiculoModal"))
            vehiculoModal.show()
        })
    }

    // Evento para el formulario de vehículo
    const vehiculoForm = document.getElementById("vehiculo-form")
    if (vehiculoForm) {
        vehiculoForm.addEventListener("submit", (e) => {
            e.preventDefault()
            saveVehiculo()
        })
    }
})
