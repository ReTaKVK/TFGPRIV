// Vehicles JavaScript
document.addEventListener("DOMContentLoaded", () => {
    // Load vehicles
    loadVehicles()

    // Handle filter form submission
    const filterForm = document.getElementById("filter-form")
    if (filterForm) {
        filterForm.addEventListener("submit", (e) => {
            e.preventDefault()
            loadVehicles()
        })
    }

    // Handle price range input
    const priceRange = document.getElementById("price-range")
    const priceValue = document.getElementById("price-value")
    if (priceRange && priceValue) {
        priceRange.addEventListener("input", () => {
            priceValue.textContent = `${priceRange.value}€`
        })
    }

    // Handle view toggle
    const gridView = document.getElementById("grid-view")
    const listView = document.getElementById("list-view")
    const vehiclesGrid = document.getElementById("vehicles-grid")
    const vehiclesList = document.getElementById("vehicles-list")

    if (gridView && listView && vehiclesGrid && vehiclesList) {
        gridView.addEventListener("click", () => {
            gridView.classList.add("active")
            listView.classList.remove("active")
            vehiclesGrid.classList.remove("d-none")
            vehiclesList.classList.add("d-none")
        })

        listView.addEventListener("click", () => {
            listView.classList.add("active")
            gridView.classList.remove("active")
            vehiclesList.classList.remove("d-none")
            vehiclesGrid.classList.add("d-none")
        })
    }

    // Handle sort by change
    const sortBy = document.getElementById("sort-by")
    if (sortBy) {
        sortBy.addEventListener("change", () => {
            loadVehicles()
        })
    }

    // Handle rental form submission
    const rentalForm = document.getElementById("rental-form")
    if (rentalForm) {
        rentalForm.addEventListener("submit", (e) => {
            e.preventDefault()

            const vehicleId = document.getElementById("vehicle-id").value
            const pickupDate = document.getElementById("pickup-date").value
            const returnDate = document.getElementById("return-date").value

            createRental(vehicleId, pickupDate, returnDate)
        })
    }
})

// Load vehicles from backend
function loadVehicles() {
    const vehiclesGrid = document.getElementById("vehicles-grid")
    const vehiclesList = document.getElementById("vehicles-list")
    const vehiclesCount = document.getElementById("vehicles-count")

    if (!vehiclesGrid || !vehiclesList) return

    // Show loading spinners
    vehiclesGrid.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>
    `

    vehiclesList.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>
    `

    // Get filter values
    const category = document.getElementById("category").value
    const brand = document.getElementById("brand").value
    const priceRange = document.getElementById("price-range").value
    const sortBy = document.getElementById("sort-by").value

    // Fetch vehicles from backend API
    fetch("http://localhost:8080/api/vehiculos/disponibles")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error al obtener vehículos")
            }
            return response.json()
        })
        .then((vehicles) => {
            // Apply filters
            let filteredVehicles = vehicles

            if (category) {
                filteredVehicles = filteredVehicles.filter((vehicle) => vehicle.tipo.toLowerCase() === category.toLowerCase())
            }

            if (brand) {
                filteredVehicles = filteredVehicles.filter((vehicle) => vehicle.marca.toLowerCase() === brand.toLowerCase())
            }

            filteredVehicles = filteredVehicles.filter((vehicle) => vehicle.precio <= priceRange)

            // Apply sorting
            switch (sortBy) {
                case "price-asc":
                    filteredVehicles.sort((a, b) => a.precio - b.precio)
                    break
                case "price-desc":
                    filteredVehicles.sort((a, b) => b.precio - a.precio)
                    break
                case "name-asc":
                    filteredVehicles.sort((a, b) => `${a.marca} ${a.modelo}`.localeCompare(`${b.marca} ${b.modelo}`))
                    break
                case "name-desc":
                    filteredVehicles.sort((a, b) => `${b.marca} ${b.modelo}`.localeCompare(`${a.marca} ${a.modelo}`))
                    break
                default:
                    // Default sorting (recommended)
                    break
            }

            // Update vehicles count
            if (vehiclesCount) {
                vehiclesCount.textContent = `Mostrando ${filteredVehicles.length} vehículos`
            }

            // Clear containers
            vehiclesGrid.innerHTML = ""
            vehiclesList.innerHTML = ""

            // Render vehicles
            if (filteredVehicles.length > 0) {
                // Render grid view
                filteredVehicles.forEach((vehicle) => {
                    const gridCard = createVehicleGridCard(vehicle)
                    vehiclesGrid.appendChild(gridCard)
                })

                // Render list view
                filteredVehicles.forEach((vehicle) => {
                    const listItem = createVehicleListItem(vehicle)
                    vehiclesList.appendChild(listItem)
                })

                // Generate pagination
                generatePagination(filteredVehicles.length)

                // Store vehicles in localStorage for cart functionality
                localStorage.setItem("vehicles", JSON.stringify(filteredVehicles))

                // Add event listeners to view details buttons
                setupVehicleDetailButtons()
            } else {
                // No vehicles found
                vehiclesGrid.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-car-front display-1 text-muted mb-3"></i>
                        <h3>No se encontraron vehículos</h3>
                        <p class="text-muted">Intenta con otros filtros</p>
                        <button class="btn btn-outline-primary" onclick="resetFilters()">Limpiar filtros</button>
                    </div>
                `

                vehiclesList.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-car-front display-1 text-muted mb-3"></i>
                        <h3>No se encontraron vehículos</h3>
                        <p class="text-muted">Intenta con otros filtros</p>
                        <button class="btn btn-outline-primary" onclick="resetFilters()">Limpiar filtros</button>
                    </div>
                `
            }
        })
        .catch((error) => {
            console.error("Error:", error)
            showErrorMessage(vehiclesGrid, vehiclesList)
        })
}

