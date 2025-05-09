// checkout.js - Handles checkout functionality

document.addEventListener("DOMContentLoaded", () => {
    // Check if user is logged in
    checkUserAuthentication()

    // Load cart items in checkout
    loadCheckoutItems()

    // Setup event listeners
    setupCheckoutEventListeners()
})

// Check if user is authenticated
function checkUserAuthentication() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

    if (!isLoggedIn) {
        // Redirect to login page
        window.location.href = "login.html?redirect=checkout"
        return
    }
}

// Load cart items in checkout page
function loadCheckoutItems() {
    const checkoutItems = document.getElementById("checkout-items")
    const subtotalElement = document.getElementById("checkout-subtotal")
    const taxElement = document.getElementById("checkout-tax")
    const insuranceElement = document.getElementById("checkout-insurance")
    const totalElement = document.getElementById("checkout-total")

    if (!checkoutItems || !subtotalElement || !taxElement || !insuranceElement || !totalElement) return

    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")

    if (cart.length === 0) {
        // Redirect to vehicles page if cart is empty
        window.location.href = "vehicles.html"
        return
    }

    // Clear checkout items
    checkoutItems.innerHTML = ""

    // Get vehicles data from localStorage
    const vehicles = JSON.parse(localStorage.getItem("vehicles") || "[]")

    // Calculate subtotal
    let subtotal = 0

    // Add each item to the checkout
    cart.forEach((item) => {
        // Find vehicle data
        const vehicle = vehicles.find((v) => v.id == item.vehicleId)
        if (!vehicle) return

        // Create checkout item element
        const checkoutItem = document.createElement("div")
        checkoutItem.className = "d-flex align-items-center mb-3"

        // Calculate item total based on rental type and duration
        let itemTotal = 0
        let durationText = ""

        if (item.rentalType === "hourly") {
            itemTotal = calculateHourlyRate(vehicle.precio, Number.parseInt(item.duration))
            durationText = `${item.duration} hora${item.duration > 1 ? "s" : ""}`
        } else {
            itemTotal = calculateDailyRate(vehicle.precio, Number.parseInt(item.duration))
            durationText = `${item.duration} día${item.duration > 1 ? "s" : ""}`
        }

        subtotal += itemTotal

        // Set checkout item HTML
        checkoutItem.innerHTML = `
      <img src="${vehicle.imagen || "img/placeholder-car.jpg"}" alt="${vehicle.marca} ${vehicle.modelo}" class="rounded me-3" style="width: 60px; height: 45px; object-fit: cover;">
      <div class="flex-grow-1">
        <h6 class="mb-0">${vehicle.marca} ${vehicle.modelo}</h6>
        <div class="small text-muted">
          ${durationText} · 
          ${formatDate(item.pickupDate)}
        </div>
      </div>
      <div class="text-end">
        <span class="fw-bold">€${itemTotal.toFixed(2)}</span>
      </div>
    `

        // Add checkout item to checkout
        checkoutItems.appendChild(checkoutItem)
    })

    // Calculate tax, insurance, and total
    const tax = subtotal * 0.21 // 21% IVA
    const insurance = 15 // Fixed insurance fee
    const total = subtotal + tax + insurance

    // Update checkout summary
    subtotalElement.textContent = `€${subtotal.toFixed(2)}`
    taxElement.textContent = `€${tax.toFixed(2)}`
    insuranceElement.textContent = `€${insurance.toFixed(2)}`
    totalElement.textContent = `€${total.toFixed(2)}`

    // Pre-fill user information if available
    prefillUserInformation()
}

// Pre-fill user information
function prefillUserInformation() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")

    if (currentUser) {
        const nameField = document.getElementById("checkout-name")
        const emailField = document.getElementById("checkout-email")
        const phoneField = document.getElementById("checkout-phone")

        if (nameField && currentUser.nombre) {
            nameField.value = currentUser.nombre
        }

        if (emailField && currentUser.email) {
            emailField.value = currentUser.email
        }

        if (phoneField && currentUser.telefono) {
            phoneField.value = currentUser.telefono
        }
    }
}

// Setup event listeners for checkout actions
function setupCheckoutEventListeners() {
    // Checkout form
    const checkoutForm = document.getElementById("checkout-form")
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", handleCheckoutSubmit)
    }

    // Payment method radio buttons
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]')
    if (paymentMethods.length > 0) {
        paymentMethods.forEach((method) => {
            method.addEventListener("change", toggleCardFields)
        })
        // Initialize card fields visibility
        toggleCardFields()
    }
}

