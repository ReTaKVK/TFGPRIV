// Variables globales
let allVehicles = []
let filteredVehicles = []

// Función para cargar todos los vehículos disponibles
async function loadVehicles() {
    try {
        const vehiculosContainer = document.getElementById("vehiculos-container")
        if (!vehiculosContainer) return

        // Mostrar spinner de carga
        vehiculosContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="loading-spinner">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando vehículos...</span>
                    </div>
                    <p class="mt-3 text-muted">Cargando vehículos disponibles...</p>
                </div>
            </div>
        `

        const response = await fetch(`https://tfgpriv.onrender.com/api/vehiculos/disponibles`)
        if (!response.ok) {
            throw new Error("Error al cargar los vehículos")
        }

        allVehicles = await response.json()
        filteredVehicles = [...allVehicles]

        loadBrands() // Cargar marcas en el filtro
        displayVehicles(filteredVehicles) // Mostrar vehículos
    } catch (error) {
        console.error("Error:", error)
        const vehiculosContainer = document.getElementById("vehiculos-container")
        if (vehiculosContainer) {
            vehiculosContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger" role="alert">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        Error al cargar los vehículos. Por favor, inténtalo de nuevo más tarde.
                    </div>
                </div>
            `
        }
    }
}

// Función para cargar las marcas únicas
function loadBrands() {
    const marcaFilter = document.getElementById("marcaFilter")
    if (!marcaFilter) return

    const uniqueBrands = [...new Set(allVehicles.map((vehicle) => vehicle.marca))]
    uniqueBrands.sort()

    uniqueBrands.forEach((brand) => {
        const option = document.createElement("option")
        option.value = brand
        option.textContent = brand
        marcaFilter.appendChild(option)
    })
}

// Función para mostrar vehículos
function displayVehicles(vehicles) {
    const vehiculosContainer = document.getElementById("vehiculos-container")
    if (!vehiculosContainer) return

    // Limpiar el contenido anterior
    vehiculosContainer.innerHTML = ""

    if (vehicles.length === 0) {
        vehiculosContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info" role="alert">
                    <i class="bi bi-info-circle-fill me-2"></i>
                    No se encontraron vehículos que coincidan con los filtros seleccionados.
                </div>
                <button class="btn btn-outline-primary mt-3" onclick="resetFilters()">
                    <i class="bi bi-arrow-counterclockwise me-2"></i>Restablecer filtros
                </button>
            </div>
        `
        return
    }

    // Mostrar contador de resultados
    const resultsCount = document.getElementById("resultsCount")
    if (resultsCount) {
        resultsCount.textContent = `${vehicles.length} vehículos encontrados`
    }

    // Mostrar vehículos
    vehicles.forEach((vehicle) => {
        const card = document.createElement("div")
        card.className = "col-md-4 col-lg-3 mb-4 reveal"
        card.innerHTML = `
            <div class="card h-100 shadow-sm vehicle-card">
                <div class="position-relative">
                    <img src="${vehicle.imagen || "img/car-placeholder.jpg"}" class="card-img-top vehicle-img" alt="${vehicle.marca} ${vehicle.modelo}">
                    <span class="position-absolute top-0 end-0 m-2 badge ${vehicle.disponible ? "bg-success" : "bg-danger"}">
                        ${vehicle.disponible ? "Disponible" : "No disponible"}
                    </span>
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${vehicle.marca} ${vehicle.modelo}</h5>
                    <p class="card-text text-muted small">
                        <i class="bi bi-fuel-pump me-1"></i>${vehicle.combustible || "Gasolina"} • 
                        <i class="bi bi-gear me-1"></i>${vehicle.transmision || "Manual"}
                    </p>
                    <div class="mt-auto d-flex justify-content-between align-items-center">
                        <span class="text-primary fw-bold">${vehicle.precio}€/día</span>
                        <a href="detalle-vehiculo.html?id=${vehicle.id}" class="btn btn-outline-primary btn-sm">
                            <i class="bi bi-eye me-1"></i>Ver detalles
                        </a>
                    </div>
                </div>
            </div>
        `
        vehiculosContainer.appendChild(card)
    })

    // Activar animaciones de revelación
    setTimeout(reveal, 100)
}

// Función para aplicar filtros
function applyFilters() {
    const marcaFilter = document.getElementById("marcaFilter").value
    const precioFilter = Number.parseInt(document.getElementById("precioFilter").value)
    const tipoFilter = document.getElementById("tipoFilter")?.value || ""
    const transmisionFilter = document.getElementById("transmisionFilter")?.value || ""

    filteredVehicles = allVehicles.filter((vehicle) => {
        // Filtro de marca
        if (marcaFilter && vehicle.marca !== marcaFilter) {
            return false
        }

        // Filtro de precio
        if (vehicle.precio > precioFilter) {
            return false
        }

        // Filtro de tipo (si existe)
        if (tipoFilter && vehicle.tipo && vehicle.tipo !== tipoFilter) {
            return false
        }

        // Filtro de transmisión (si existe)
        if (transmisionFilter && vehicle.transmision && vehicle.transmision !== transmisionFilter) {
            return false
        }

        return true
    })

    displayVehicles(filteredVehicles)
}

// Función para restablecer filtros
function resetFilters() {
    const marcaFilter = document.getElementById("marcaFilter")
    const precioFilter = document.getElementById("precioFilter")
    const tipoFilter = document.getElementById("tipoFilter")
    const transmisionFilter = document.getElementById("transmisionFilter")

    if (marcaFilter) marcaFilter.value = ""
    if (precioFilter) {
        precioFilter.value = 500
        document.getElementById("precioValue").textContent = "500€"
    }
    if (tipoFilter) tipoFilter.value = ""
    if (transmisionFilter) transmisionFilter.value = ""

    filteredVehicles = [...allVehicles]
    displayVehicles(filteredVehicles)
}

// Eventos DOM
document.addEventListener("DOMContentLoaded", () => {
    loadVehicles()

    // Configurar evento para el filtro de precio
    const precioFilter = document.getElementById("precioFilter")
    const precioValue = document.getElementById("precioValue")

    if (precioFilter && precioValue) {
        precioFilter.addEventListener("input", function () {
            precioValue.textContent = `${this.value}€`
            applyFilters() // Aplicar filtros en tiempo real
        })
    }

    // Configurar eventos para los demás filtros
    const marcaFilter = document.getElementById("marcaFilter")
    if (marcaFilter) {
        marcaFilter.addEventListener("change", applyFilters)
    }

    const tipoFilter = document.getElementById("tipoFilter")
    if (tipoFilter) {
        tipoFilter.addEventListener("change", applyFilters)
    }

    const transmisionFilter = document.getElementById("transmisionFilter")
    if (transmisionFilter) {
        transmisionFilter.addEventListener("change", applyFilters)
    }

    // Mantener el botón de aplicar filtros para compatibilidad
    const applyFiltersBtn = document.getElementById("applyFilters")
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener("click", applyFilters)
    }

    // Botón para restablecer filtros
    const resetFiltersBtn = document.getElementById("resetFilters")
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener("click", resetFilters)
    }
})

// Navbar scroll effect
document.addEventListener("DOMContentLoaded", () => {
    window.addEventListener("scroll", () => {
        const navbar = document.querySelector(".navbar")
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled")
        } else {
            navbar.classList.remove("scrolled")
        }
    })

    // Scroll reveal animation
    reveal()
    window.addEventListener("scroll", reveal)
})

// Función para animaciones de revelación
function reveal() {
    const reveals = document.querySelectorAll(".reveal")

    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight
        const elementTop = reveals[i].getBoundingClientRect().top
        const elementVisible = 150

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active")
        }
    }
}
