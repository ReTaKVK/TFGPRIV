document.addEventListener("DOMContentLoaded", () => {
    // Obtener ID del vehículo de la URL
    const urlParams = new URLSearchParams(window.location.search)
    const vehicleId = urlParams.get("id")

    if (vehicleId) {
        // Load vehicle details
        loadVehicleDetails(vehicleId)

        // Load vehicle location on map
        loadVehicleLocation(vehicleId)

        // Load similar vehicles
        loadSimilarVehicles(vehicleId)
    } else {
        // Redirect to vehicles page if no ID provided
        window.location.href = "vehicles.html"
    }

    // Configurar el formulario de alquiler
    //setupRentalForm(vehicleId)

    // Inicializar el mapa
    if (document.getElementById("vehicleLocationMap")) {
        initializeVehicleMap()
    }
})

// Función para cargar detalles del vehículo
async function loadVehicleDetails(vehicleId) {
    const detailsContainer = document.getElementById("vehicle-details-container")
    const vehicleDetailsContainer = document.getElementById("vehicleDetails")
    const vehicleImagesContainer = document.getElementById("vehicleImages")
    const vehicleFeaturesContainer = document.getElementById("vehicleFeatures")

    if (!detailsContainer) return

    // Show loading spinner
    detailsContainer.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  `

    // Fetch vehicle details from API
    fetch(`http://localhost:8080/api/vehiculos/${vehicleId}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error al obtener detalles del vehículo")
            }
            return response.json()
        })
        .then((vehicle) => {
            // Update page title and breadcrumb
            document.title = `${vehicle.marca} ${vehicle.modelo} - AutoRent`

            const vehicleTitle = document.getElementById("vehicle-title")
            if (vehicleTitle) {
                vehicleTitle.textContent = `${vehicle.marca} ${vehicle.modelo}`
            }

            const vehicleSubtitle = document.getElementById("vehicle-subtitle")
            if (vehicleSubtitle) {
                vehicleSubtitle.textContent = `${vehicle.tipo} - ${vehicle.año}`
            }

            const breadcrumbVehicleName = document.getElementById("breadcrumb-vehicle-name")
            if (breadcrumbVehicleName) {
                breadcrumbVehicleName.textContent = `${vehicle.marca} ${vehicle.modelo}`
            }

            // Render vehicle details
            renderVehicleDetails(vehicle, detailsContainer)

            // Store vehicle in localStorage for cart functionality
            const vehicles = JSON.parse(localStorage.getItem("vehicles") || "[]")
            const existingVehicle = vehicles.find((v) => v.id == vehicle.id)

            if (!existingVehicle) {
                vehicles.push(vehicle)
                localStorage.setItem("vehicles", JSON.stringify(vehicles))
            }
        })
        .catch((error) => {
            console.error("Error:", error)

            // Show error message
            detailsContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-exclamation-triangle display-1 text-danger mb-3"></i>
          <h3>Error al cargar los detalles</h3>
          <p class="text-muted">No se pudo cargar la información del vehículo. Por favor, inténtalo de nuevo más tarde.</p>
          <a href="vehicles.html" class="btn btn-primary mt-3">Volver a vehículos</a>
        </div>
      `
        })
}

// Render vehicle details
function renderVehicleDetails(vehicle, container) {
    // Ensure we have a valid image URL or use a placeholder
    const imageUrl = vehicle.imagen || "img/placeholder-car.jpg"

    // Default features if none provided
    const features = vehicle.caracteristicas || [
        "Transmisión automática",
        "Aire acondicionado",
        "Bluetooth",
        "GPS",
        "Cámara trasera",
        "Control de crucero",
    ]

    container.innerHTML = `
    <div class="row">
      <div class="col-lg-8 mb-4">
        <div class="card border-0 shadow-sm overflow-hidden">
          <img src="${imageUrl}" class="card-img-top" alt="${vehicle.marca} ${vehicle.modelo}" style="height: 400px; object-fit: cover;">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h2 class="fw-bold mb-0">${vehicle.marca} ${vehicle.modelo}</h2>
              <span class="badge bg-${vehicle.disponible ? "success" : "danger"} rounded-pill">${vehicle.disponible ? "Disponible" : "No disponible"}</span>
            </div>
            
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="d-flex align-items-center mb-3">
                  <div class="bg-light rounded-circle p-2 me-3">
                    <i class="bi bi-calendar-date text-primary"></i>
                  </div>
                  <div>
                    <p class="text-muted mb-0">Año</p>
                    <p class="fw-bold mb-0">${vehicle.año}</p>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="d-flex align-items-center mb-3">
                  <div class="bg-light rounded-circle p-2 me-3">
                    <i class="bi bi-tag text-primary"></i>
                  </div>
                  <div>
                    <p class="text-muted mb-0">Tipo</p>
                    <p class="fw-bold mb-0">${vehicle.tipo}</p>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="d-flex align-items-center mb-3">
                  <div class="bg-light rounded-circle p-2 me-3">
                    <i class="bi bi-people text-primary"></i>
                  </div>
                  <div>
                    <p class="text-muted mb-0">Plazas</p>
                    <p class="fw-bold mb-0">${vehicle.plazas || "5"}</p>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="d-flex align-items-center mb-3">
                  <div class="bg-light rounded-circle p-2 me-3">
                    <i class="bi bi-star text-primary"></i>
                  </div>
                  <div>
                    <p class="text-muted mb-0">Valoración</p>
                    <p class="fw-bold mb-0">
                      <i class="bi bi-star-fill text-warning"></i>
                      ${vehicle.valoracion || "4.5"} (${Math.floor(Math.random() * 50) + 10} reseñas)
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <h4 class="fw-bold mb-3">Descripción</h4>
            <p class="mb-4">${vehicle.descripcion || "Información no disponible"}</p>
            
            <h4 class="fw-bold mb-3">Características</h4>
            <div class="row g-3 mb-4">
              ${features
        .map(
            (feature) => `
                <div class="col-md-6 col-lg-4">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-check-circle-fill text-primary me-2"></i>
                    <span>${feature}</span>
                  </div>
                </div>
              `,
        )
        .join("")}
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm sticky-top" style="top: 100px;">
          <div class="card-body p-4">
            <h3 class="fw-bold mb-4">Reservar ahora</h3>
            
            <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded mb-4">
              <span class="fw-bold">Precio por día</span>
              <span class="fs-4 fw-bold text-primary">${vehicle.precio}€</span>
            </div>
            
            <form id="rental-form">
              <input type="hidden" id="vehicle-id" value="${vehicle.id}">
              
              <div class="mb-3">
                <label for="rental-type" class="form-label">Tipo de alquiler</label>
                <select class="form-select" id="rental-type" required>
                  <option value="hourly">Por horas</option>
                  <option value="daily" selected>Por días</option>
                </select>
              </div>
              
              <div id="hourly-options" class="mb-3 d-none">
                <label for="hourly-duration" class="form-label">Duración (horas)</label>
                <select class="form-select" id="hourly-duration">
                  ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        .map(
            (hour) => `
                    <option value="${hour}">${hour} hora${hour > 1 ? "s" : ""}</option>
                  `,
        )
        .join("")}
                </select>
                <small class="text-muted">
                  <i class="bi bi-info-circle me-1"></i>
                  Descuento del 10% a partir de 3 horas, 15% a partir de 6 horas
                </small>
              </div>
              
              <div id="daily-options" class="mb-3">
                <label for="daily-duration" class="form-label">Duración (días)</label>
                <select class="form-select" id="daily-duration">
                  ${[1, 2, 3, 4, 5, 6, 7]
        .map(
            (day) => `
                    <option value="${day}">${day} día${day > 1 ? "s" : ""}</option>
                  `,
        )
        .join("")}
                </select>
                <small class="text-muted">
                  <i class="bi bi-info-circle me-1"></i>
                  Descuento del 15% a partir de 3 días, 25% a partir de 5 días
                </small>
              </div>
              
              <div class="mb-4">
                <label for="pickup-date" class="form-label">Fecha de recogida</label>
                <input type="date" class="form-control" id="pickup-date" required>
              </div>
              
              <div class="d-grid gap-2">
                <button type="button" class="btn btn-primary" id="add-to-cart-button">
                  <i class="bi bi-cart-plus me-2"></i>
                  Añadir al carrito
                </button>
                <button type="submit" class="btn btn-outline-primary">
                  <i class="bi bi-lightning-charge me-2"></i>
                  Alquilar ahora
                </button>
              </div>
            </form>
            
            <hr class="my-4">
            
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-shield-check text-success fs-4 me-3"></i>
              <div>
                <h6 class="fw-bold mb-1">Seguro incluido</h6>
                <p class="text-muted small mb-0">Cobertura completa incluida en el precio</p>
              </div>
            </div>
            
            <div class="d-flex align-items-center mb-3">
              <i class="bi bi-speedometer2 text-success fs-4 me-3"></i>
              <div>
                <h6 class="fw-bold mb-1">Kilometraje ilimitado</h6>
                <p class="text-muted small mb-0">Sin restricciones de kilometraje</p>
              </div>
            </div>
            
            <div class="d-flex align-items-center">
              <i class="bi bi-headset text-success fs-4 me-3"></i>
              <div>
                <h6 class="fw-bold mb-1">Asistencia 24/7</h6>
                <p class="text-muted small mb-0">Soporte técnico disponible todo el día</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

    // Initialize date picker with today as minimum date
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const pickupDate = document.getElementById("pickup-date")
    if (pickupDate) {
        pickupDate.min = today.toISOString().split("T")[0]
        pickupDate.value = tomorrow.toISOString().split("T")[0]
    }

    // Add event listeners
    const rentalForm = document.getElementById("rental-form")
    if (rentalForm) {
        rentalForm.addEventListener("submit", (e) => {
            e.preventDefault()

            // Check if user is logged in
            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

            if (!isLoggedIn) {
                alert("Debes iniciar sesión para realizar un alquiler")
                window.location.href = "login.html"
                return
            }

            const vehicleId = document.getElementById("vehicle-id").value
            const rentalType = document.getElementById("rental-type").value
            let duration, pickupDate

            if (rentalType === "hourly") {
                duration = document.getElementById("hourly-duration").value
            } else {
                duration = document.getElementById("daily-duration").value
            }

            pickupDate = document.getElementById("pickup-date").value

            createRental(vehicleId, rentalType, duration, pickupDate)
        })
    }

    const rentalType = document.getElementById("rental-type")
    if (rentalType) {
        rentalType.addEventListener("change", toggleRentalOptions)
    }

    const addToCartButton = document.getElementById("add-to-cart-button")
    if (addToCartButton) {
        addToCartButton.addEventListener("click", () => {
            const vehicleId = document.getElementById("vehicle-id").value
            const rentalType = document.getElementById("rental-type").value
            let duration

            if (rentalType === "hourly") {
                duration = document.getElementById("hourly-duration").value
            } else {
                duration = document.getElementById("daily-duration").value
            }

            const pickupDate = document.getElementById("pickup-date").value

            // Create cart item
            const cartItem = {
                vehicleId,
                rentalType,
                duration,
                pickupDate,
            }

            // Add to cart
            const cart = JSON.parse(localStorage.getItem("cart") || "[]")
            cart.push(cartItem)
            localStorage.setItem("cart", JSON.stringify(cart))

            // Update cart count
            updateCartCount()

            // Show success message
            showAddToCartModal(vehicle)
        })
    }

    // Initialize rental options visibility
    toggleRentalOptions()
}

