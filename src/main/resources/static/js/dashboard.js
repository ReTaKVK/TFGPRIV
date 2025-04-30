// dashboard.js - Handles user dashboard functionality

// Check if user is logged in
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = '/login.html';
        return null;
    }
    return user;
}

// Load user profile information
function loadUserProfile(user) {
    const profileNameElement = document.getElementById('profile-name');
    const profileEmailElement = document.getElementById('profile-email');
    const profileRoleElement = document.getElementById('profile-role');
    const profileIdElement = document.getElementById('profile-id');
    const userGreetingElement = document.getElementById('user-greeting');

    if (profileNameElement) profileNameElement.textContent = user.nombre;
    if (profileEmailElement) profileEmailElement.textContent = user.email;
    if (profileRoleElement) profileRoleElement.textContent = user.role;
    if (profileIdElement) profileIdElement.textContent = user.id;
    if (userGreetingElement) userGreetingElement.textContent = user.nombre;
}

// Load user rentals
function loadUserRentals(user) {
    const rentalsContainer = document.getElementById('rentals-container');
    if (!rentalsContainer) return;

    // Get rentals from localStorage (in a real app, this would be an API call)
    const allRentals = JSON.parse(localStorage.getItem('rentals') || '[]');
    const userRentals = allRentals.filter(rental => rental.usuarioId === user.id);

    // Get vehicles data to display vehicle information
    const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');

    // Update dashboard stats
    updateDashboardStats(userRentals);

    // Clear container
    rentalsContainer.innerHTML = '';

    if (userRentals.length === 0) {
        rentalsContainer.innerHTML = `
      <div class="empty-rentals">
        <div class="icon-container">
          <i class="fas fa-car"></i>
        </div>
        <h3>No tienes alquileres</h3>
        <p>Explora nuestra selección de vehículos y realiza tu primer alquiler.</p>
        <a href="/vehicles.html" class="btn btn-primary">Ver vehículos disponibles</a>
      </div>
    `;
        return;
    }

    // Create rental cards
    userRentals.forEach(rental => {
        const vehicle = vehicles.find(v => v.id === rental.vehiculoId) || {
            marca: 'Vehículo',
            modelo: `#${rental.vehiculoId}`,
            imagen: '/img/placeholder.jpg'
        };

        const rentalCard = document.createElement('div');
        rentalCard.className = 'rental-card';
        rentalCard.innerHTML = `
      <div class="rental-card-content">
        <div class="rental-image">
          <img src="${vehicle.imagen}" alt="${vehicle.marca} ${vehicle.modelo}">
        </div>
        <div class="rental-details">
          <div class="rental-header">
            <h3>${vehicle.marca} ${vehicle.modelo}</h3>
            <span class="badge badge-${getStatusClass(rental.estado)}">${rental.estado}</span>
          </div>
          <p class="rental-id">ID de alquiler: ${rental.id}</p>
          <div class="rental-info">
            <div>
              <p class="label">Fecha de inicio</p>
              <p class="value">${formatDate(rental.fechaInicio)}</p>
            </div>
            <div>
              <p class="label">Fecha de fin</p>
              <p class="value">${formatDate(rental.fechaFin)}</p>
            </div>
            <div>
              <p class="label">Precio total</p>
              <p class="value">€${rental.precioTotal}</p>
            </div>
          </div>
          <div class="rental-actions">
            <button class="btn btn-outline-primary btn-sm">Ver detalles</button>
            ${rental.estado.toLowerCase() === 'pendiente' ?
            `<button class="btn btn-outline-danger btn-sm" onclick="cancelRental(${rental.id})">Cancelar</button>` : ''}
          </div>
        </div>
      </div>
    `;

        rentalsContainer.appendChild(rentalCard);
    });

    // Initialize tabs if they exist
    initTabs();
}

// Update dashboard statistics
function updateDashboardStats(rentals) {
    const totalRentalsElement = document.getElementById('total-rentals');
    const activeRentalsElement = document.getElementById('active-rentals');
    const pendingRentalsElement = document.getElementById('pending-rentals');

    if (totalRentalsElement) totalRentalsElement.textContent = rentals.length;

    if (activeRentalsElement) {
        const activeRentals = rentals.filter(r => r.estado.toLowerCase() === 'activo');
        activeRentalsElement.textContent = activeRentals.length;
    }

    if (pendingRentalsElement) {
        const pendingRentals = rentals.filter(r => r.estado.toLowerCase() === 'pendiente');
        pendingRentalsElement.textContent = pendingRentals.length;
    }
}

// Initialize tabs functionality
function initTabs() {
    const tabTriggers = document.querySelectorAll('.tab-trigger');
    const tabContents = document.querySelectorAll('.tab-content');

    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            // Remove active class from all triggers
            tabTriggers.forEach(t => t.classList.remove('active'));

            // Add active class to clicked trigger
            this.classList.add('active');

            // Hide all tab contents
            tabContents.forEach(content => content.classList.remove('active'));

            // Show the selected tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');

            // Filter rentals based on tab
            filterRentalsByTab(tabId);
        });
    });

    // Trigger click on the first tab to initialize
    if (tabTriggers.length > 0) {
        tabTriggers[0].click();
    }
}