// Show error message when API fails
function showErrorMessage(vehiclesGrid, vehiclesList) {
    const errorMessage = `
    <div class="col-12 text-center py-5">
        <i class="bi bi-exclamation-triangle display-1 text-danger mb-3"></i>
        <h3>Error de conexión</h3>
        <p class="text-muted">No se pudo conectar con el servidor. Por favor, inténtalo de nuevo más tarde.</p>
        <button class="btn btn-primary mt-3" onclick="loadVehicles()">Reintentar</button>
    </div>
  `

    if (vehiclesGrid) vehiclesGrid.innerHTML = errorMessage
    if (vehiclesList) vehiclesList.innerHTML = errorMessage
}

// Create vehicle grid card
function createVehicleGridCard(vehicle) {
    const col = document.createElement("div")
    col.className = "col-md-6 col-lg-4"

    // Ensure we have a valid image URL or use a placeholder
    const imageUrl = vehicle.imagen || "img/placeholder-car.jpg"

    // Truncate description if it's too long
    const description = vehicle.descripcion
        ? vehicle.descripcion.substring(0, 100) + (vehicle.descripcion.length > 100 ? "..." : "")
        : "Información no disponible"

    col.innerHTML = `
        <div class="card h-100 border-0 shadow-sm">
            <img src="${imageUrl}" class="card-img-top" alt="${vehicle.marca} ${vehicle.modelo}" style="height: 200px; object-fit: cover;">
            <div class="card-body">
                <h5 class="card-title fw-bold">${vehicle.marca} ${vehicle.modelo}</h5>
                <p class="card-text text-muted small">${description}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-primary rounded-pill">${vehicle.tipo}</span>
                    <div>
                        <i class="bi bi-star-fill text-warning"></i>
                        <span class="small">${vehicle.valoracion || "4.5"}</span>
                    </div>
                </div>
            </div>
            <div class="card-footer bg-white border-0 d-flex justify-content-between align-items-center">
                <span class="fw-bold text-primary fs-5">${vehicle.precio}€/día</span>
                <button class="btn btn-outline-primary btn-sm view-details" data-id="${vehicle.id}">Ver detalles</button>
            </div>
        </div>
    `

    return col
}

// Create vehicle list item
function createVehicleListItem(vehicle) {
    const item = document.createElement("div")
    item.className = "card mb-3 border-0 shadow-sm"

    // Ensure we have a valid image URL or use a placeholder
    const imageUrl = vehicle.imagen || "img/placeholder-car.jpg"

    // Truncate description if it's too long
    const description = vehicle.descripcion
        ? vehicle.descripcion.substring(0, 150) + (vehicle.descripcion.length > 150 ? "..." : "")
        : "Información no disponible"

    // Default features if none provided
    const features = vehicle.caracteristicas || ["Automático", "GPS", "Bluetooth", "Climatizador"]

    item.innerHTML = `
        <div class="row g-0">
            <div class="col-md-4">
                <img src="${imageUrl}" class="img-fluid rounded-start h-100" alt="${vehicle.marca} ${vehicle.modelo}" style="object-fit: cover;">
            </div>
            <div class="col-md-8">
                <div class="card-body d-flex flex-column h-100">
                    <div class="mb-auto">
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="card-title fw-bold">${vehicle.marca} ${vehicle.modelo}</h5>
                            <span class="badge bg-primary rounded-pill">${vehicle.tipo}</span>
                        </div>
                        <p class="card-text text-muted">${description}</p>
                        <div class="d-flex flex-wrap gap-2 mb-3">
                            ${features
        .slice(0, 4)
        .map(
            (feature) =>
                `<span class="badge bg-light text-dark"><i class="bi bi-check-circle-fill text-primary me-1"></i>${feature}</span>`,
        )
        .join("")}
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="fw-bold text-primary fs-5">${vehicle.precio}€/día</span>
                            <div class="small text-muted">
                                <i class="bi bi-star-fill text-warning"></i>
                                <span>${vehicle.valoracion || "4.5"}</span> · 
                                <i class="bi bi-people-fill"></i>
                                <span>${vehicle.plazas || "5"} plazas</span>
                            </div>
                        </div>
                        <button class="btn btn-primary view-details" data-id="${vehicle.id}">Ver detalles</button>
                    </div>
                </div>
            </div>
        </div>
    `

    return item
}

