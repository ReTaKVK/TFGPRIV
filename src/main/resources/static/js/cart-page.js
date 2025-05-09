// cart-page.js - Handles cart page functionality

document.addEventListener("DOMContentLoaded", () => {
    // Load cart items
    loadCartItems()

    // Setup event listeners
    setupEventListeners()

    // Initialize date pickers with today as minimum date
    initializeDatePickers()
})

// Load cart items
function loadCartItems() {
    const cartItemsList = document.getElementById("cart-items-list")
    const emptyCartMessage = document.getElementById("empty-cart-message")
    const cartItemsContainer = document.getElementById("cart-items-container")
    const cartItemsCount = document.getElementById("cart-items-count")
    const cartActions = document.getElementById("cart-actions")

    if (!cartItemsList || !emptyCartMessage || !cartItemsContainer || !cartItemsCount || !cartActions) return

    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")

    // Update cart count
    cartItemsCount.textContent = cart.length

    if (cart.length === 0) {
        // Show empty cart message
        emptyCartMessage.classList.remove("d-none")
        cartItemsContainer.classList.add("d-none")
        cartActions.classList.add("d-none")

        // Reset summary
        updateCartSummary(0, 0, 0)
        return
    }

    // Hide empty cart message
    emptyCartMessage.classList.add("d-none")
    cartItemsContainer.classList.remove("d-none")
    cartActions.classList.remove("d-none")

    // Clear cart items
    cartItemsList.innerHTML = ""

    // Get vehicles data from localStorage or fetch from API
    let vehicles = []
    const storedVehicles = JSON.parse(localStorage.getItem("vehicles") || "[]")

    if (storedVehicles.length > 0) {
        vehicles = storedVehicles
        renderCartItems(cart, vehicles, cartItemsList)
    } else {
        // Show loading spinner
        cartItemsList.innerHTML = `
      <li class="list-group-item p-4">
        <div class="text-center py-3">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
      </li>
    `

        // Fetch vehicles from API
        fetch("http://localhost:8080/api/vehiculos/disponibles")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error al obtener vehículos")
                }
                return response.json()
            })
            .then((data) => {
                vehicles = data
                localStorage.setItem("vehicles", JSON.stringify(vehicles))
                renderCartItems(cart, vehicles, cartItemsList)
            })
            .catch((error) => {
                console.error("Error:", error)
                cartItemsList.innerHTML = `
          <li class="list-group-item p-4">
            <div class="text-center py-3">
              <i class="bi bi-exclamation-triangle text-danger display-4 mb-3"></i>
              <h5>Error al cargar los vehículos</h5>
              <p class="text-muted">No se pudieron cargar los detalles de los vehículos. Por favor, inténtalo de nuevo más tarde.</p>
              <button class="btn btn-primary mt-2" onclick="loadCartItems()">Reintentar</button>
            </div>
          </li>
        `
            })
    }
}

// Render cart items
function renderCartItems(cart, vehicles, cartItemsList) {
    let subtotal = 0

    // Process each cart item
    cart.forEach((item, index) => {
        const vehicle = vehicles.find((v) => v.id == item.vehicleId)
        if (!vehicle) return

        // Calculate rental price based on type and duration
        let rentalPrice = 0
        let durationText = ""

        if (item.rentalType === "hourly") {
            rentalPrice = calculateHourlyRate(vehicle.precio, Number.parseInt(item.duration))
            durationText = `${item.duration} hora${item.duration > 1 ? "s" : ""}`
        } else {
            rentalPrice = calculateDailyRate(vehicle.precio, Number.parseInt(item.duration))
            durationText = `${item.duration} día${item.duration > 1 ? "s" : ""}`
        }

        subtotal += rentalPrice

        // Create cart item element
        const cartItem = document.createElement("li")
        cartItem.className = "list-group-item p-4"
        cartItem.innerHTML = `
      <div class="row align-items-center">
        <div class="col-md-2 mb-3 mb-md-0">
          <img src="${vehicle.imagen || "img/placeholder-car.jpg"}" alt="${vehicle.marca} ${vehicle.modelo}" class="img-fluid rounded" style="max-height: 80px; object-fit: cover;">
        </div>
        <div class="col-md-4 mb-3 mb-md-0">
          <h5 class="mb-1">${vehicle.marca} ${vehicle.modelo}</h5>
          <div class="d-flex align-items-center">
            <span class="badge bg-primary me-2">${vehicle.tipo}</span>
            <small class="text-muted">${vehicle.año}</small>
          </div>
        </div>
        <div class="col-md-3 mb-3 mb-md-0">
          <div class="d-flex flex-column">
            <small class="text-muted">Duración:</small>
            <span>${durationText}</span>
            <small class="text-muted mt-2">Fecha:</small>
            <span>${formatDate(item.pickupDate)}</span>
          </div>
        </div>
        <div class="col-md-2 mb-3 mb-md-0 text-md-end">
          <div class="fw-bold text-primary">${rentalPrice.toFixed(2)}€</div>
          <small class="text-muted">${vehicle.precio}€/día</small>
        </div>
        <div class="col-md-1 text-end">
          <div class="btn-group-vertical">
            <button class="btn btn-sm btn-outline-primary edit-item" data-index="${index}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `

        cartItemsList.appendChild(cartItem)
    })

    // Calculate tax and total
    const tax = subtotal * 0.21 // 21% IVA
    const insurance = cart.length > 0 ? 15 : 0 // Fixed insurance fee
    const total = subtotal + tax + insurance

    // Update cart summary
    updateCartSummary(subtotal, tax, insurance)
}

