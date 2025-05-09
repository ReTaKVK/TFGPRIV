// map.js - Handles map functionality for vehicle locations

// Initialize map when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Check if map container exists on the page
    const mapContainer = document.getElementById("vehicle-map")
    if (!mapContainer) return

    // Initialize the map
    initMap()
})

// Initialize map with vehicle locations
function initMap() {
    // Create map centered on Spain
    const map = L.map("vehicle-map").setView([40.416775, -3.70379], 6)

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    // Get vehicle ID from URL if on vehicle details page
    const urlParams = new URLSearchParams(window.location.search)
    const vehicleId = urlParams.get("id")

    if (vehicleId) {
        // If on vehicle details page, show single vehicle location
        showSingleVehicleLocation(map, vehicleId)
    } else {
        // If on vehicles page, show all vehicle locations
        showAllVehicleLocations(map)
    }
}

// Show location of a single vehicle
function showSingleVehicleLocation(map, vehicleId) {
    // Get vehicles from localStorage or API
    const vehicles = JSON.parse(localStorage.getItem("vehicles") || "[]")
    const vehicle = vehicles.find((v) => v.id == vehicleId)

    if (!vehicle || !vehicle.location) {
        // If vehicle not found or has no location, show default location
        const defaultLocation = [40.416775, -3.70379] // Madrid
        L.marker(defaultLocation).addTo(map).bindPopup("Ubicación del vehículo").openPopup()
        map.setView(defaultLocation, 13)
        return
    }

    // Add marker for the vehicle
    const marker = L.marker([vehicle.location.lat, vehicle.location.lng]).addTo(map)

    // Create popup content
    const popupContent = `
        <div class="map-popup">
            <h5>${vehicle.marca} ${vehicle.modelo}</h5>
            <p>${vehicle.location.address || "Dirección no disponible"}</p>
            <p class="text-primary fw-bold">€${vehicle.precio}/día</p>
        </div>
    `

    // Bind popup to marker
    marker.bindPopup(popupContent).openPopup()

    // Center map on vehicle location
    map.setView([vehicle.location.lat, vehicle.location.lng], 14)
}

// Show locations of all vehicles
function showAllVehicleLocations(map) {
    // Get vehicles from localStorage or API
    const vehicles = JSON.parse(localStorage.getItem("vehicles") || "[]")

    // Create a marker group to fit bounds later
    const markers = L.featureGroup()

    // Add markers for each vehicle with location
    vehicles.forEach((vehicle) => {
        if (vehicle.location) {
            // Create marker
            const marker = L.marker([vehicle.location.lat, vehicle.location.lng])

            // Create popup content
            const popupContent = `
                <div class="map-popup">
                    <h5>${vehicle.marca} ${vehicle.modelo}</h5>
                    <p>${vehicle.location.address || "Dirección no disponible"}</p>
                    <p class="text-primary fw-bold">€${vehicle.precio}/día</p>
                    <a href="vehicle-details.html?id=${vehicle.id}" class="btn btn-sm btn-primary">Ver detalles</a>
                </div>
            `

            // Bind popup to marker
            marker.bindPopup(popupContent)

            // Add marker to map and marker group
            marker.addTo(map)
            markers.addTo(map)
        }
    })

    // If no vehicles with locations, show default view
    if (markers.getLayers().length === 0) {
        // Default to Spain view
        map.setView([40.416775, -3.70379], 6)
    } else {
        // Fit map to show all markers with padding
        map.fitBounds(markers.getBounds(), { padding: [50, 50] })
    }

    // Add filter functionality if on vehicles page
    addMapFilters(map, vehicles)
}

// Add filter buttons for the map
function addMapFilters(map, vehicles) {
    const filterButtons = document.querySelectorAll(".vehicle-filter-btn")
    if (!filterButtons.length) return

    filterButtons.forEach((button) => {
        button.addEventListener("click", function () {
            // Remove active class from all buttons
            filterButtons.forEach((btn) => btn.classList.remove("active"))

            // Add active class to clicked button
            this.classList.add("active")

            // Get filter type
            const filterType = this.dataset.type

            // Clear existing markers
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer)
                }
            })

            // Create a new marker group
            const markers = L.featureGroup()

            // Filter vehicles and add markers
            vehicles.forEach((vehicle) => {
                if (vehicle.location && (!filterType || vehicle.tipo.toLowerCase() === filterType.toLowerCase())) {
                    // Create marker
                    const marker = L.marker([vehicle.location.lat, vehicle.location.lng])

                    // Create popup content
                    const popupContent = `
                        <div class="map-popup">
                            <h5>${vehicle.marca} ${vehicle.modelo}</h5>
                            <p>${vehicle.location.address || "Dirección no disponible"}</p>
                            <p class="text-primary fw-bold">€${vehicle.precio}/día</p>
                            <a href="vehicle-details.html?id=${vehicle.id}" class="btn btn-sm btn-primary">Ver detalles</a>
                        </div>
                    `

                    // Bind popup to marker
                    marker.bindPopup(popupContent)

                    // Add marker to map and marker group
                    marker.addTo(map)
                    markers.addTo(map)
                }
            })

            // Fit map to show filtered markers
            if (markers.getLayers().length > 0) {
                map.fitBounds(markers.getBounds(), { padding: [50, 50] })
            }
        })
    })
}

// Add mock locations to vehicles in localStorage
function addMockLocationsToVehicles() {
    // Get vehicles from localStorage
    const vehicles = JSON.parse(localStorage.getItem("vehicles") || "[]")

    // Define some mock locations in Spain
    const mockLocations = [
        { lat: 40.416775, lng: -3.70379, address: "Gran Vía 1, Madrid" }, // Madrid
        { lat: 41.385064, lng: 2.173404, address: "Passeig de Gràcia 43, Barcelona" }, // Barcelona
        { lat: 37.389092, lng: -5.984459, address: "Av. de la Constitución 10, Sevilla" }, // Sevilla
        { lat: 39.46999, lng: -0.376288, address: "Plaza del Ayuntamiento 1, Valencia" }, // Valencia
        { lat: 43.263013, lng: -2.934985, address: "Gran Vía 12, Bilbao" }, // Bilbao
        { lat: 28.291565, lng: -16.629129, address: "Avda. Marítima 4, Santa Cruz de Tenerife" }, // Tenerife
        { lat: 37.774929, lng: -3.789742, address: "Paseo de la Estación 10, Jaén" }, // Jaén
        { lat: 43.36235, lng: -8.41154, address: "Av. de la Marina 15, A Coruña" }, // A Coruña
    ]

    // Assign a random location to each vehicle
    const updatedVehicles = vehicles.map((vehicle) => {
        if (!vehicle.location) {
            const randomLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)]
            return {
                ...vehicle,
                location: randomLocation,
            }
        }
        return vehicle
    })

    // Save updated vehicles to localStorage
    localStorage.setItem("vehicles", JSON.stringify(updatedVehicles))
}

// Call this function when initializing the app to add mock locations
// This would typically be done once when setting up the demo data
if (!localStorage.getItem("locationsAdded")) {
    addMockLocationsToVehicles()
    localStorage.setItem("locationsAdded", "true")
}