// Generate pagination
function generatePagination(totalItems) {
    const pagination = document.getElementById("pagination")
    if (!pagination) return

    const itemsPerPage = 6
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    pagination.innerHTML = ""

    // Previous button
    const prevLi = document.createElement("li")
    prevLi.className = "page-item disabled"
    prevLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `
    pagination.appendChild(prevLi)

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageLi = document.createElement("li")
        pageLi.className = i === 1 ? "page-item active" : "page-item"
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`
        pagination.appendChild(pageLi)
    }

    // Next button
    const nextLi = document.createElement("li")
    nextLi.className = "page-item"
    nextLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `
    pagination.appendChild(nextLi)
}

// Reset filters
function resetFilters() {
    const category = document.getElementById("category")
    const brand = document.getElementById("brand")
    const priceRange = document.getElementById("price-range")
    const priceValue = document.getElementById("price-value")

    if (category) category.value = ""
    if (brand) brand.value = ""
    if (priceRange) {
        priceRange.value = 500
        if (priceValue) priceValue.textContent = "500€"
    }

    loadVehicles()
}

// Setup vehicle detail buttons
function setupVehicleDetailButtons() {
    const detailButtons = document.querySelectorAll(".view-details")

    detailButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const vehicleId = button.dataset.id
            showVehicleDetails(vehicleId)
        })
    })
}

// Show vehicle details in modal
function showVehicleDetails(vehicleId) {
    // Fetch vehicle details from backend
    fetch(`http://localhost:8080/api/vehiculos/${vehicleId}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error al obtener detalles del vehículo")
            }
            return response.json()
        })
        .then((vehicle) => {
            populateVehicleModal(vehicle)
        })
        .catch((error) => {
            console.error("Error:", error)

            // Fallback to localStorage if API fails
            const vehicles = JSON.parse(localStorage.getItem("vehicles") || "[]")
            const vehicle = vehicles.find((v) => v.id == vehicleId)

            if (vehicle) {
                populateVehicleModal(vehicle)
            } else {
                alert("No se pudo cargar la información del vehículo. Por favor, inténtalo de nuevo más tarde.")
            }
        })
}