// Update cart summary
function updateCartSummary(subtotal, tax, insurance) {
    const subtotalElement = document.getElementById("cart-subtotal")
    const taxElement = document.getElementById("cart-tax")
    const insuranceElement = document.getElementById("cart-insurance")
    const totalElement = document.getElementById("cart-total")

    if (!subtotalElement || !taxElement || !insuranceElement || !totalElement) return

    const total = subtotal + tax + insurance

    subtotalElement.textContent = `€${subtotal.toFixed(2)}`
    taxElement.textContent = `€${tax.toFixed(2)}`
    insuranceElement.textContent = `€${insurance.toFixed(2)}`
    totalElement.textContent = `€${total.toFixed(2)}`
}

// Setup event listeners
function setupEventListeners() {
    // Clear cart button
    const clearCartBtn = document.getElementById("clear-cart-btn")
    if (clearCartBtn) {
        clearCartBtn.addEventListener("click", () => {
            const clearCartModal = new bootstrap.Modal(document.getElementById("clear-cart-modal"))
            clearCartModal.show()
        })
    }

    // Confirm clear cart button
    const confirmClearBtn = document.getElementById("confirm-clear-btn")
    if (confirmClearBtn) {
        confirmClearBtn.addEventListener("click", () => {
            clearCart()
            const clearCartModal = bootstrap.Modal.getInstance(document.getElementById("clear-cart-modal"))
            clearCartModal.hide()
        })
    }

    // Checkout button
    const checkoutBtn = document.getElementById("checkout-btn")
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", proceedToCheckout)
    }

    // Remove item buttons (delegated event)
    document.addEventListener("click", (e) => {
        if (e.target.closest(".remove-item")) {
            const button = e.target.closest(".remove-item")
            const index = button.dataset.index

            // Set the index in the modal
            document.getElementById("remove-item-index").value = index

            // Show the modal
            const removeItemModal = new bootstrap.Modal(document.getElementById("remove-item-modal"))
            removeItemModal.show()
        }
    })

    // Confirm remove button
    const confirmRemoveBtn = document.getElementById("confirm-remove-btn")
    if (confirmRemoveBtn) {
        confirmRemoveBtn.addEventListener("click", () => {
            const index = document.getElementById("remove-item-index").value
            removeCartItem(index)

            // Hide the modal
            const removeItemModal = bootstrap.Modal.getInstance(document.getElementById("remove-item-modal"))
            removeItemModal.hide()
        })
    }

    // Edit item buttons (delegated event)
    document.addEventListener("click", (e) => {
        if (e.target.closest(".edit-item")) {
            const button = e.target.closest(".edit-item")
            const index = button.dataset.index

            // Get the cart item
            const cart = JSON.parse(localStorage.getItem("cart") || "[]")
            const item = cart[index]

            if (item) {
                // Set the values in the modal
                document.getElementById("update-item-index").value = index
                document.getElementById("rental-type-update").value = item.rentalType

                // Toggle options visibility
                toggleUpdateRentalOptions()

                // Set duration
                if (item.rentalType === "hourly") {
                    document.getElementById("hourly-duration-update").value = item.duration
                } else {
                    document.getElementById("daily-duration-update").value = item.duration
                }

                // Set pickup date
                document.getElementById("pickup-date-update").value = item.pickupDate

                // Show the modal
                const updateDurationModal = new bootstrap.Modal(document.getElementById("update-duration-modal"))
                updateDurationModal.show()
            }
        }
    })

    // Rental type change in update modal
    const rentalTypeUpdate = document.getElementById("rental-type-update")
    if (rentalTypeUpdate) {
        rentalTypeUpdate.addEventListener("change", toggleUpdateRentalOptions)
    }

    // Confirm update button
    const confirmUpdateBtn = document.getElementById("confirm-update-btn")
    if (confirmUpdateBtn) {
        confirmUpdateBtn.addEventListener("click", () => {
            updateCartItem()

            // Hide the modal
            const updateDurationModal = bootstrap.Modal.getInstance(document.getElementById("update-duration-modal"))
            updateDurationModal.hide()
        })
    }
}