// Handle checkout form submission
function handleCheckoutSubmit(event) {
    event.preventDefault()

    // Show loading state
    const submitButton = document.getElementById("checkout-submit")
    if (submitButton) {
        submitButton.disabled = true
        submitButton.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Procesando...'
    }

    // Get cart items
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")

    // Create rentals for each cart item
    const rentalPromises = cart.map((item) => createRentalFromCart(item))

    // Process all rentals
    Promise.all(rentalPromises)
        .then((results) => {
            // Show success message
            showAlert("¡Reserva completada con éxito! Recibirás un email con los detalles de tu reserva.", "success")

            // Clear cart after successful checkout
            localStorage.setItem("cart", JSON.stringify([]))

            // Reset form
            event.target.reset()

            // Show confirmation modal
            showCheckoutConfirmationModal()
        })
        .catch((error) => {
            console.error("Error:", error)
            showAlert("Ha ocurrido un error al procesar tu reserva. Por favor, inténtalo de nuevo más tarde.", "danger")

            // Reset submit button
            if (submitButton) {
                submitButton.disabled = false
                submitButton.innerHTML = "Completar reserva"
            }
        })
}

// Create rental in backend from cart item
function createRentalFromCart(cartItem) {
    return new Promise((resolve, reject) => {
        // Get user info from localStorage
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")

        if (!currentUser.id) {
            reject(new Error("Usuario no autenticado"))
            return
        }

        // Calculate end date based on rental type and duration
        const startDate = new Date(cartItem.pickupDate)
        const endDate = new Date(startDate)

        if (cartItem.rentalType === "hourly") {
            endDate.setHours(endDate.getHours() + Number.parseInt(cartItem.duration))
        } else {
            endDate.setDate(endDate.getDate() + Number.parseInt(cartItem.duration))
        }

        const rentalData = {
            vehiculoId: cartItem.vehicleId,
            usuarioId: currentUser.id,
            fechaInicio: startDate.toISOString(),
            fechaFin: endDate.toISOString(),
            estado: "PENDIENTE",
            tipoDuracion: cartItem.rentalType === "hourly" ? "HORAS" : "DIAS",
            duracion: Number.parseInt(cartItem.duration),
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
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// Toggle card fields based on selected payment method
function toggleCardFields() {
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked')
    const cardFields = document.getElementById("card-fields")

    if (!selectedMethod || !cardFields) return

    if (selectedMethod.value === "card") {
        cardFields.style.display = "block"
        // Make card fields required
        const cardInputs = cardFields.querySelectorAll("input")
        cardInputs.forEach((input) => {
            input.required = true
        })
    } else {
        cardFields.style.display = "none"
        // Make card fields not required
        const cardInputs = cardFields.querySelectorAll("input")
        cardInputs.forEach((input) => {
            input.required = false
        })
    }
}

// Show checkout confirmation modal
function showCheckoutConfirmationModal() {
    // Create modal element
    const modalHTML = `
    <div class="modal fade" id="checkout-confirmation-modal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">¡Reserva completada!</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center">
            <i class="bi bi-check-circle-fill text-success display-1 mb-3"></i>
            <h4 class="mb-3">Tu reserva ha sido procesada con éxito</h4>
            <p>Hemos enviado un correo electrónico con los detalles de tu reserva.</p>
            <p class="mb-0">Número de referencia: <strong>${generateReferenceNumber()}</strong></p>
          </div>
          <div class="modal-footer">
            <a href="user-dashboard.html" class="btn btn-primary">Ver mis alquileres</a>
            <a href="index.html" class="btn btn-outline-primary">Volver al inicio</a>
          </div>
        </div>
      </div>
    </div>
  `

    // Append modal to body
    document.body.insertAdjacentHTML("beforeend", modalHTML)

    // Show modal
    const modalElement = document.getElementById("checkout-confirmation-modal")
    const modal = new bootstrap.Modal(modalElement)
    modal.show()

    // Remove modal from DOM when hidden
    modalElement.addEventListener("hidden.bs.modal", function () {
        this.remove()
        // Redirect to user dashboard
        window.location.href = "user-dashboard.html"
    })
}

// Generate random reference number
function generateReferenceNumber() {
    const prefix = "AR"
    const timestamp = new Date().getTime().toString().slice(-6)
    const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")
    return `${prefix}-${timestamp}-${random}`
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

// Show alert message
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

// Format date for display
function formatDate(dateString) {
    if (!dateString) return ""

    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
}