// Populate vehicle modal with data
function populateVehicleModal(vehicle) {
    if (!vehicle) return

    // Set vehicle ID in hidden field
    const vehicleIdField = document.getElementById("vehicle-id")
    if (vehicleIdField) vehicleIdField.value = vehicle.id

    // Set modal title
    const modalTitle = document.getElementById("modal-vehicle-name")
    if (modalTitle) modalTitle.textContent = "Detalles del vehículo"

    // Set vehicle details
    const vehicleTitle = document.getElementById("modal-vehicle-title")
    if (vehicleTitle) vehicleTitle.textContent = `${vehicle.marca} ${vehicle.modelo} (${vehicle.año})`

    const vehicleCategory = document.getElementById("modal-vehicle-category")
    if (vehicleCategory) vehicleCategory.textContent = vehicle.tipo

    const vehicleRating = document.getElementById("modal-vehicle-rating")
    if (vehicleRating) vehicleRating.textContent = vehicle.valoracion || "4.5"

    const vehicleSeats = document.getElementById("modal-vehicle-seats")
    if (vehicleSeats) vehicleSeats.textContent = vehicle.plazas || "5"

    const vehicleDescription = document.getElementById("modal-vehicle-description")
    if (vehicleDescription) vehicleDescription.textContent = vehicle.descripcion

    const vehiclePrice = document.getElementById("modal-vehicle-price")
    if (vehiclePrice) vehiclePrice.textContent = `€${vehicle.precio}`

    // Set vehicle features
    const vehicleFeatures = document.getElementById("modal-vehicle-features")
    if (vehicleFeatures) {
        vehicleFeatures.innerHTML = ""

        if (vehicle.caracteristicas && vehicle.caracteristicas.length > 0) {
            vehicle.caracteristicas.forEach((feature) => {
                const featureCol = document.createElement("div")
                featureCol.className = "col-6"
                featureCol.innerHTML = `
                    <div class="d-flex align-items-center">
                        <i class="bi bi-check-circle-fill text-primary me-2"></i>
                        <span>${feature}</span>
                    </div>
                `
                vehicleFeatures.appendChild(featureCol)
            })
        } else {
            // Default features if none provided
            const defaultFeatures = [
                "Automático",
                "GPS",
                "Bluetooth",
                "Climatizador",
                "Asientos calefactables",
                "Cámara trasera",
            ]
            defaultFeatures.forEach((feature) => {
                const featureCol = document.createElement("div")
                featureCol.className = "col-6"
                featureCol.innerHTML = `
                    <div class="d-flex align-items-center">
                        <i class="bi bi-check-circle-fill text-primary me-2"></i>
                        <span>${feature}</span>
                    </div>
                `
                vehicleFeatures.appendChild(featureCol)
            })
        }
    }

    // Set carousel images
    const carouselInner = document.getElementById("modal-carousel-inner")
    const carouselIndicators = document.getElementById("modal-carousel-indicators")

    if (carouselInner && carouselIndicators) {
        carouselInner.innerHTML = ""
        carouselIndicators.innerHTML = ""

        // Main vehicle image
        const mainSlide = document.createElement("div")
        mainSlide.className = "carousel-item active"
        mainSlide.innerHTML = `<img src="${vehicle.imagen || "img/placeholder-car.jpg"}" class="d-block w-100" alt="${vehicle.marca} ${vehicle.modelo}" style="height: 300px; object-fit: cover;">`
        carouselInner.appendChild(mainSlide)

        const mainIndicator = document.createElement("button")
        mainIndicator.type = "button"
        mainIndicator.dataset.bsTarget = "#vehicle-carousel"
        mainIndicator.dataset.bsSlideTo = "0"
        mainIndicator.className = "active"
        mainIndicator.setAttribute("aria-current", "true")
        mainIndicator.setAttribute("aria-label", "Slide 1")
        carouselIndicators.appendChild(mainIndicator)

        // If vehicle has additional images, add them to carousel
        if (vehicle.imagenes && vehicle.imagenes.length > 0) {
            vehicle.imagenes.forEach((image, index) => {
                const slide = document.createElement("div")
                slide.className = "carousel-item"
                slide.innerHTML = `<img src="${image}" class="d-block w-100" alt="${vehicle.marca} ${vehicle.modelo} - Vista ${index + 2}" style="height: 300px; object-fit: cover;">`
                carouselInner.appendChild(slide)

                const indicator = document.createElement("button")
                indicator.type = "button"
                indicator.dataset.bsTarget = "#vehicle-carousel"
                indicator.dataset.bsSlideTo = `${index + 1}`
                indicator.setAttribute("aria-label", `Slide ${index + 2}`)
                carouselIndicators.appendChild(indicator)
            })
        }
    }

    // Set default date for pickup
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const pickupDate = document.getElementById("pickup-date")
    if (pickupDate) {
        pickupDate.min = today.toISOString().split("T")[0]
        pickupDate.value = tomorrow.toISOString().split("T")[0]
    }

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const rentalFormContainer = document.getElementById("rental-form-container")
    const loginRequiredMessage = document.getElementById("login-required-message")

    if (rentalFormContainer && loginRequiredMessage) {
        if (isLoggedIn) {
            rentalFormContainer.classList.remove("d-none")
            loginRequiredMessage.classList.add("d-none")
        } else {
            rentalFormContainer.classList.add("d-none")
            loginRequiredMessage.classList.remove("d-none")
        }
    }

    // Show modal
    const vehicleModal = document.getElementById("vehicle-modal")
    if (vehicleModal) {
        const modal = new bootstrap.Modal(vehicleModal)
        modal.show()
    }
}

// Create rental in backend
function createRental(vehicleId, pickupDate, returnDate) {
    // Get user info from localStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")

    if (!currentUser.id) {
        alert("Debes iniciar sesión para realizar un alquiler")
        return
    }

    const rentalData = {
        vehiculoId: vehicleId,
        usuarioId: currentUser.id,
        fechaInicio: pickupDate,
        fechaFin: returnDate,
        estado: "PENDIENTE",
    }

    // Send rental data to backend
    fetch("http://localhost:8080/api/alquileres", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(rentalData),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error al crear el alquiler")
            }
            return response.json()
        })
        .then((data) => {
            // Show success message
            alert("¡Alquiler creado con éxito!")

            // Close modal
            const vehicleModal = document.getElementById("vehicle-modal")
            if (vehicleModal) {
                // Get the Bootstrap modal instance
                const modalInstance = bootstrap.Modal.getInstance(vehicleModal)

                // Check if the modal instance exists before hiding it
                if (modalInstance) {
                    modalInstance.hide()
                }
            }

            // Redirect to user dashboard
            window.location.href = "user-dashboard.html"
        })
        .catch((error) => {
            console.error("Error:", error)
            alert("No se pudo crear el alquiler. Por favor, inténtalo de nuevo más tarde.")
        })
}
