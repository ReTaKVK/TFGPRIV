import { Chart } from "@/components/ui/chart"
// =========================================
// ADMIN PREMIUM JAVASCRIPT
// =========================================

// Import Bootstrap
import bootstrap from "bootstrap"

class AdminPremium {
    constructor() {
        this.currentTab = "dashboard"
        this.data = {
            vehiculos: [],
            usuarios: [],
            alquileres: [],
        }
        this.filters = {}
        this.charts = {}
        this.init()
    }

    // Inicialización
    init() {
        this.hidePreloader()
        this.setupEventListeners()
        this.checkAuth()
        this.loadInitialData()
    }

    hidePreloader() {
        setTimeout(() => {
            const preloader = document.getElementById("preloader")
            if (preloader) {
                preloader.classList.add("hidden")
                setTimeout(() => preloader.remove(), 500)
            }
        }, 1000)
    }

    // Verificar autenticación
    checkAuth() {
        const token = localStorage.getItem("token")
        const user = this.getUser()

        if (!token || !user || user.rol !== "ADMIN") {
            this.showToast("Error", "Acceso denegado. Redirigiendo...", "danger")
            setTimeout(() => (window.location.href = "index.html"), 2000)
            return false
        }

        document.getElementById("adminUserName").textContent = user.nombre
        return true
    }

    getUser() {
        try {
            return JSON.parse(localStorage.getItem("user"))
        } catch {
            return null
        }
    }

    getToken() {
        return localStorage.getItem("token")
    }