// Toggle rental options based on selected type
function toggleRentalOptions() {
    const rentalType = document.getElementById("rental-type")
    const hourlyOptions = document.getElementById("hourly-options")
    const dailyOptions = document.getElementById("daily-options")

    if (!rentalType || !hourlyOptions || !dailyOptions) return

    if (rentalType.value === "hourly") {
        hourlyOptions.classList.remove("d-none")
        dailyOptions.classList.add("d-none")
    } else {
        hourlyOptions.classList.add("d-none")
        dailyOptions.classList.remove("d-none")
    }
}

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById("cart-count")
    if (!cartCount) return

    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const count = cart.length

    cartCount.textContent = count
    cartCount.style.display = count > 0 ? "flex" : "none"
}

// Show modal when adding to cart
function showAddToCartModal(vehicle) {
    // Create modal if it doesn't exist
    let modal = document.getElementById("addToCartModal")

    if (!modal) {
        const modalHTML = `
      <div class="modal fade" id="addToCartModal" tabindex="-1" aria-labelledby="addToCartModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-success text-white">
              <h5 class="modal-title" id="addToCartModalLabel">
                <i class="bi bi-check-circle me-2"></i>Añadido al carrito
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <div class="d-flex align-items-center mb-3">
                <img src="${vehicle.imagen || "img/placeholder-car.jpg"}" alt="${vehicle.marca} ${vehicle.modelo}" class="img-thumbnail me-3" style="width: 80px; height: 60px; object-fit: cover;">
                <div>
                  <h6 class="mb-0">${vehicle.marca} ${vehicle.modelo}</h6>
                  <span class="badge bg-secondary">${vehicle.tipo}</span>
                </div>
              </div>
              <p class="mb-0">El vehículo ha sido añadido a tu carrito de alquiler.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Seguir comprando</button>
              <a href="cart.html" class="btn btn-primary">
                <i class="bi bi-cart me-2"></i>Ver carrito
              </a>
            </div>
          </div>
        </div>
      </div>
    `

        // Append modal to body
        const div = document.createElement("div")
        div.innerHTML = modalHTML
        document.body.appendChild(div.firstChild)

        modal = document.getElementById("addToCartModal")
    }

    // Show modal
    const bsModal = new bootstrap.Modal(modal)
    bsModal.show()
}

