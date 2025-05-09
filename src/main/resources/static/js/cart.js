// cart.js - Handles shopping cart functionality

// Initialize cart when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Initialize cart
    initCart()

    // Add event listeners for cart actions
    setupCartEventListeners()

    // Update cart count badge
    updateCartCount()
})

// Initialize cart
function initCart() {
    // Check if cart exists in localStorage
    if (!localStorage.getItem("cart")) {
        // Create empty cart
        localStorage.setItem("cart", JSON.stringify([]))
    }
}

// Setup event listeners for cart actions
function setupCartEventListeners() {
    // Cart toggle button
    const cartToggle = document.getElementById("cart-toggle")
    if (cartToggle) {
        cartToggle.addEventListener("click", toggleCart)
    }

    // Close cart button
    const closeCart = document.getElementById("close-cart")
    if (closeCart) {
        closeCart.addEventListener("click", toggleCart)
    }

    // Cart overlay (background)
    const cartOverlay = document.getElementById("cart-overlay")
    if (cartOverlay) {
        cartOverlay.addEventListener("click", toggleCart)
    }

    // Add to cart button on vehicle details page (hourly)
    const addToCartBtn = document.getElementById("add-to-cart-btn")
    if (addToCartBtn) {
        addToCartBtn.addEventListener("click", () => addToCart("hourly"))
    }

    // Add to cart button on vehicle details page (daily)
    const addToCartBtnDaily = document.getElementById("add-to-cart-btn-daily")
    if (addToCartBtnDaily) {
        addToCartBtnDaily.addEventListener("click", () => addToCart("daily"))
    }

    // Rent now button on vehicle details page (hourly)
    const rentNowBtn = document.getElementById("rent-now-btn")
    if (rentNowBtn) {
        rentNowBtn.addEventListener("click", () => rentNow("hourly"))
    }

    // Rent now button on vehicle details page (daily)
    const rentNowBtnDaily = document.getElementById("rent-now-btn-daily")
    if (rentNowBtnDaily) {
        rentNowBtnDaily.addEventListener("click", () => rentNow("daily"))
    }

    // Clear cart button
    const clearCartBtn = document.getElementById("clear-cart")
    if (clearCartBtn) {
        clearCartBtn.addEventListener("click", clearCart)
    }

    // Add to cart button in vehicle modal
    const addToCartButton = document.getElementById("add-to-cart-button")
    if (addToCartButton) {
        addToCartButton.addEventListener("click", addToCartFromModal)
    }
}

// Toggle cart sidebar
function toggleCart() {
    const cartSidebar = document.getElementById("cart-sidebar")
    const cartOverlay = document.getElementById("cart-overlay")

    if (cartSidebar.classList.contains("active")) {
        // Close cart
        cartSidebar.classList.remove("active")
        cartOverlay.classList.remove("active")
        document.body.style.overflow = ""
    } else {
        // Open cart
        cartSidebar.classList.add("active")
        cartOverlay.classList.add("active")
        document.body.style.overflow = "hidden"

        // Load cart items
        loadCartItems()
    }
}

// Load cart items into the cart sidebar
function loadCartItems() {
    const cartItems = document.getElementById("cart-items")
    const emptyCart = document.getElementById("empty-cart")
    const cartTotal = document.getElementById("cart-total")

    if (!cartItems || !emptyCart || !cartTotal) return

    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")

    if (cart.length === 0) {
        // Show empty cart message
        emptyCart.style.display = "block"
        cartItems.innerHTML = ""
        cartTotal.textContent = "€0"
        return
    }

    // Hide empty cart message
    emptyCart.style.display = "none"

    // Clear cart items
    cartItems.innerHTML = ""

    // Calculate total
    let total = 0

    // Get vehicles data from localStorage
    const vehicles = JSON.parse(localStorage.getItem("vehicles") || "[]")

    // Add each item to the cart
    cart.forEach((item, index) => {
        // Find vehicle data
        const vehicle = vehicles.find((v) => v.id == item.vehicleId)
        if (!vehicle) return

        // Create cart item element
        const cartItem = document.createElement("div")
        cartItem.className = "cart-item"

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

        total += itemTotal

        // Set cart item HTML
        cartItem.innerHTML = `
      <img src="${vehicle.imagen || "img/placeholder-car.jpg"}" alt="${vehicle.marca} ${vehicle.modelo}" class="cart-item-image">
      <div class="cart-item-details">
        <div class="cart-item-title">${vehicle.marca} ${vehicle.modelo}</div>
        <div class="cart-item-info">
          <span>${durationText}</span>
          <span class="mx-2">·</span>
          <span>${formatDate(item.pickupDate)}</span>
        </div>
        <div class="cart-item-price">€${itemTotal.toFixed(2)}</div>
      </div>
      <button class="cart-item-remove" data-index="${index}">
        <i class="bi bi-x-circle"></i>
      </button>
    `

        // Add cart item to cart
        cartItems.appendChild(cartItem)

        // Add event listener to remove button
        const removeButton = cartItem.querySelector(".cart-item-remove")
        removeButton.addEventListener("click", function () {
            removeFromCart(this.dataset.index)
        })
    })

    // Update total
    cartTotal.textContent = `€${total.toFixed(2)}`
}

