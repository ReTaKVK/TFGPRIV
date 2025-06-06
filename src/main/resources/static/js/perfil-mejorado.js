// Asegurar que las funciones del navbar estén disponibles
if (typeof requireAuth === "undefined") {
    window.requireAuth = () => {
        if (!isAuthenticated()) {
            sessionStorage.setItem("redirectAfterLogin", window.location.href)
            window.location.href = "index.html"
            return false
        }
        return true
    }
}

if (typeof getToken === "undefined") {
    window.getToken = () => localStorage.getItem("token")
}

if (typeof showToast === "undefined") {
    window.showToast = (title, message, type = "success") => {
        console.log(`[${type.toUpperCase()}] ${title}: ${message}`)
    }
}

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

        // Cargar estadísticas y alquileres PRIMERO
        await Promise.all([loadUserStats(), loadUserRentals()])

        // DESPUÉS actualizar la UI con el nivel correcto
        displayUserProfile(userProfile)

        // Actualizar UI para mostrar nivel actual en la sección de beneficios
        const levelInfo = calculateLevelProgress(userStats.totalRentals)
        updateCurrentLevelUI(levelInfo.currentLevel)

        // Configurar opciones de accesibilidad
        setupAccessibilityOptions()

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

    // Nivel de membresía - USAR EL NIVEL CALCULADO
    const nivelActual = determinarNivelPorAlquileres(userStats.totalRentals || 0)
    const nivelInfo = getNivelInfo(nivelActual)
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

            // Actualizar el nivel del usuario basado en alquileres reales
            const nivelCalculado = determinarNivelPorAlquileres(userStats.totalRentals)
            userProfile.nivelUsuario = nivelCalculado

            // Actualizar localStorage con el nivel correcto
            const updatedUser = { ...userProfile, nivelUsuario: nivelCalculado }
            localStorage.setItem("user", JSON.stringify(updatedUser))

            // Actualizar navbar si existe la función
            if (window.updateNavbarButtons) {
                window.updateNavbarButtons()
            }

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

// Función para actualizar la UI según el nivel actual
function updateCurrentLevelUI(currentLevel) {
    // Resaltar la tarjeta del nivel actual
    document.querySelectorAll(".level-card").forEach((card) => {
        card.classList.remove("current-level")
    })

    // Añadir clase para resaltar el nivel actual
    const levelMap = {
        BRONCE: "bronce",
        PLATA: "plata",
        ORO: "oro",
        DIAMANTE: "diamante",
    }

    const currentLevelCard = document.querySelector(`.level-card.${levelMap[currentLevel]}`)
    if (currentLevelCard) {
        currentLevelCard.classList.add("current-level")

        // Añadir indicador de nivel actual
        const levelHeader = currentLevelCard.querySelector(".level-header")
        if (levelHeader) {
            // Eliminar indicador existente si hay
            const existingIndicator = currentLevelCard.querySelector(".current-level-indicator")
            if (existingIndicator) existingIndicator.remove()

            // Añadir nuevo indicador
            const indicator = document.createElement("div")
            indicator.className = "current-level-indicator"
            indicator.innerHTML = '<i class="bi bi-check-circle-fill"></i> Tu nivel actual'
            levelHeader.appendChild(indicator)
        }
    }

    // Actualizar información sobre el nivel actual
    const nivelInfo = getNivelInfo(currentLevel)
    const currentLevelDisplay = document.getElementById("current-level-display")
    const currentDiscount = document.getElementById("current-discount")

    if (currentLevelDisplay) {
        currentLevelDisplay.textContent = nivelInfo.nombre
        currentLevelDisplay.style.color = nivelInfo.color
    }

    if (currentDiscount) {
        currentDiscount.textContent = getLevelDiscount(currentLevel)
    }
}

// Función para obtener el descuento según el nivel
function getLevelDiscount(level) {
    const discounts = {
        BRONCE: 0,
        PLATA: 5,
        ORO: 10,
        DIAMANTE: 15,
    }
    return discounts[level] || 0
}