// Load vehicle location on map
function loadVehicleLocation(vehicleId) {
    // Fetch vehicle location from API
    fetch(`http://localhost:8080/api/vehiculos/${vehicleId}/ubicacion`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error al obtener ubicación del vehículo")
            }
            return response.json()
        })
        .then((location) => {
            // Initialize map with vehicle location
            initMap(location.latitud, location.longitud, location.direccion)
        })
        .catch((error) => {
            console.error("Error:", error)

            // Use default location if API fails
            initMap(40.416775, -3.70379, "Madrid, España")
        })
}

// Initialize map
function initMap(lat, lng, address) {
    const mapContainer = document.getElementById("vehicle-map")
    if (!mapContainer) return

    // Check if Leaflet is available
    if (typeof L === "undefined") {
        console.error("Leaflet library not loaded")
        mapContainer.innerHTML = `
      <div class="alert alert-warning">
        <i class="bi bi-exclamation-triangle me-2"></i>
        No se pudo cargar el mapa. Por favor, recarga la página.
      </div>
    `
        return
    }

    // Create map
    const map = L.map(mapContainer).setView([lat, lng], 15)

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    // Add marker
    const marker = L.marker([lat, lng]).addTo(map)
    marker.bindPopup(`<b>Ubicación del vehículo</b><br>${address}`).openPopup()
}

