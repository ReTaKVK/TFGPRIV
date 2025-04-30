// Main JavaScript for index.html
document.addEventListener("DOMContentLoaded", () => {
    // Load featured vehicles
    loadFeaturedVehicles()

    // Handle contact form submission
    const contactForm = document.getElementById("contact-form")
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault()

            // Get form data
            const name = document.getElementById("name").value
            const email = document.getElementById("email").value
            const subject = document.getElementById("subject").value
            const message = document.getElementById("message").value

            // In a real app, this would be an API call
            console.log("Contact form submitted:", { name, email, subject, message })

            // Show success message
            showAlert("Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.", "success")

            // Reset form
            contactForm.reset()
        })
    }
})

// Load featured vehicles
function loadFeaturedVehicles() {
    const featuredVehiclesContainer = document.getElementById("featured-vehicles")
    if (!featuredVehiclesContainer) return

    // In a real app, this would be an API call
    fetch("http://localhost:8080/api/vehiculos/disponibles")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error al obtener vehículos")
            }
            return response.json()
        })
        .then((vehicles) => {
            // Get 3 random vehicles
            const featuredVehicles = vehicles.sort(() => 0.5 - Math.random()).slice(0, 3)

            // Clear loading spinner
            featuredVehiclesContainer.innerHTML = ""

            // Render vehicles
            featuredVehicles.forEach((vehicle) => {
                const vehicleCard = createVehicleCard(vehicle)
                featuredVehiclesContainer.appendChild(vehicleCard)
            })
        })
        .catch((error) => {
            console.error("Error:", error)

            // For demo purposes, use mock data
            const mockVehicles = [
                {
                    id: 1,
                    marca: "Audi",
                    modelo: "A5 Sportback",
                    año: 2023,
                    tipo: "Sedán",
                    precio: 85,
                    disponible: true,
                    imagen: "img/audi-a5.jpg",
                    descripcion: "Elegante sedán deportivo con un potente motor y acabados de lujo.",
                },
                {
                    id: 2,
                    marca: "BMW",
                    modelo: "X5",
                    año: 2023,
                    tipo: "SUV",
                    precio: 120,
                    disponible: true,
                    imagen: "img/bmw-x5.jpg",
                    descripcion: "SUV de lujo con amplio espacio interior y tecnología de vanguardia.",
                },
                {
                    id: 3,
                    marca: "Mercedes-Benz",
                    modelo: "Clase C",
                    año: 2022,
                    tipo: "Sedán",
                    precio: 95,
                    disponible: true,
                    imagen: "img/mercedes-c.jpg",
                    descripcion: "Sedán de lujo con un diseño elegante y un interior sofisticado.",
                },
            ]

            // Clear loading spinner
            featuredVehiclesContainer.innerHTML = ""

            // Render mock vehicles
            mockVehicles.forEach((vehicle) => {
                const vehicleCard = createVehicleCard(vehicle)
                featuredVehiclesContainer.appendChild(vehicleCard)
            })
        })
}

// Create vehicle card element
function createVehicleCard(vehicle) {
    const col = document.createElement("div")
    col.className = "col-md-4"

    col.innerHTML = `
        <div class="card h-100 border-0 shadow-sm vehicle-card">
            <img src="${vehicle.imagen || "img/car-placeholder.jpg"}" class="card-img-top vehicle-image" alt="${vehicle.marca} ${vehicle.modelo}">
            <div class="card-body p-4">
                <h5 class="card-title fw-bold mb-2">${vehicle.marca} ${vehicle.modelo}</h5>
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="badge bg-primary rounded-pill">${vehicle.tipo}</span>
                    <span class="fw-bold text-primary">${vehicle.precio}€/día</span>
                </div>
                <p class="card-text text-muted mb-4">${vehicle.descripcion || `${vehicle.marca} ${vehicle.modelo} ${vehicle.año}`}</p>
                <a href="vehicles.html" class="btn btn-primary w-100">Ver detalles</a>
            </div>
        </div>
    `

    return col
}

// Show alert message
function showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement("div")
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`
    alertDiv.setAttribute("role", "alert")
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `

    // Find alert container
    let alertContainer = document.querySelector(".alert-container")

    // Create container if it doesn't exist
    if (!alertContainer) {
        alertContainer = document.createElement("div")
        alertContainer.className = "alert-container position-fixed top-0 end-0 p-3"
        alertContainer.style.zIndex = "1050"
        document.body.appendChild(alertContainer)
    }

    // Add alert to container
    alertContainer.appendChild(alertDiv)

    // Remove alert after 5 seconds
    setTimeout(() => {
        alertDiv.classList.remove("show")
        setTimeout(() => {
            alertDiv.remove()
        }, 150)
    }, 5000)
}