// Función para cargar alquileres del usuario
async function loadUserRentals() {
    try {
        const token = getToken()
        if (!token) {
            // Si no tienes token, no puedes cargar
            showToast("Error", "No estás autenticado", "error")
            return
        }

        const response = await fetch(`https://tfgpriv.onrender.com/api/alquileres/usuario/${userProfile.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (response.ok) {
            userRentals = await response.json()

            if (userRentals.length === 0) {
                document.getElementById("no-rentals").classList.remove("d-none")
                document.getElementById("rentals-container").classList.add("d-none")
                return
            }

            // Cargar info de vehículos para mostrar detalles
            await loadVehiclesInfo()

            // Mostrar alquileres en la tabla
            displayUserRentals()

            // Mostrar la sección
            document.getElementById("rentals-container").classList.remove("d-none")
            document.getElementById("no-rentals").classList.add("d-none")
        } else {
            // Si hubo error
            throw new Error("No se pudieron cargar los alquileres")
        }
    } catch (error) {
        console.error("Error al cargar alquileres:", error)
        document.getElementById("no-rentals").classList.remove("d-none")
        document.getElementById("rentals-container").classList.add("d-none")
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
        // Mejorar el parsing de fechas
        const fechaInicio = parseDate(rental.fechaInicio)
        const fechaFin = parseDate(rental.fechaFin)
        const hoy = new Date()

        // Estado
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
                <td>${formatDateSimple(fechaInicio)}</td>
                <td>${formatDateSimple(fechaFin)}</td>
                <td><span class="badge ${estadoClass}">${estado}</span></td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewRentalDetails(${rental.id})" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="downloadRentalPDF(${rental.id})" title="Descargar comprobante">
                            <i class="bi bi-file-earmark-pdf"></i>
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

    // Asegurarse de que vehiculo esté cargado
    const vehiculo = rental.vehiculo
    if (!vehiculo) {
        showToast("Error", "Información del vehículo no disponible", "error")
        return
    }

    // Calcular duración y precio total
    const fechaInicio = parseDate(rental.fechaInicio)
    const fechaFin = parseDate(rental.fechaFin)
    const duracionMs = fechaFin - fechaInicio
    const duracionDias = Math.ceil(duracionMs / (1000 * 60 * 60 * 24))
    const precioTotal = duracionDias * vehiculo.precio

    // Calcular descuento si aplica
    const nivelUsuario = determinarNivelPorAlquileres(userStats.totalRentals)
    const descuentoPorcentaje = getLevelDiscount(nivelUsuario)
    const descuento = descuentoPorcentaje > 0 ? (precioTotal * descuentoPorcentaje) / 100 : 0
    const precioFinal = precioTotal - descuento

    // Crear contenido del modal con datos del alquiler y vehículo
    const modalHtml = `
        <div class="modal fade" id="rentalDetailsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-info-circle me-2"></i>
                            Detalles Completos del Alquiler #${rental.id}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Información General -->
                        <div class="row mb-4">
                            <div class="col-12">
                                <div class="alert alert-info d-flex align-items-center">
                                    <i class="bi bi-info-circle-fill me-3" style="font-size: 1.5rem;"></i>
                                    <div>
                                        <h6 class="mb-1">Estado del Alquiler: <span class="badge ${fechaInicio <= new Date() && fechaFin >= new Date() ? "bg-success" : fechaFin < new Date() ? "bg-info" : "bg-warning"}">${fechaInicio <= new Date() && fechaFin >= new Date() ? "ACTIVO" : fechaFin < new Date() ? "COMPLETADO" : "PENDIENTE"}</span></h6>
                                        <p class="mb-0">Este alquiler tiene una duración de ${duracionDias} día${duracionDias !== 1 ? "s" : ""} y ${descuento > 0 ? `incluye un descuento del ${descuentoPorcentaje}% por tu nivel ${nivelUsuario}` : "no tiene descuentos aplicados"}.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <!-- Información del Vehículo -->
                            <div class="col-lg-6 mb-4">
                                <div class="card h-100">
                                    <div class="card-header bg-light">
                                        <h6 class="mb-0"><i class="bi bi-car-front me-2"></i>Información del Vehículo</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="text-center mb-3">
                                            <img src="${vehiculo.imagen || "/placeholder.svg?height=200&width=300"}" 
                                                class="img-fluid rounded shadow-sm" style="max-height: 200px; object-fit: cover;" 
                                                alt="${vehiculo.marca} ${vehiculo.modelo}"
                                                onerror="this.src='/placeholder.svg?height=200&width=300'">
                                        </div>
                                        <table class="table table-sm">
                                            <tbody>
                                                <tr>
                                                    <td><strong>Marca:</strong></td>
                                                    <td>${vehiculo.marca}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Modelo:</strong></td>
                                                    <td>${vehiculo.modelo}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Matrícula:</strong></td>
                                                    <td><span class="badge bg-secondary">${vehiculo.matricula || "No disponible"}</span></td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Precio por día:</strong></td>
                                                    <td><span class="text-success fw-bold">€${vehiculo.precio.toFixed(2)}</span></td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Disponibilidad:</strong></td>
                                                    <td><span class="badge ${vehiculo.disponible ? "bg-success" : "bg-danger"}">${vehiculo.disponible ? "Disponible" : "No disponible"}</span></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <!-- Información del Alquiler -->
                            <div class="col-lg-6 mb-4">
                                <div class="card h-100">
                                    <div class="card-header bg-light">
                                        <h6 class="mb-0"><i class="bi bi-calendar-event me-2"></i>Detalles del Período</h6>
                                    </div>
                                    <div class="card-body">
                                        <table class="table table-sm">
                                            <tbody>
                                                <tr>
                                                    <td><strong>Fecha de inicio:</strong></td>
                                                    <td>${formatDateTimeComplete(fechaInicio)}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Fecha de fin:</strong></td>
                                                    <td>${formatDateTimeComplete(fechaFin)}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Duración total:</strong></td>
                                                    <td><span class="badge bg-primary">${duracionDias} día${duracionDias !== 1 ? "s" : ""}</span></td>
                                                </tr>
                                                <tr>
                                                    <td><strong>ID del alquiler:</strong></td>
                                                    <td><code>#${rental.id}</code></td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Usuario ID:</strong></td>
                                                    <td><code>#${rental.usuarioId}</code></td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Vehículo ID:</strong></td>
                                                    <td><code>#${rental.vehiculoId}</code></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Resumen Financiero Detallado -->
                        <div class="row">
                            <div class="col-12">
                                <div class="card">
                                    <div class="card-header bg-success text-white">
                                        <h6 class="mb-0"><i class="bi bi-calculator me-2"></i>Resumen Financiero Completo</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-md-8">
                                                <table class="table table-borderless">
                                                    <tbody>
                                                        <tr>
                                                            <td>Precio base por día:</td>
                                                            <td class="text-end">€${vehiculo.precio.toFixed(2)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Número de días:</td>
                                                            <td class="text-end">${duracionDias}</td>
                                                        </tr>
                                                        <tr class="border-top">
                                                            <td><strong>Subtotal:</strong></td>
                                                            <td class="text-end"><strong>€${precioTotal.toFixed(2)}</strong></td>
                                                        </tr>
                                                        ${
        descuento > 0
            ? `
                                                        <tr class="text-success">
                                                            <td>Descuento nivel ${nivelUsuario} (${descuentoPorcentaje}%):</td>
                                                            <td class="text-end">-€${descuento.toFixed(2)}</td>
                                                        </tr>
                                                        `
            : ""
    }
                                                        <tr class="border-top">
                                                            <td class="fs-5"><strong>Total Final:</strong></td>
                                                            <td class="text-end fs-4 text-success"><strong>€${precioFinal.toFixed(2)}</strong></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div class="col-md-4">
                                                <div class="bg-light p-3 rounded text-center">
                                                    <h6>Ahorro Total</h6>
                                                    <div class="display-6 text-success">€${descuento.toFixed(2)}</div>
                                                    <small class="text-muted">Gracias a tu nivel ${nivelUsuario}</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Información Adicional -->
                        <div class="row mt-4">
                            <div class="col-12">
                                <div class="alert alert-light">
                                    <h6><i class="bi bi-lightbulb me-2"></i>Información Importante:</h6>
                                    <ul class="mb-0">
                                        <li>Recuerda presentar tu DNI/Pasaporte al recoger el vehículo</li>
                                        <li>El vehículo debe devolverse con el mismo nivel de combustible</li>
                                        <li>Cualquier daño será evaluado según nuestras políticas</li>
                                        <li>Puedes descargar el comprobante PDF para tus registros</li>
                                        ${descuento > 0 ? `<li class="text-success">¡Has ahorrado €${descuento.toFixed(2)} gracias a tu nivel ${nivelUsuario}!</li>` : ""}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-success" onclick="downloadRentalPDF(${rental.id})">
                            <i class="bi bi-file-earmark-pdf me-2"></i>Descargar Comprobante PDF
                        </button>
                        <button type="button" class="btn btn-outline-primary" onclick="window.print()">
                            <i class="bi bi-printer me-2"></i>Imprimir Detalles
                        </button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x-circle me-2"></i>Cerrar
                        </button>
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

    // Agregar nuevo modal al DOM
    document.body.insertAdjacentHTML("beforeend", modalHtml)

    // Mostrar modal usando Bootstrap 5
    const modalElement = document.getElementById("rentalDetailsModal")
    const bootstrap = window.bootstrap // Declare the bootstrap variable here
    const modal = new bootstrap.Modal(modalElement)
    modal.show()
}

// Función para descargar PDF del alquiler
async function downloadRentalPDF(rentalId) {
    try {
        showToast("Información", "Generando comprobante PDF...", "info")

        const rental = userRentals.find((r) => r.id === rentalId)
        if (!rental || !rental.vehiculo) {
            throw new Error("No se encontraron datos del alquiler")
        }

        // Cargar las bibliotecas necesarias
        await loadJsPDF()

        // Generar el PDF
        await window.generateTicketPDF(rental, rental.vehiculo, userProfile)

        showToast("Éxito", "Comprobante PDF descargado correctamente", "success")
    } catch (error) {
        console.error("Error al generar PDF:", error)
        showToast("Error", "Error al generar el comprobante PDF", "error")
    }
}

// Función para cargar jsPDF
async function loadJsPDF() {
    return new Promise((resolve, reject) => {
        // Si ya está cargado, resolver inmediatamente
        if (window.jspdf) {
            return resolve()
        }

        // Cargar jsPDF
        const script = document.createElement("script")
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        script.onload = () => {
            // Cargar el complemento para autoTabla
            const autoTableScript = document.createElement("script")
            autoTableScript.src =
                "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js"
            autoTableScript.onload = resolve
            autoTableScript.onerror = () => reject(new Error("No se pudo cargar jspdf-autotable"))
            document.head.appendChild(autoTableScript)
        }
        script.onerror = () => reject(new Error("No se pudo cargar jsPDF"))
        document.head.appendChild(script)
    })
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
    const modalElement = document.getElementById("cancelRentalModal")
    const bootstrap = window.bootstrap // Declare the bootstrap variable here
    const modal = new bootstrap.Modal(modalElement)
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
        if (window.updateNavbarButtons) {
            window.updateNavbarButtons()
        }

        showToast("Éxito", "Perfil actualizado correctamente", "success")
    } catch (error) {
        console.error("Error:", error)
        showToast("Error", error.message || "Error al actualizar el perfil", "error")
    }
}

// Configurar opciones de accesibilidad
function setupAccessibilityOptions() {
    // Cargar preferencias guardadas
    const savedDarkMode = localStorage.getItem("darkMode") === "enabled"
    const savedHighContrast = localStorage.getItem("highContrast") === "enabled"
    const savedFontSize = localStorage.getItem("fontSize") || "normal"

    // Aplicar preferencias
    document.body.classList.toggle("dark-mode", savedDarkMode)
    document.body.classList.toggle("high-contrast", savedHighContrast)
    document.body.className = document.body.className.replace(/font-size-\w+/g, "")
    document.body.classList.add(`font-size-${savedFontSize}`)

    // Actualizar controles
    const darkModeToggle = document.getElementById("darkModeToggle")
    const highContrastToggle = document.getElementById("highContrastToggle")

    if (darkModeToggle) darkModeToggle.checked = savedDarkMode
    if (highContrastToggle) highContrastToggle.checked = savedHighContrast

    // Añadir event listeners
    if (darkModeToggle) {
        darkModeToggle.addEventListener("change", function () {
            document.body.classList.toggle("dark-mode", this.checked)
            localStorage.setItem("darkMode", this.checked ? "enabled" : "disabled")
        })
    }

    if (highContrastToggle) {
        highContrastToggle.addEventListener("change", function () {
            document.body.classList.toggle("high-contrast", this.checked)
            localStorage.setItem("highContrast", this.checked ? "enabled" : "disabled")
        })
    }

    // Actualizar botones de tamaño de fuente
    document.querySelectorAll('.btn-group[role="group"] button').forEach((button) => {
        button.classList.toggle("active", button.dataset.size === savedFontSize)
    })
}

// Función para cambiar tamaño de fuente
function changeFontSize(size) {
    document.body.className = document.body.className.replace(/font-size-\w+/g, "")
    document.body.classList.add(`font-size-${size}`)
    localStorage.setItem("fontSize", size)

    // Actualizar botones
    document.querySelectorAll('.btn-group[role="group"] button').forEach((button) => {
        button.classList.toggle("active", button.dataset.size === size)
    })
}

// Función para mostrar pestaña
function showTab(tabId) {
    // Ocultar todas las pestañas
    document.querySelectorAll(".tab-pane").forEach((tab) => {
        tab.classList.remove("show", "active")
    })

    // Mostrar la pestaña seleccionada
    const selectedTab = document.getElementById(tabId)
    if (selectedTab) {
        selectedTab.classList.add("show", "active")
    }

    // Actualizar botones de navegación
    document.querySelectorAll(".profile-navigation button").forEach((button) => {
        button.classList.remove("active")
    })

    const activeButton = document.getElementById(`${tabId}-btn`)
    if (activeButton) {
        activeButton.classList.add("active")
    }
}

// Función para refrescar datos del usuario
function refreshUserProfile() {
    try {
        showToast("Información", "Actualizando datos...", "info")
        loadProfile()
        showToast("Éxito", "Datos actualizados correctamente", "success")
    } catch (error) {
        showToast("Error", "Error al actualizar los datos", "error")
    }
}

// Funciones auxiliares mejoradas para fechas
function parseDate(dateString) {
    if (!dateString) return new Date()

    try {
        // Si es un array de números [año, mes, día, hora, minuto, segundo]
        if (Array.isArray(dateString)) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = dateString
            return new Date(year, month - 1, day, hour, minute, second)
        }

        // Si es string
        if (typeof dateString === "string") {
            // Si contiene 'T', es formato ISO
            if (dateString.includes("T")) {
                return new Date(dateString)
            } else {
                // Si es formato YYYY-MM-DD, añadir tiempo para evitar problemas de zona horaria
                return new Date(dateString + "T00:00:00")
            }
        }

        // Si ya es Date
        return new Date(dateString)
    } catch (error) {
        console.error("Error al parsear fecha:", error)
        return new Date()
    }
}

function formatDateSimple(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return "Fecha no válida"
    }

    return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
}

