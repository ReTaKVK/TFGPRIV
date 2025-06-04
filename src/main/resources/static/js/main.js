// Define API_URL (replace with your actual API URL)
const API_URL = "https://tfgpriv.onrender.com/api/vehiculos/disponibles"

// Función para cargar los vehículos destacados en la página de inicio
async function loadFeaturedVehicles() {
    try {
        const featuredVehiclesContainer = document.getElementById("featured-vehicles")
        if (!featuredVehiclesContainer) return

        const response = await fetch(`${API_URL}`)

        if (!response.ok) {
            throw new Error("Error al cargar los vehículos destacados")
        }

        const vehicles = await response.json()

        // Mostrar solo los primeros 3 vehículos
        const featuredVehicles = vehicles.slice(0, 3)

        if (featuredVehicles.length === 0) {
            featuredVehiclesContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p>No hay vehículos destacados disponibles en este momento.</p>
                </div>
            `
            return
        }

        let html = ""

        featuredVehicles.forEach((vehicle) => {
            html += `
                <div class="col-md-4">
                    <div class="card h-100 shadow-sm vehicle-card">
                        <img src="${vehicle.imagen || "img/car-placeholder.jpg"}" class="card-img-top vehicle-img" alt="${vehicle.marca} ${vehicle.modelo}">
                        <div class="card-body">
                            <h5 class="card-title">${vehicle.marca} ${vehicle.modelo}</h5>
                            <p class="card-text">
                                <span class="badge bg-success">${vehicle.disponible ? "Disponible" : "No disponible"}</span>
                            </p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="text-primary fw-bold">${vehicle.precio}€/día</span>
                                <a href="detalle-vehiculo.html?id=${vehicle.id}" class="btn btn-outline-primary">Ver detalles</a>
                            </div>
                        </div>
                    </div>
                </div>
            `
        })

        featuredVehiclesContainer.innerHTML = html
    } catch (error) {
        console.error("Error:", error)
        const featuredVehiclesContainer = document.getElementById("featured-vehicles")
        if (featuredVehiclesContainer) {
            featuredVehiclesContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p>Error al cargar los vehículos destacados. Por favor, inténtalo de nuevo más tarde.</p>
                </div>
            `
        }
    }
}

// Cargar los vehículos destacados al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    loadFeaturedVehicles()
})
