document.addEventListener("DOMContentLoaded", () => {
    // Verificar si el usuario está autenticado y actualizar la interfaz
    if (window.authService) {
        window.authService.updateUI()
    }

    // Inicializar tooltips de Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    if (typeof bootstrap !== "undefined") {
        tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))
    }

    // Cargar vehículos destacados en la página principal
    if (document.querySelector(".featured-vehicles")) {
        loadFeaturedVehicles()
    }

    // Inicializar el mapa si existe el contenedor
    if (document.getElementById("vehicleMap")) {
        initMap()
    }
})

// Función para cargar vehículos destacados
async function loadFeaturedVehicles() {
    const featuredContainer = document.querySelector(".featured-vehicles .row")
    if (!featuredContainer) return

    try {
        // Simulación de carga de datos (reemplazar con llamada a API real)
        const vehicles = [
            {
                id: 1,
                name: "Toyota Corolla",
                category: "Sedán",
                price: 45,
                image: "img/vehicles/corolla.jpg",
                features: ["5 Pasajeros", "Automático", "A/C", "Bluetooth"],
                location: "Centro",
            },
            {
                id: 2,
                name: "Honda CR-V",
                category: "SUV",
                price: 65,
                image: "img/vehicles/crv.jpg",
                features: ["5 Pasajeros", "Automático", "A/C", "GPS"],
                location: "Norte",
            },
            {
                id: 3,
                name: "Ford Mustang",
                category: "Deportivo",
                price: 95,
                image: "img/vehicles/mustang.jpg",
                features: ["2 Pasajeros", "Manual", "A/C", "Bluetooth"],
                location: "Sur",
            },
            {
                id: 4,
                name: "Chevrolet Suburban",
                category: "SUV Grande",
                price: 120,
                image: "img/vehicles/suburban.jpg",
                features: ["8 Pasajeros", "Automático", "A/C", "GPS"],
                location: "Este",
            },
        ]

        // Limpiar el contenedor
        featuredContainer.innerHTML = ""

        // Generar HTML para cada vehículo
        vehicles.forEach((vehicle) => {
            const vehicleCard = document.createElement("div")
            vehicleCard.className = "col-md-6 col-lg-3 mb-4"
            vehicleCard.innerHTML = `
                <div class="card h-100 vehicle-card">
                    <img src="${vehicle.image || "img/vehicle-placeholder.jpg"}" class="card-img-top" alt="${vehicle.name}">
                    <div class="card-body">
                        <h5 class="card-title">${vehicle.name}</h5>
                        <p class="card-text text-muted">${vehicle.category}</p>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="price">$${vehicle.price}/día</span>
                            <span class="location"><i class="bi bi-geo-alt"></i> ${vehicle.location}</span>
                        </div>
                        <ul class="list-unstyled features-list">
                            ${vehicle.features.map((feature) => `<li><i class="bi bi-check-circle-fill text-success me-2"></i>${feature}</li>`).join("")}
                        </ul>
                    </div>
                    <div class="card-footer bg-white border-top-0">
                        <div class="d-grid gap-2">
                            <a href="vehicle-details.html?id=${vehicle.id}" class="btn btn-primary">Ver detalles</a>
                        </div>
                    </div>
                </div>
            `
            featuredContainer.appendChild(vehicleCard)
        })
    } catch (error) {
        console.error("Error al cargar vehículos destacados:", error)
        featuredContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger">
                    Error al cargar vehículos. Por favor, intenta de nuevo más tarde.
                </div>
            </div>
        `
    }
}

// Función para inicializar el mapa
function initMap() {
    // Esta función se implementa en map.js
    if (window.initializeMap) {
        window.initializeMap()
    }
}

// Función para mostrar modal de login requerido
function showLoginRequiredModal() {
    const modalElement = document.getElementById("loginRequiredModal")
    if (modalElement && window.bootstrap) {
        const modal = new bootstrap.Modal(modalElement)
        modal.show()
    } else {
        // Fallback si no existe el modal
        alert("Debes iniciar sesión para realizar esta acción.")
        window.location.href = "login.html"
    }
}

// Función para verificar si el usuario está autenticado
function isUserLoggedIn() {
    return window.authService && window.authService.isAuthenticated()
}

// Función para verificar si el usuario es administrador
function isUserAdmin() {
    return window.authService && window.authService.isAdmin()
}

// Función para formatear precio
function formatCurrency(amount) {
    return "$" + Number.parseFloat(amount).toFixed(2)
}

// Función para formatear fecha
function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
}