// Toggle rental options in update modal
function toggleUpdateRentalOptions() {
    const rentalType = document.getElementById("rental-type-update")
    const hourlyOptions = document.getElementById("hourly-options-update")
    const dailyOptions = document.getElementById("daily-options-update")

    if (!rentalType || !hourlyOptions || !dailyOptions) return

    if (rentalType.value === "hourly") {
        hourlyOptions.classList.remove("d-none")
        dailyOptions.classList.add("d-none")
    } else {
        hourlyOptions.classList.add("d-none")
        dailyOptions.classList.remove("d-none")
    }
}

// Initialize date pickers
function initializeDatePickers() {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const pickupDateUpdate = document.getElementById("pickup-date-update")
    if (pickupDateUpdate) {
        pickupDateUpdate.min = today.toISOString().split("T")[0]
    }
}

// Clear cart
function clearCart() {
    localStorage.setItem("cart", JSON.stringify([]))
    loadCartItems()
    showAlert("Carrito vaciado correctamente", "success")
}

// Remove cart item
function removeCartItem(index) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    cart.splice(index, 1)
    localStorage.setItem("cart", JSON.stringify(cart))
    loadCartItems()
    showAlert("Vehículo eliminado del carrito", "success")
}

// Update cart item
function updateCartItem() {
    const index = document.getElementById("update-item-index").value
    const rentalType = document.getElementById("rental-type-update").value
    let duration

    if (rentalType === "hourly") {
        duration = document.getElementById("hourly-duration-update").value
    } else {
        duration = document.getElementById("daily-duration-update").value
    }

    const pickupDate = document.getElementById("pickup-date-update").value

    // Update cart item
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")

    if (cart[index]) {
        cart[index].rentalType = rentalType
        cart[index].duration = duration
        cart[index].pickupDate = pickupDate

        localStorage.setItem("cart", JSON.stringify(cart))
        loadCartItems()
        showAlert("Alquiler actualizado correctamente", "success")
    }
}

// Proceed to checkout
function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")

    if (cart.length === 0) {
        showAlert("Tu carrito está vacío", "warning")
        return
    }

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

    if (!isLoggedIn) {
        // Show login required modal
        const loginRequiredModal = new bootstrap.Modal(document.getElementById("login-required-modal"))
        loginRequiredModal.show()
        return
    }

    // Redirect to checkout page
    window.location.href = "checkout.html"
}

// Calculate hourly rate with progressive pricing
function calculateHourlyRate(basePrice, hours) {
    // Base price is per day, so divide by 24 to get hourly rate
    const hourlyRate = basePrice / 24

    // Apply progressive discount based on duration
    let discountFactor = 1
    if (hours >= 10) {
        discountFactor = 0.8 // 20% discount for 10-12 hours
    } else if (hours >= 6) {
        discountFactor = 0.85 // 15% discount for 6-9 hours
    } else if (hours >= 3) {
        discountFactor = 0.9 // 10% discount for 3-5 hours
    }

    // Calculate final hourly rate
    return hourlyRate * hours * discountFactor
}

// Calculate daily rate with progressive pricing
function calculateDailyRate(basePrice, days) {
    // Apply progressive discount based on duration
    let discountFactor = 1
    if (days >= 5) {
        discountFactor = 0.75 // 25% discount for 5-7 days
    } else if (days >= 3) {
        discountFactor = 0.85 // 15% discount for 3-4 days
    } else if (days >= 2) {
        discountFactor = 0.95 // 5% discount for 2 days
    }

    // Calculate final daily rate
    return basePrice * days * discountFactor
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return ""

    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
}

// Show alert
function showAlert(message, type = "info") {
    const alertContainer = document.querySelector(".alert-container")
    if (!alertContainer) return

    const alert = document.createElement("div")
    alert.className = `alert alert-${type} alert-dismissible fade show`
    alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `

    alertContainer.appendChild(alert)

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alert)
        bsAlert.close()
    }, 5000)
}