    // Event Listeners
    setupEventListeners() {
        // Navegación de pestañas
        document.querySelectorAll(".nav-link[data-tab]").forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault()
                this.switchTab(link.dataset.tab)
            })
        })

        // Logout
        document.getElementById("logoutBtn")?.addEventListener("click", () => {
            this.logout()
        })

        // Búsqueda global
        document.getElementById("globalSearch")?.addEventListener("input", (e) => {
            this.globalSearch(e.target.value)
        })

        // Botones de acción
        this.setupActionButtons()

        // Formularios
        this.setupForms()

        // Filtros
        this.setupFilters()
    }

    setupActionButtons() {
        // Dashboard
        document.getElementById("refreshDashboard")?.addEventListener("click", () => {
            this.loadDashboardData()
        })

        document.getElementById("exportReport")?.addEventListener("click", () => {
            this.exportReport()
        })

        // Vehículos
        document.getElementById("newVehiculoBtn")?.addEventListener("click", () => {
            this.openVehiculoModal()
        })

        document.getElementById("importVehiculos")?.addEventListener("click", () => {
            this.importVehiculos()
        })

        document.getElementById("exportVehiculos")?.addEventListener("click", () => {
            this.exportVehiculos()
        })

        // Usuarios
        document.getElementById("newUsuarioBtn")?.addEventListener("click", () => {
            this.openUsuarioModal()
        })

        document.getElementById("exportUsuarios")?.addEventListener("click", () => {
            this.exportUsuarios()
        })

        // Alquileres
        document.getElementById("newAlquilerBtn")?.addEventListener("click", () => {
            this.openAlquilerModal()
        })

        document.getElementById("exportAlquileres")?.addEventListener("click", () => {
            this.exportAlquileres()
        })
    }

    setupForms() {
        // Formulario de vehículo
        document.getElementById("vehiculoForm")?.addEventListener("submit", (e) => {
            e.preventDefault()
            this.saveVehiculo()
        })

        // Formulario de usuario
        document.getElementById("usuarioForm")?.addEventListener("submit", (e) => {
            e.preventDefault()
            this.saveUsuario()
        })

        // Formulario de alquiler
        document.getElementById("alquilerForm")?.addEventListener("submit", (e) => {
            e.preventDefault()
            this.saveAlquiler()
        })

        // Configuración
        document.getElementById("configGeneralForm")?.addEventListener("submit", (e) => {
            e.preventDefault()
            this.saveConfigGeneral()
        })

        document.getElementById("configAlquileresForm")?.addEventListener("submit", (e) => {
            e.preventDefault()
            this.saveConfigAlquileres()
        })
    }

    setupFilters() {
        // Filtros de vehículos
        ;["searchVehiculos", "filterMarca", "filterEstado"].forEach((id) => {
            document.getElementById(id)?.addEventListener("input", () => {
                this.filterVehiculos()
            })
        })

        // Filtros de usuarios
        ;["searchUsuarios", "filterRol", "filterNivel"].forEach((id) => {
            document.getElementById(id)?.addEventListener("input", () => {
                this.filterUsuarios()
            })
        })

        // Filtros de alquileres
        ;["filterEstadoAlquiler", "filterFechaDesde", "filterFechaHasta"].forEach((id) => {
            document.getElementById(id)?.addEventListener("input", () => {
                this.filterAlquileres()
            })
        })

        // Limpiar filtros
        document.getElementById("clearFilters")?.addEventListener("click", () => {
            this.clearFilters()
        })
    }

    // Navegación
    switchTab(tabName) {
        // Actualizar navegación
        document.querySelectorAll(".nav-link").forEach((link) => {
            link.classList.remove("active")
        })
        document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")

        // Mostrar contenido
        document.querySelectorAll(".tab-content").forEach((content) => {
            content.classList.remove("active")
        })
        document.getElementById(`${tabName}-tab`).classList.add("active")

        this.currentTab = tabName
        this.loadTabData(tabName)
    }

    // Cargar datos
    async loadInitialData() {
        try {
            await Promise.all([this.loadVehiculos(), this.loadUsuarios(), this.loadAlquileres()])
            this.updateCounts()
            this.loadDashboardData()
        } catch (error) {
            console.error("Error loading initial data:", error)
            this.showToast("Error", "Error al cargar datos iniciales", "danger")
            // Cargar datos de ejemplo
            this.loadMockData()
        }
    }

    loadMockData() {
        // Datos de ejemplo para desarrollo
        this.data.vehiculos = [
            {
                id: 1,
                marca: "BMW",
                modelo: "X5",
                matricula: "ABC-1234",
                precio: 85,
                disponible: true,
                imagen: "/placeholder.svg?height=60&width=80",
            },
            {
                id: 2,
                marca: "Audi",
                modelo: "A4",
                matricula: "DEF-5678",
                precio: 65,
                disponible: false,
                imagen: "/placeholder.svg?height=60&width=80",
            },
            {
                id: 3,
                marca: "Mercedes",
                modelo: "C-Class",
                matricula: "GHI-9012",
                precio: 75,
                disponible: true,
                imagen: "/placeholder.svg?height=60&width=80",
            },
        ]

        this.data.usuarios = [
            {
                id: 1,
                nombre: "Juan Pérez",
                email: "juan@example.com",
                rol: "USER",
                fechaRegistro: "2024-01-15",
            },
            {
                id: 2,
                nombre: "María García",
                email: "maria@example.com",
                rol: "ADMIN",
                fechaRegistro: "2024-02-20",
            },
            {
                id: 3,
                nombre: "Carlos López",
                email: "carlos@example.com",
                rol: "USER",
                fechaRegistro: "2024-03-10",
            },
        ]

        this.data.alquileres = [
            {
                id: 1,
                usuarioId: 1,
                vehiculoId: 1,
                fechaInicio: "2024-01-20",
                fechaFin: "2024-01-25",
            },
            {
                id: 2,
                usuarioId: 3,
                vehiculoId: 2,
                fechaInicio: "2024-02-15",
                fechaFin: "2024-02-20",
            },
        ]

        this.updateCounts()
        this.loadDashboardData()
    }

    async loadTabData(tabName) {
        switch (tabName) {
            case "dashboard":
                this.loadDashboardData()
                break
            case "vehiculos":
                this.renderVehiculos()
                break
            case "usuarios":
                this.renderUsuarios()
                break
            case "alquileres":
                this.renderAlquileres()
                break
            case "analytics":
                this.loadAnalytics()
                break
        }
    }

    async loadVehiculos() {
        try {
            const response = await fetch("http://localhost:8080/api/vehiculos", {
                headers: { Authorization: `Bearer ${this.getToken()}` },
            })

            if (!response.ok) throw new Error("Error al cargar vehículos")

            this.data.vehiculos = await response.json()
            return this.data.vehiculos
        } catch (error) {
            console.error("Error loading vehiculos:", error)
            throw error
        }
    }

    async loadUsuarios() {
        try {
            const response = await fetch("http://localhost:8080/api/usuarios", {
                headers: { Authorization: `Bearer ${this.getToken()}` },
            })

            if (!response.ok) throw new Error("Error al cargar usuarios")

            this.data.usuarios = await response.json()
            return this.data.usuarios
        } catch (error) {
            console.error("Error loading usuarios:", error)
            throw error
        }
    }

    async loadAlquileres() {
        try {
            const response = await fetch("http://localhost:8080/api/alquileres", {
                headers: { Authorization: `Bearer ${this.getToken()}` },
            })

            if (!response.ok) throw new Error("Error al cargar alquileres")

            this.data.alquileres = await response.json()
            return this.data.alquileres
        } catch (error) {
            console.error("Error loading alquileres:", error)
            throw error
        }
    }

    // Dashboard
    loadDashboardData() {
        this.updateStats()
        this.renderRecentRentals()
        this.renderTopVehicles()
    }

    updateStats() {
        document.getElementById("totalVehiculos").textContent = this.data.vehiculos.length
        document.getElementById("totalUsuarios").textContent = this.data.usuarios.length
        document.getElementById("totalAlquileres").textContent = this.data.alquileres.length

        const ingresos = this.calculateTotalRevenue()
        document.getElementById("totalIngresos").textContent = `${ingresos.toFixed(2)}€`
    }

    updateCounts() {
        document.getElementById("vehiculosCount").textContent = this.data.vehiculos.length
        document.getElementById("usuariosCount").textContent = this.data.usuarios.length
        document.getElementById("alquileresCount").textContent = this.data.alquileres.length
    }

    calculateTotalRevenue() {
        return this.data.alquileres.reduce((total, alquiler) => {
            const vehiculo = this.data.vehiculos.find((v) => v.id === alquiler.vehiculoId)
            if (!vehiculo) return total

            const fechaInicio = new Date(alquiler.fechaInicio)
            const fechaFin = new Date(alquiler.fechaFin)
            const dias = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24))

            return total + dias * vehiculo.precio
        }, 0)
    }

    renderRecentRentals() {
        const tbody = document.getElementById("recentRentalsTable")
        if (!tbody) return

        const recentRentals = this.data.alquileres
            .sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio))
            .slice(0, 5)

        tbody.innerHTML = recentRentals
            .map((alquiler) => {
                const usuario = this.data.usuarios.find((u) => u.id === alquiler.usuarioId)
                const vehiculo = this.data.vehiculos.find((v) => v.id === alquiler.vehiculoId)
                const estado = this.getAlquilerEstado(alquiler)

                return `
        <tr>
          <td>#${alquiler.id}</td>
          <td>${usuario?.nombre || "Desconocido"}</td>
          <td>${vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : "Desconocido"}</td>
          <td>${this.formatDate(alquiler.fechaInicio)}</td>
          <td><span class="badge ${estado.class}">${estado.text}</span></td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="admin.editAlquiler(${alquiler.id})">
              <i class="bi bi-pencil"></i>
            </button>
          </td>
        </tr>
      `
            })
            .join("")
    }

    renderTopVehicles() {
        const container = document.getElementById("topVehiclesChart")
        if (!container) return

        const vehiculoCounts = {}
        this.data.alquileres.forEach((alquiler) => {
            vehiculoCounts[alquiler.vehiculoId] = (vehiculoCounts[alquiler.vehiculoId] || 0) + 1
        })

        const topVehiculos = Object.entries(vehiculoCounts)
            .map(([id, count]) => {
                const vehiculo = this.data.vehiculos.find((v) => v.id === Number.parseInt(id))
                return vehiculo ? { vehiculo, count } : null
            })
            .filter(Boolean)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

        container.innerHTML = topVehiculos
            .map((item) => {
                const percentage = Math.round((item.count / this.data.alquileres.length) * 100)
                return `
        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span>${item.vehiculo.marca} ${item.vehiculo.modelo}</span>
            <span class="badge bg-primary">${item.count}</span>
          </div>
          <div class="progress" style="height: 8px;">
            <div class="progress-bar" style="width: ${percentage}%"></div>
          </div>
        </div>
      `
            })
            .join("")
    }

    // Renderizado de tablas
    renderVehiculos() {
        const tbody = document.getElementById("vehiculosTableBody")
        if (!tbody) return

        const vehiculos = this.getFilteredVehiculos()
        document.getElementById("vehiculosTotal").textContent = vehiculos.length

        tbody.innerHTML = vehiculos
            .map((vehiculo) => {
                const alquileresCount = this.data.alquileres.filter((a) => a.vehiculoId === vehiculo.id).length
                const ingresos = this.calculateVehiculoRevenue(vehiculo.id)

                return `
        <tr>
          <td><input type="checkbox" value="${vehiculo.id}"></td>
          <td>
            <div class="d-flex align-items-center gap-3">
              <img src="${vehiculo.imagen || "img/car-placeholder.jpg"}" 
                   alt="${vehiculo.marca} ${vehiculo.modelo}" 
                   style="width: 60px; height: 40px; object-fit: cover; border-radius: 8px;">
              <div>
                <strong>${vehiculo.marca} ${vehiculo.modelo}</strong>
                <br>
                <small class="text-muted">${vehiculo.matricula}</small>
              </div>
            </div>
          </td>
          <td><strong>${vehiculo.precio}€</strong></td>
          <td>
            <span class="badge ${vehiculo.disponible ? "bg-success" : "bg-danger"}">
              ${vehiculo.disponible ? "Disponible" : "No disponible"}
            </span>
          </td>
          <td>${alquileresCount}</td>
          <td>${ingresos.toFixed(2)}€</td>
          <td>
            <div class="btn-group">
              <button class="btn btn-sm btn-outline-primary" onclick="admin.editVehiculo(${vehiculo.id})">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="admin.deleteVehiculo(${vehiculo.id})">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `
            })
            .join("")
    }

    renderUsuarios() {
        const tbody = document.getElementById("usuariosTableBody")
        if (!tbody) return

        const usuarios = this.getFilteredUsuarios()

        tbody.innerHTML = usuarios
            .map((usuario) => {
                const alquileresCount = this.data.alquileres.filter((a) => a.usuarioId === usuario.id).length
                const nivel = this.getUserLevel(usuario)

                return `
        <tr>
          <td>
            <div class="d-flex align-items-center gap-3">
              <div class="user-avatar ${nivel.class}" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; background: ${nivel.color};">
                ${usuario.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <strong class="user-name-${nivel.name.toLowerCase()}">${usuario.nombre}</strong>
                <br>
                <small class="text-muted">ID: ${usuario.id}</small>
              </div>
            </div>
          </td>
          <td>${usuario.email}</td>
          <td>
            <span class="badge ${usuario.rol === "ADMIN" ? "bg-danger" : "bg-primary"}">
              ${usuario.rol}
            </span>
          </td>
          <td>
            <span class="level-badge-${nivel.name.toLowerCase()}">
              ${nivel.name}
            </span>
          </td>
          <td>${alquileresCount}</td>
          <td>${this.formatDate(usuario.fechaRegistro || new Date())}</td>
          <td>
            <div class="btn-group">
              <button class="btn btn-sm btn-outline-primary" onclick="admin.editUsuario(${usuario.id})">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="admin.deleteUsuario(${usuario.id})">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `
            })
            .join("")
    }

    renderAlquileres() {
        const tbody = document.getElementById("alquileresTableBody")
        if (!tbody) return

        const alquileres = this.getFilteredAlquileres()

        tbody.innerHTML = alquileres
            .map((alquiler) => {
                const usuario = this.data.usuarios.find((u) => u.id === alquiler.usuarioId)
                const vehiculo = this.data.vehiculos.find((v) => v.id === alquiler.vehiculoId)
                const estado = this.getAlquilerEstado(alquiler)
                const total = this.calculateAlquilerTotal(alquiler)

                return `
        <tr>
          <td>#${alquiler.id}</td>
          <td>${usuario?.nombre || "Desconocido"}</td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <img src="${vehiculo?.imagen || "img/car-placeholder.jpg"}" 
                   alt="${vehiculo?.marca} ${vehiculo?.modelo}" 
                   style="width: 40px; height: 30px; object-fit: cover; border-radius: 4px;">
              <span>${vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : "Desconocido"}</span>
            </div>
          </td>
          <td>${this.formatDate(alquiler.fechaInicio)}</td>
          <td>${this.formatDate(alquiler.fechaFin)}</td>
          <td><strong>${total.toFixed(2)}€</strong></td>
          <td><span class="badge ${estado.class}">${estado.text}</span></td>
          <td>
            <div class="btn-group">
              <button class="btn btn-sm btn-outline-primary" onclick="admin.editAlquiler(${alquiler.id})">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="admin.deleteAlquiler(${alquiler.id})">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `
            })
            .join("")
    }

    // Filtros
    getFilteredVehiculos() {
        let vehiculos = [...this.data.vehiculos]

        const search = document.getElementById("searchVehiculos")?.value.toLowerCase()
        const marca = document.getElementById("filterMarca")?.value
        const estado = document.getElementById("filterEstado")?.value

        if (search) {
            vehiculos = vehiculos.filter(
                (v) =>
                    v.marca.toLowerCase().includes(search) ||
                    v.modelo.toLowerCase().includes(search) ||
                    v.matricula.toLowerCase().includes(search),
            )
        }

        if (marca) {
            vehiculos = vehiculos.filter((v) => v.marca === marca)
        }

        if (estado) {
            vehiculos = vehiculos.filter((v) => {
                if (estado === "disponible") return v.disponible
                if (estado === "alquilado") return !v.disponible
                return true
            })
        }

        return vehiculos
    }

    getFilteredUsuarios() {
        let usuarios = [...this.data.usuarios]

        const search = document.getElementById("searchUsuarios")?.value.toLowerCase()
        const rol = document.getElementById("filterRol")?.value
        const nivel = document.getElementById("filterNivel")?.value

        if (search) {
            usuarios = usuarios.filter(
                (u) => u.nombre.toLowerCase().includes(search) || u.email.toLowerCase().includes(search),
            )
        }

        if (rol) {
            usuarios = usuarios.filter((u) => u.rol === rol)
        }

        if (nivel) {
            usuarios = usuarios.filter((u) => this.getUserLevel(u).name === nivel)
        }

        return usuarios
    }

    getFilteredAlquileres() {
        let alquileres = [...this.data.alquileres]

        const estado = document.getElementById("filterEstadoAlquiler")?.value
        const fechaDesde = document.getElementById("filterFechaDesde")?.value
        const fechaHasta = document.getElementById("filterFechaHasta")?.value

        if (estado) {
            alquileres = alquileres.filter((a) => {
                const estadoActual = this.getAlquilerEstado(a)
                return estadoActual.text.toLowerCase() === estado
            })
        }

        if (fechaDesde) {
            alquileres = alquileres.filter((a) => new Date(a.fechaInicio) >= new Date(fechaDesde))
        }

        if (fechaHasta) {
            alquileres = alquileres.filter((a) => new Date(a.fechaFin) <= new Date(fechaHasta))
        }

        return alquileres
    }

    clearFilters() {
        document.querySelectorAll(".filter-input, .filter-select").forEach((input) => {
            input.value = ""
        })
        this.filterVehiculos()
        this.filterUsuarios()
        this.filterAlquileres()
    }

    filterVehiculos() {
        this.renderVehiculos()
    }

    filterUsuarios() {
        this.renderUsuarios()
    }

    filterAlquileres() {
        this.renderAlquileres()
    }

    // CRUD Operations
    openVehiculoModal(vehiculo = null) {
        const modal = new bootstrap.Modal(document.getElementById("vehiculoModal"))
        const form = document.getElementById("vehiculoForm")

        if (vehiculo) {
            document.getElementById("vehiculoModalLabel").textContent = "Editar Vehículo"
            document.getElementById("vehiculoId").value = vehiculo.id
            document.getElementById("vehiculoMarca").value = vehiculo.marca
            document.getElementById("vehiculoModelo").value = vehiculo.modelo
            document.getElementById("vehiculoMatricula").value = vehiculo.matricula
            document.getElementById("vehiculoPrecio").value = vehiculo.precio
            document.getElementById("vehiculoImagen").value = vehiculo.imagen || ""
            document.getElementById("vehiculoLatitud").value = vehiculo.latitud || ""
            document.getElementById("vehiculoLongitud").value = vehiculo.longitud || ""
            document.getElementById("vehiculoDisponible").checked = vehiculo.disponible
        } else {
            document.getElementById("vehiculoModalLabel").textContent = "Nuevo Vehículo"
            form.reset()
            document.getElementById("vehiculoId").value = ""
        }

        modal.show()
    }

    async saveVehiculo() {
        try {
            const id = document.getElementById("vehiculoId").value
            const vehiculoData = {
                marca: document.getElementById("vehiculoMarca").value,
                modelo: document.getElementById("vehiculoModelo").value,
                matricula: document.getElementById("vehiculoMatricula").value,
                precio: Number.parseFloat(document.getElementById("vehiculoPrecio").value),
                imagen: document.getElementById("vehiculoImagen").value,
                latitud: document.getElementById("vehiculoLatitud").value
                    ? Number.parseFloat(document.getElementById("vehiculoLatitud").value)
                    : null,
                longitud: document.getElementById("vehiculoLongitud").value
                    ? Number.parseFloat(document.getElementById("vehiculoLongitud").value)
                    : null,
                disponible: document.getElementById("vehiculoDisponible").checked,
            }

            if (id) {
                // Actualizar vehículo existente
                const index = this.data.vehiculos.findIndex((v) => v.id === Number.parseInt(id))
                if (index !== -1) {
                    this.data.vehiculos[index] = { ...this.data.vehiculos[index], ...vehiculoData }
                }
            } else {
                // Crear nuevo vehículo
                const newId = Math.max(...this.data.vehiculos.map((v) => v.id), 0) + 1
                this.data.vehiculos.push({ id: newId, ...vehiculoData })
            }

            bootstrap.Modal.getInstance(document.getElementById("vehiculoModal")).hide()
            this.renderVehiculos()
            this.updateCounts()

            this.showToast("Éxito", `Vehículo ${id ? "actualizado" : "creado"} correctamente`, "success")
        } catch (error) {
            console.error("Error saving vehiculo:", error)
            this.showToast("Error", "Error al guardar vehículo", "danger")
        }
    }

    editVehiculo(id) {
        const vehiculo = this.data.vehiculos.find((v) => v.id === id)
        if (vehiculo) {
            this.openVehiculoModal(vehiculo)
        }
    }

    async deleteVehiculo(id) {
        if (!confirm("¿Estás seguro de que deseas eliminar este vehículo?")) return

        try {
            const index = this.data.vehiculos.findIndex((v) => v.id === id)
            if (index !== -1) {
                this.data.vehiculos.splice(index, 1)
            }

            this.renderVehiculos()
            this.updateCounts()

            this.showToast("Éxito", "Vehículo eliminado correctamente", "success")
        } catch (error) {
            console.error("Error deleting vehiculo:", error)
            this.showToast("Error", "Error al eliminar vehículo", "danger")
        }
    }

    // Usuario CRUD
    openUsuarioModal(usuario = null) {
        const modal = new bootstrap.Modal(document.getElementById("usuarioModal"))
        const form = document.getElementById("usuarioForm")

        if (usuario) {
            document.getElementById("usuarioModalLabel").textContent = "Editar Usuario"
            document.getElementById("usuarioId").value = usuario.id
            document.getElementById("usuarioNombre").value = usuario.nombre
            document.getElementById("usuarioEmail").value = usuario.email
            document.getElementById("usuarioPassword").value = ""
            document.getElementById("usuarioRol").value = usuario.rol
        } else {
            document.getElementById("usuarioModalLabel").textContent = "Nuevo Usuario"
            form.reset()
            document.getElementById("usuarioId").value = ""
        }

        modal.show()
    }

    async saveUsuario() {
        try {
            const id = document.getElementById("usuarioId").value
            const usuarioData = {
                nombre: document.getElementById("usuarioNombre").value,
                email: document.getElementById("usuarioEmail").value,
                rol: document.getElementById("usuarioRol").value,
            }

            const password = document.getElementById("usuarioPassword").value
            if (password) usuarioData.password = password

            if (id) {
                // Actualizar usuario existente
                const index = this.data.usuarios.findIndex((u) => u.id === Number.parseInt(id))
                if (index !== -1) {
                    this.data.usuarios[index] = { ...this.data.usuarios[index], ...usuarioData }
                }
            } else {
                // Crear nuevo usuario
                const newId = Math.max(...this.data.usuarios.map((u) => u.id), 0) + 1
                this.data.usuarios.push({
                    id: newId,
                    ...usuarioData,
                    fechaRegistro: new Date().toISOString().split("T")[0],
                })
            }

            bootstrap.Modal.getInstance(document.getElementById("usuarioModal")).hide()
            this.renderUsuarios()
            this.updateCounts()

            this.showToast("Éxito", `Usuario ${id ? "actualizado" : "creado"} correctamente`, "success")
        } catch (error) {
            console.error("Error saving usuario:", error)
            this.showToast("Error", "Error al guardar usuario", "danger")
        }
    }

    editUsuario(id) {
        const usuario = this.data.usuarios.find((u) => u.id === id)
        if (usuario) {
            this.openUsuarioModal(usuario)
        }
    }

    async deleteUsuario(id) {
        if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return

        try {
            const index = this.data.usuarios.findIndex((u) => u.id === id)
            if (index !== -1) {
                this.data.usuarios.splice(index, 1)
            }

            this.renderUsuarios()
            this.updateCounts()

            this.showToast("Éxito", "Usuario eliminado correctamente", "success")
        } catch (error) {
            console.error("Error deleting usuario:", error)
            this.showToast("Error", "Error al eliminar usuario", "danger")
        }
    }

    // Alquiler CRUD
    openAlquilerModal(alquiler = null) {
        const modal = new bootstrap.Modal(document.getElementById("alquilerModal"))
        const form = document.getElementById("alquilerForm")

        // Llenar selects
        this.populateUsuarioSelect()
        this.populateVehiculoSelect()

        if (alquiler) {
            document.getElementById("alquilerModalLabel").textContent = "Editar Alquiler"
            document.getElementById("alquilerId").value = alquiler.id
            document.getElementById("alquilerUsuario").value = alquiler.usuarioId
            document.getElementById("alquilerVehiculo").value = alquiler.vehiculoId
            document.getElementById("alquilerFechaInicio").value = alquiler.fechaInicio
            document.getElementById("alquilerFechaFin").value = alquiler.fechaFin
        } else {
            document.getElementById("alquilerModalLabel").textContent = "Nuevo Alquiler"
            form.reset()
            document.getElementById("alquilerId").value = ""
        }

        modal.show()
    }

    populateUsuarioSelect() {
        const select = document.getElementById("alquilerUsuario")
        select.innerHTML = '<option value="">Seleccionar usuario</option>'
        this.data.usuarios.forEach((usuario) => {
            select.innerHTML += `<option value="${usuario.id}">${usuario.nombre} (${usuario.email})</option>`
        })
    }

    populateVehiculoSelect() {
        const select = document.getElementById("alquilerVehiculo")
        select.innerHTML = '<option value="">Seleccionar vehículo</option>'
        this.data.vehiculos
            .filter((v) => v.disponible)
            .forEach((vehiculo) => {
                select.innerHTML += `<option value="${vehiculo.id}">${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.matricula})</option>`
            })
    }

    async saveAlquiler() {
        try {
            const id = document.getElementById("alquilerId").value
            const alquilerData = {
                usuarioId: Number.parseInt(document.getElementById("alquilerUsuario").value),
                vehiculoId: Number.parseInt(document.getElementById("alquilerVehiculo").value),
                fechaInicio: document.getElementById("alquilerFechaInicio").value,
                fechaFin: document.getElementById("alquilerFechaFin").value,
            }

            if (id) {
                // Actualizar alquiler existente
                const index = this.data.alquileres.findIndex((a) => a.id === Number.parseInt(id))
                if (index !== -1) {
                    this.data.alquileres[index] = { ...this.data.alquileres[index], ...alquilerData }
                }
            } else {
                // Crear nuevo alquiler
                const newId = Math.max(...this.data.alquileres.map((a) => a.id), 0) + 1
                this.data.alquileres.push({ id: newId, ...alquilerData })
            }

            bootstrap.Modal.getInstance(document.getElementById("alquilerModal")).hide()
            this.renderAlquileres()
            this.updateCounts()

            this.showToast("Éxito", `Alquiler ${id ? "actualizado" : "creado"} correctamente`, "success")
        } catch (error) {
            console.error("Error saving alquiler:", error)
            this.showToast("Error", "Error al guardar alquiler", "danger")
        }
    }

    editAlquiler(id) {
        const alquiler = this.data.alquileres.find((a) => a.id === id)
        if (alquiler) {
            this.openAlquilerModal(alquiler)
        }
    }

    async deleteAlquiler(id) {
        if (!confirm("¿Estás seguro de que deseas eliminar este alquiler?")) return

        try {
            const index = this.data.alquileres.findIndex((a) => a.id === id)
            if (index !== -1) {
                this.data.alquileres.splice(index, 1)
            }

            this.renderAlquileres()
            this.updateCounts()

            this.showToast("Éxito", "Alquiler eliminado correctamente", "success")
        } catch (error) {
            console.error("Error deleting alquiler:", error)
            this.showToast("Error", "Error al eliminar alquiler", "danger")
        }
    }

    // Utilidades
    getUserLevel(usuario) {
        const alquileresCount = this.data.alquileres.filter((a) => a.usuarioId === usuario.id).length

        if (alquileresCount >= 20) return { name: "DIAMANTE", color: "#00bfff", class: "diamante" }
        if (alquileresCount >= 10) return { name: "ORO", color: "#ffd700", class: "oro" }
        if (alquileresCount >= 5) return { name: "PLATA", color: "#c0c0c0", class: "plata" }
        return { name: "BRONCE", color: "#cd7f32", class: "bronce" }
    }

    getAlquilerEstado(alquiler) {
        const fechaInicio = new Date(alquiler.fechaInicio)
        const fechaFin = new Date(alquiler.fechaFin)
        const hoy = new Date()

        if (fechaInicio <= hoy && fechaFin >= hoy) {
            return { text: "Activo", class: "bg-success" }
        }
        if (fechaFin < hoy) {
            return { text: "Completado", class: "bg-secondary" }
        }
        return { text: "Pendiente", class: "bg-warning" }
    }

    calculateVehiculoRevenue(vehiculoId) {
        return this.data.alquileres
            .filter((a) => a.vehiculoId === vehiculoId)
            .reduce((total, alquiler) => {
                const vehiculo = this.data.vehiculos.find((v) => v.id === vehiculoId)
                if (!vehiculo) return total

                const fechaInicio = new Date(alquiler.fechaInicio)
                const fechaFin = new Date(alquiler.fechaFin)
                const dias = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24))

                return total + dias * vehiculo.precio
            }, 0)
    }

    calculateAlquilerTotal(alquiler) {
        const vehiculo = this.data.vehiculos.find((v) => v.id === alquiler.vehiculoId)
        if (!vehiculo) return 0

        const fechaInicio = new Date(alquiler.fechaInicio)
        const fechaFin = new Date(alquiler.fechaFin)
        const dias = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24))

        return dias * vehiculo.precio
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString("es-ES")
    }

    // Analytics
    loadAnalytics() {
        this.createRevenueChart()
        this.createProfitableVehiclesChart()
        this.createUserLevelsChart()
        this.createRentalTrendChart()
    }

    createRevenueChart() {
        const ctx = document.getElementById("revenueChart")
        if (!ctx) return

        // Datos de ejemplo para ingresos por mes
        const data = {
            labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
            datasets: [
                {
                    label: "Ingresos (€)",
                    data: [12000, 15000, 18000, 22000, 25000, 28000],
                    borderColor: "#2563eb",
                    backgroundColor: "rgba(37, 99, 235, 0.1)",
                    tension: 0.4,
                },
            ],
        }

        new Chart(ctx, {
            type: "line",
            data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        })
    }

    createProfitableVehiclesChart() {
        const ctx = document.getElementById("profitableVehiclesChart")
        if (!ctx) return

        const vehiculoIngresos = this.data.vehiculos.map((vehiculo) => ({
            vehiculo,
            ingresos: this.calculateVehiculoRevenue(vehiculo.id),
        }))

        vehiculoIngresos.sort((a, b) => b.ingresos - a.ingresos)
        const top5 = vehiculoIngresos.slice(0, 5)

        const data = {
            labels: top5.map((item) => `${item.vehiculo.marca} ${item.vehiculo.modelo}`),
            datasets: [
                {
                    data: top5.map((item) => item.ingresos),
                    backgroundColor: ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"],
                },
            ],
        }

        new Chart(ctx, {
            type: "doughnut",
            data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom",
                    },
                },
            },
        })
    }

    createUserLevelsChart() {
        const ctx = document.getElementById("userLevelsChart")
        if (!ctx) return

        const niveles = { BRONCE: 0, PLATA: 0, ORO: 0, DIAMANTE: 0 }

        this.data.usuarios.forEach((usuario) => {
            const nivel = this.getUserLevel(usuario)
            niveles[nivel.name]++
        })

        const data = {
            labels: Object.keys(niveles),
            datasets: [
                {
                    data: Object.values(niveles),
                    backgroundColor: ["#cd7f32", "#c0c0c0", "#ffd700", "#00bfff"],
                },
            ],
        }

        new Chart(ctx, {
            type: "pie",
            data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom",
                    },
                },
            },
        })
    }

    createRentalTrendChart() {
        const ctx = document.getElementById("rentalTrendChart")
        if (!ctx) return

        // Datos de ejemplo para tendencia de alquileres
        const data = {
            labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
            datasets: [
                {
                    label: "Alquileres",
                    data: [45, 52, 48, 61, 55, 67],
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    tension: 0.4,
                },
            ],
        }

        new Chart(ctx, {
            type: "line",
            data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        })
    }

    // Exportar datos
    exportReport() {
        const data = {
            fecha: new Date().toISOString(),
            vehiculos: this.data.vehiculos.length,
            usuarios: this.data.usuarios.length,
            alquileres: this.data.alquileres.length,
            ingresos: this.calculateTotalRevenue(),
        }

        this.downloadJSON(data, "reporte-dashboard.json")
        this.showToast("Éxito", "Reporte exportado correctamente", "success")
    }

    exportVehiculos() {
        this.downloadJSON(this.data.vehiculos, "vehiculos.json")
        this.showToast("Éxito", "Vehículos exportados correctamente", "success")
    }

    exportUsuarios() {
        this.downloadJSON(this.data.usuarios, "usuarios.json")
        this.showToast("Éxito", "Usuarios exportados correctamente", "success")
    }

    exportAlquileres() {
        this.downloadJSON(this.data.alquileres, "alquileres.json")
        this.showToast("Éxito", "Alquileres exportados correctamente", "success")
    }

    importVehiculos() {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = ".json"
        input.onchange = (e) => {
            const file = e.target.files[0]
            if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result)
                        this.data.vehiculos = [...this.data.vehiculos, ...data]
                        this.renderVehiculos()
                        this.updateCounts()
                        this.showToast("Éxito", "Vehículos importados correctamente", "success")
                    } catch (error) {
                        this.showToast("Error", "Error al importar vehículos", "danger")
                    }
                }
                reader.readAsText(file)
            }
        }
        input.click()
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    // Configuración
    saveConfigGeneral() {
        this.showToast("Éxito", "Configuración general guardada", "success")
    }

    saveConfigAlquileres() {
        this.showToast("Éxito", "Configuración de alquileres guardada", "success")
    }

    // Búsqueda global
    globalSearch(query) {
        if (!query) return

        // Implementar búsqueda global aquí
        console.log("Búsqueda global:", query)
    }

    // Logout
    logout() {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "index.html"
    }

    // Toast notifications
    showToast(title, message, type = "info") {
        const toast = document.getElementById("toast")
        const toastTitle = document.getElementById("toastTitle")
        const toastMessage = document.getElementById("toastMessage")

        toastTitle.textContent = title
        toastMessage.textContent = message

        // Cambiar color según el tipo
        toast.className = `toast ${type === "success" ? "bg-success text-white" : type === "danger" ? "bg-danger text-white" : ""}`

        const bsToast = new bootstrap.Toast(toast)
        bsToast.show()
    }
}

// Inicializar la aplicación
let admin
document.addEventListener("DOMContentLoaded", () => {
    admin = new AdminPremium()
})