// Add current vehicle to cart from modal
function addToCartFromModal() {
    // Get vehicle ID
    const vehicleId = document.getElementById("vehicle-id").value
    if (!vehicleId) return

    // Get rental type
    const rentalType = document.getElementById("rental-type").value

    // Get duration based on rental type
    let duration = 0
    if (rentalType === "hourly") {
        duration = document.getElementById("hourly-duration").value
    } else {
        duration = document.getElementById("daily-duration").value
    }

    // Get pickup date
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

    // Show success message with modal
    const addToCartModalElement = document.getElementById("add-to-cart-modal")
    const addToCartModal = new bootstrap.Modal(addToCartModalElement)
    addToCartModal.show()
}

// Add current vehicle to cart
function addToCart(rentalType) {
    // Get vehicle data from modal
    const vehicleId = document.getElementById("vehicle-id").value
    const vehicleTitle = document.getElementById("modal-vehicle-title").textContent
    const vehiclePrice = document.getElementById("modal-vehicle-price").textContent.replace("€", "")

    // Get carousel image
    const carouselItem = document.querySelector("#modal-carousel-inner .carousel-item.active img")
    const vehicleImage = carouselItem ? carouselItem.src : "img/placeholder-car.jpg"

    // Get rental options
    let duration, pickupDate

    if (rentalType === "hourly") {
        duration = document.getElementById("hourly-duration").value
        pickupDate = document.getElementById("pickup-date").value
    } else {
        duration = document.getElementById("daily-duration").value
        pickupDate = document.getElementById("pickup-date-daily").value
    }

    if (!pickupDate) {
        alert("Por favor, selecciona una fecha de recogida")
        return
    }

    // Create cart item
    const cartItem = {
        vehicleId,
        rentalType,
        duration,
        pickupDate,
    }

    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(
        (item) =>
            item.vehicleId == cartItem.vehicleId &&
            item.rentalType === cartItem.rentalType &&
            item.duration == cartItem.duration &&
            item.pickupDate === cartItem.pickupDate,
    )

    if (existingItemIndex !== -1) {
        // Update existing item (in this case, we'll just replace it)
        cart[existingItemIndex] = cartItem
    } else {
        // Add new item
        cart.push(cartItem)
    }

    // Save cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart))

    // Update cart count
    updateCartCount()

    // Show success message
    showCartToast(`${vehicleTitle} añadido al carrito`)

    // Close the modal
    const vehicleModal = document.getElementById("vehicle-modal")
    // Get the Bootstrap modal instance
    const modal = bootstrap.Modal.getInstance(vehicleModal)
    if (modal) {
        modal.hide()
    }

    // Open cart sidebar
    toggleCart()
}

// Remove item from cart
function removeFromCart(index) {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")

    // Remove item at index
    cart.splice(index, 1)

    // Save cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart))

    // Update cart count
    updateCartCount()

    // Reload cart items
    loadCartItems()
}

// Clear all items from cart
function clearCart() {
    // Clear cart in localStorage
    localStorage.setItem("cart", JSON.stringify([]))

    // Update cart count
    updateCartCount()

    // Reload cart items
    loadCartItems()
}

// Update cart count badge
function updateCartCount() {
    const cartCount = document.getElementById("cart-count")
    if (!cartCount) return

    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")

    // Calculate total items
    const totalItems = cart.length

    // Update badge
    cartCount.textContent = totalItems

    // Show/hide badge
    if (totalItems > 0) {
        cartCount.style.display = "inline-block"
    } else {
        cartCount.style.display = "none"
    }
}

// Rent now (skip cart and go directly to checkout)
function rentNow(rentalType) {
    // Add to cart first
    addToCart(rentalType)

    // Redirect to checkout
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

// Show toast notification for cart actions
function showCartToast(message) {
    const cartToastMessage = document.getElementById("cart-toast-message")
    if (!cartToastMessage) return

    // Set message
    cartToastMessage.textContent = message

    // Show toast
    const cartToast = document.getElementById("cart-toast")
    const toast = new bootstrap.Toast(cartToast)
    toast.show()
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return ""

    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
}