// Filter rentals based on selected tab
function filterRentalsByTab(tabId) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;

    const allRentals = JSON.parse(localStorage.getItem('rentals') || '[]');
    const userRentals = allRentals.filter(rental => rental.usuarioId === user.id);

    const rentalsContainer = document.getElementById('rentals-container');
    if (!rentalsContainer) return;

    // Clear container
    rentalsContainer.innerHTML = '';

    // Filter rentals based on tab
    let filteredRentals = [];
    switch (tabId) {
        case 'tab-all':
            filteredRentals = userRentals;
            break;
        case 'tab-active':
            filteredRentals = userRentals.filter(r => r.estado.toLowerCase() === 'activo');
            break;
        case 'tab-pending':
            filteredRentals = userRentals.filter(r => r.estado.toLowerCase() === 'pendiente');
            break;
        case 'tab-completed':
            filteredRentals = userRentals.filter(r => r.estado.toLowerCase() === 'completado');
            break;
        default:
            filteredRentals = userRentals;
    }

    // Get vehicles data
    const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');

    if (filteredRentals.length === 0) {
        rentalsContainer.innerHTML = `
      <div class="empty-rentals">
        <div class="icon-container">
          <i class="fas fa-car"></i>
        </div>
        <h3>No tienes alquileres en esta categoría</h3>
        <p>Explora nuestra selección de vehículos y realiza un alquiler.</p>
        <a href="/vehicles.html" class="btn btn-primary">Ver vehículos disponibles</a>
      </div>
    `;
        return;
    }

    // Create rental cards for filtered rentals
    filteredRentals.forEach(rental => {
        const vehicle = vehicles.find(v => v.id === rental.vehiculoId) || {
            marca: 'Vehículo',
            modelo: `#${rental.vehiculoId}`,
            imagen: '/img/placeholder.jpg'
        };

        const rentalCard = document.createElement('div');
        rentalCard.className = 'rental-card';
        rentalCard.innerHTML = `
      <div class="rental-card-content">
        <div class="rental-image">
          <img src="${vehicle.imagen}" alt="${vehicle.marca} ${vehicle.modelo}">
        </div>
        <div class="rental-details">
          <div class="rental-header">
            <h3>${vehicle.marca} ${vehicle.modelo}</h3>
            <span class="badge badge-${getStatusClass(rental.estado)}">${rental.estado}</span>
          </div>
          <p class="rental-id">ID de alquiler: ${rental.id}</p>
          <div class="rental-info">
            <div>
              <p class="label">Fecha de inicio</p>
              <p class="value">${formatDate(rental.fechaInicio)}</p>
            </div>
            <div>
              <p class="label">Fecha de fin</p>
              <p class="value">${formatDate(rental.fechaFin)}</p>
            </div>
            <div>
              <p class="label">Precio total</p>
              <p class="value">€${rental.precioTotal}</p>
            </div>
          </div>
          <div class="rental-actions">
            <button class="btn btn-outline-primary btn-sm">Ver detalles</button>
            ${rental.estado.toLowerCase() === 'pendiente' ?
            `<button class="btn btn-outline-danger btn-sm" onclick="cancelRental(${rental.id})">Cancelar</button>` : ''}
          </div>
        </div>
      </div>
    `;

        rentalsContainer.appendChild(rentalCard);
    });
}

// Cancel a rental
function cancelRental(rentalId) {
    if (!confirm('¿Estás seguro de que deseas cancelar este alquiler?')) return;

    // Get rentals from localStorage
    const rentals = JSON.parse(localStorage.getItem('rentals') || '[]');

    // Find and update the rental
    const updatedRentals = rentals.map(rental => {
        if (rental.id === rentalId) {
            return { ...rental, estado: 'Cancelado' };
        }
        return rental;
    });

    // Save updated rentals
    localStorage.setItem('rentals', JSON.stringify(updatedRentals));

    // Show success message
    showToast('Alquiler cancelado', 'El alquiler ha sido cancelado correctamente');

    // Reload the page to reflect changes
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Get CSS class for status badge
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'activo': return 'success';
        case 'pendiente': return 'warning';
        case 'completado': return 'primary';
        case 'cancelado': return 'danger';
        default: return 'secondary';
    }
}

// Handle logout
function logout() {
    localStorage.removeItem('currentUser');
    showToast('Sesión cerrada', 'Has cerrado sesión correctamente');
    setTimeout(() => {
        window.location.href = '/index.html';
    }, 1000);
}

// Show toast notification
function showToast(title, message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
    <div class="toast-header">
      <strong>${title}</strong>
      <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
    </div>
    <div class="toast-body">${message}</div>
  `;

    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
        container.appendChild(toast);
    } else {
        toastContainer.appendChild(toast);
    }

    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const user = checkAuth();
    if (user) {
        loadUserProfile(user);
        loadUserRentals(user);

        // Add event listener to logout button
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', logout);
        }
    }
});