function formatDateTimeComplete(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return "Fecha no válida"
    }

    return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    })
}

function formatDate(dateString) {
    const date = parseDate(dateString)
    return formatDateSimple(date)
}

function formatDateTime(date) {
    if (typeof date === "string") {
        date = parseDate(date)
    }
    return formatDateTimeComplete(date)
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

// Añadir esta función después de la función getNivelInfo:
function determinarNivelPorAlquileres(totalAlquileres) {
    if (totalAlquileres >= 30) {
        return "DIAMANTE"
    } else if (totalAlquileres >= 15) {
        return "ORO"
    } else if (totalAlquileres >= 5) {
        return "PLATA"
    } else {
        return "BRONCE"
    }
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

    toast.classList.remove("bg-success", "bg-danger", "bg-warning", "bg-info", "text-white")
    if (type === "success") {
        toast.classList.add("bg-success", "text-white")
    } else if (type === "error") {
        toast.classList.add("bg-danger", "text-white")
    } else if (type === "warning") {
        toast.classList.add("bg-warning")
    } else if (type === "info") {
        toast.classList.add("bg-info", "text-white")
    }

    const bsToast = new window.bootstrap.Toast(toast)
    bsToast.show()
}

function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    showToast("Sesión cerrada", "Has cerrado sesión correctamente")
    setTimeout(() => {
        window.location.href = "index.html"
    }, 1000)
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    // Inicializar perfil
    loadProfile()

    // Evento para confirmar la eliminación de la cuenta
    const deleteConfirmation = document.getElementById("delete-confirmation")
    const confirmDeleteAccount = document.getElementById("confirm-delete-account")

    if (deleteConfirmation && confirmDeleteAccount) {
        deleteConfirmation.addEventListener("input", function () {
            confirmDeleteAccount.disabled = this.value !== "ELIMINAR"
        })

        confirmDeleteAccount.addEventListener("click", () => {
            if (deleteConfirmation.value === "ELIMINAR") {
                showToast("Información", "Funcionalidad de eliminación de cuenta no implementada", "info")
            }
        })
    }

    // Evento para guardar la nueva contraseña
    const savePasswordBtn = document.getElementById("save-password-btn")
    if (savePasswordBtn) {
        savePasswordBtn.addEventListener("click", () => {
            const currentPassword = document.getElementById("current-password").value
            const newPassword = document.getElementById("new-password").value
            const confirmPassword = document.getElementById("confirm-password").value

            if (!currentPassword || !newPassword || !confirmPassword) {
                showToast("Error", "Todos los campos son obligatorios", "error")
                return
            }

            if (newPassword !== confirmPassword) {
                showToast("Error", "Las contraseñas no coinciden", "error")
                return
            }

            showToast("Éxito", "Contraseña cambiada correctamente", "success")
            const modal = bootstrap.Modal.getInstance(document.getElementById("changePasswordModal"))
            modal.hide()
        })
    }

    // Evento para confirmar la cancelación del alquiler
    const confirmCancelBtn = document.getElementById("confirm-cancel-rental")
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener("click", function () {
            const rentalId = this.dataset.rentalId
            const modal = bootstrap.Modal.getInstance(document.getElementById("cancelRentalModal"))
            modal.hide()
            cancelRental(rentalId)
        })
    }

    // Evento para actualizar el perfil
    const profileForm = document.getElementById("profile-form")
    if (profileForm) {
        profileForm.addEventListener("submit", (event) => {
            event.preventDefault()

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
})

// Hacer funciones globalmente disponibles
window.refreshUserProfile = refreshUserProfile
window.viewRentalDetails = viewRentalDetails
window.showCancelRentalModal = showCancelRentalModal
window.showTab = showTab
window.changeFontSize = changeFontSize
window.logout = logout
window.downloadRentalPDF = downloadRentalPDF

// Asegurar que todas las funciones estén disponibles globalmente
window.loadProfile = loadProfile
window.showTab = showTab
window.changeFontSize = changeFontSize
window.viewRentalDetails = viewRentalDetails
window.downloadRentalPDF = downloadRentalPDF
window.showCancelRentalModal = showCancelRentalModal
window.refreshUserProfile = refreshUserProfile
window.logout = logout
window.loadUserRentals = loadUserRentals
window.requireAuth = requireAuth
window.getToken = getToken
window.showToast = showToast