// Load similar vehicles
function loadSimilarVehicles(vehicleId) {
    const similarVehiclesContainer = document.getElementById("similar-vehicles")

    if (!similarVehiclesContainer) return

    // Fetch similar vehicles from API
    fetch(`http://localhost:8080/api/vehiculos/${vehicleId}/similares`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error al obtener vehículos similares")
            }
            return response.json()
        })
        .then((vehicles) => {
            // Render similar vehicles
            renderSimilarVehicles(vehicles, similarVehiclesContainer)
        })
        .catch((error) => {
            console.error("Error:", error)

            // Fetch all vehicles if API fails
            fetch("http://localhost:8080/api/vehiculos/disponibles")
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Error al obtener vehículos")
                    }
                    return response.json()
                })
                .then((allVehicles) => {
                    // Filter out current vehicle and get random 3
                    const filteredVehicles = allVehicles
                        .filter((v) => v.id != vehicleId)
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 3)

                    renderSimilarVehicles(filteredVehicles, similarVehiclesContainer)
                })
                .catch((error) => {
                    console.error("Error:", error)
                    similarVehiclesContainer.innerHTML = `
            <div class="col-12 text-center py-3">
              <p class="text-muted">No se pudieron cargar vehículos similares</p>
            </div>
          `
                })
        })
}

// Render similar vehicles
function renderSimilarVehicles(vehicles, container) {
    if (vehicles.length === 0) {
        container.innerHTML = `
      <div class="col-12 text-center py-3">
        <p class="text-muted">No hay vehículos similares disponibles</p>
      </div>
    `
        return
    }

    container.innerHTML = ""

    vehicles.forEach((vehicle) => {
        const col = document.createElement("div")
        col.className = "col-md-6 col-lg-4"

        // Ensure we have a valid image URL or use a placeholder
        const imageUrl = vehicle.imagen || "img/placeholder-car.jpg"

        col.innerHTML = `
      <div class="card h-100 border-0 shadow-sm">
        <img src="${imageUrl}" class="card-img-top" alt="${vehicle.marca} ${vehicle.modelo}" style="height: 200px; object-fit: cover;">
        <div class="card-body">
          <h5 class="card-title fw-bold">${vehicle.marca} ${vehicle.modelo}</h5>
          <p class="card-text text-muted small">${vehicle.descripcion ? vehicle.descripcion.substring(0, 100) + "..." : "Información no disponible"}</p>
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
          <a href="vehicle-details.html?id=${vehicle.id}" class="btn btn-outline-primary btn-sm">Ver detalles</a>
        </div>
      </div>
    `

        container.appendChild(col)
    })
}

// Create rental in backend
function createRental(vehicleId, rentalType, duration, pickupDate) {
    // Get user info from localStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")

    if (!currentUser.id) {
        alert("Debes iniciar sesión para realizar un alquiler")
        return
    }

    // Calculate end date based on rental type and duration
    const startDate = new Date(pickupDate)
    const endDate = new Date(startDate)

    if (rentalType === "hourly") {
        endDate.setHours(endDate.getHours() + Number.parseInt(duration))
    } else {
        endDate.setDate(endDate.getDate() + Number.parseInt(duration))
    }

    const rentalData = {
        vehiculoId: vehicleId,
        usuarioId: currentUser.id,
        fechaInicio: startDate.toISOString(),
        fechaFin: endDate.toISOString(),
        estado: "PENDIENTE",
        tipoDuracion: rentalType === "hourly" ? "HORAS" : "DIAS",
        duracion: Number.parseInt(duration),
    }

    // Show loading modal
    showLoadingModal("Procesando tu alquiler...")

    // Send rental data to backend
    fetch("http://localhost:8080/api/alquileres", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(rentalData),
    })
        .then((response) => {
            // Hide loading modal
            hideLoadingModal()

            if (!response.ok) {
                throw new Error("Error al crear el alquiler")
            }
            return response.json()
        })
        .then((data) => {
            // Show success modal
            showSuccessModal(
                "¡Alquiler creado con éxito!",
                "Tu alquiler ha sido registrado correctamente. Puedes ver los detalles en tu panel de usuario.",
                "user-dashboard.html",
            )
        })
        .catch((error) => {
            console.error("Error:", error)

            // Show error modal
            showErrorModal(
                "Error al crear el alquiler",
                "No se pudo procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.",
            )
        })
}

// Show loading modal
function showLoadingModal(message) {
    // Create modal if it doesn't exist
    let modal = document.getElementById("loadingModal")

    if (!modal) {
        const modalHTML = `
      <div class="modal fade" id="loadingModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-sm">
          <div class="modal-content">
            <div class="modal-body text-center p-4">
              <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mb-0" id="loadingModalMessage">${message}</p>
            </div>
          </div>
        </div>
      </div>
    `

        // Append modal to body
        const div = document.createElement("div")
        div.innerHTML = modalHTML
        document.body.appendChild(div.firstChild)

        modal = document.getElementById("loadingModal")
    } else {
        document.getElementById("loadingModalMessage").textContent = message
    }

    // Show modal
    const bsModal = new bootstrap.Modal(modal)
    bsModal.show()
}

// Hide loading modal
function hideLoadingModal() {
    const modal = document.getElementById("loadingModal")
    if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal)
        if (bsModal) {
            bsModal.hide()
        }
    }
}

// Show success modal
function showSuccessModal(title, message, redirectUrl) {
    // Create modal if it doesn't exist
    let modal = document.getElementById("successModal")

    if (!modal) {
        const modalHTML = `
      <div class="modal fade" id="successModal" tabindex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-success text-white">
              <h5 class="modal-title" id="successModalLabel">
                <i class="bi bi-check-circle me-2"></i><span id="successModalTitle">${title}</span>
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <p class="mb-0" id="successModalMessage">${message}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
              ${redirectUrl ? `<a href="${redirectUrl}" class="btn btn-primary">Continuar</a>` : ""}
            </div>
          </div>
        </div>
      </div>
    `

        // Append modal to body
        const div = document.createElement("div")
        div.innerHTML = modalHTML
        document.body.appendChild(div.firstChild)

        modal = document.getElementById("successModal")
    } else {
        document.getElementById("successModalTitle").textContent = title
        document.getElementById("successModalMessage").textContent = message

        // Update redirect button if needed
        const footer = modal.querySelector(".modal-footer")
        const redirectButton = footer.querySelector("a.btn-primary")

        if (redirectUrl && !redirectButton) {
            const button = document.createElement("a")
            button.href = redirectUrl
            button.className = "btn btn-primary"
            button.textContent = "Continuar"
            footer.appendChild(button)
        } else if (redirectUrl && redirectButton) {
            redirectButton.href = redirectUrl
        } else if (!redirectUrl && redirectButton) {
            redirectButton.remove()
        }
    }

    // Show modal
    const bsModal = new bootstrap.Modal(modal)
    bsModal.show()
}

// Show error modal
function showErrorModal(title, message) {
    // Create modal if it doesn't exist
    let modal = document.getElementById("errorModal")

    if (!modal) {
        const modalHTML = `
      <div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title" id="errorModalLabel">
                <i class="bi bi-exclamation-triangle me-2"></i><span id="errorModalTitle">${title}</span>
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <p class="mb-0" id="errorModalMessage">${message}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
              <button type="button" class="btn btn-outline-danger" onclick="window.location.reload()">Reintentar</button>
            </div>
          </div>
        </div>
      </div>
    `

        // Append modal to body
        const div = document.createElement("div")
        div.innerHTML = modalHTML
        document.body.appendChild(div.firstChild)

        modal = document.getElementById("errorModal")
    } else {
        document.getElementById("errorModalTitle").textContent = title
        document.getElementById("errorModalMessage").textContent = message
    }

    // Show modal
    const bsModal = new bootstrap.Modal(modal)
    bsModal.show()
}

// Calculate price with progressive discounts
function calculatePrice(basePrice, duration, rentalType) {
    let totalPrice = 0

    if (rentalType === "hourly") {
        // Progressive discounts for hourly rentals
        // 1-2 hours: full price
        // 3-5 hours: 10% discount on additional hours
        // 6+ hours: 15% discount on additional hours

        if (duration <= 2) {
            totalPrice = basePrice * duration
        } else if (duration <= 5) {
            totalPrice = basePrice * 2 // First 2 hours at full price
            totalPrice += basePrice * 0.9 * (duration - 2) // Remaining hours with 10% discount
        } else {
            totalPrice = basePrice * 2 // First 2 hours at full price
            totalPrice += basePrice * 0.9 * 3 // Next 3 hours with 10% discount
            totalPrice += basePrice * 0.85 * (duration - 5) // Remaining hours with 15% discount
        }
    } else {
        // Progressive discounts for daily rentals
        // 1-2 days: full price
        // 3-4 days: 15% discount on additional days
        // 5+ days: 25% discount on additional days

        if (duration <= 2) {
            totalPrice = basePrice * duration
        } else if (duration <= 4) {
            totalPrice = basePrice * 2 // First 2 days at full price
            totalPrice += basePrice * 0.85 * (duration - 2) // Remaining days with 15% discount
        } else {
            totalPrice = basePrice * 2 // First 2 days at full price
            totalPrice += basePrice * 0.85 * 2 // Next 2 days with 15% discount
            totalPrice += basePrice * 0.75 * (duration - 4) // Remaining days with 25% discount
        }
    }

    return totalPrice
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Update cart count on page load
    updateCartCount()
})

const initializeVehicleMap = () => {}
const bootstrap = {}
const L = {}
