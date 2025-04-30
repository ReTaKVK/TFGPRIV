// admin.js - Handles admin dashboard functionality

// Check if user is logged in and is admin
function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = '/login.html';
        return null;
    }

    if (user.role !== 'admin') {
        window.location.href = '/dashboard.html';
        return null;
    }

    return user;
}

// Load admin dashboard data
function loadAdminDashboard(admin) {
    loadAdminProfile(admin);
    loadDashboardStats();
    initTabs();

    // Add event listener to logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    // Add event listeners to search inputs
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const tabId = this.closest('.tab-content').id;

            switch (tabId) {
                case 'tab-rentals':
                    filterRentals(searchTerm);
                    break;
                case 'tab-vehicles':
                    filterVehicles(searchTerm);
                    break;
                case 'tab-users':
                    filterUsers(searchTerm);
                    break;
            }
        });
    });
}

// Load admin profile information
function loadAdminProfile(admin) {
    const adminNameElement = document.getElementById('admin-name');
    if (adminNameElement) adminNameElement.textContent = admin.nombre;
}

// Load dashboard statistics
function loadDashboardStats() {
    const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const rentals = JSON.parse(localStorage.getItem('rentals') || '[]');

    const totalVehiclesElement = document.getElementById('total-vehicles');
    const totalUsersElement = document.getElementById('total-users');
    const totalRentalsElement = document.getElementById('total-rentals');

    if (totalVehiclesElement) totalVehiclesElement.textContent = vehicles.length;
    if (totalUsersElement) totalUsersElement.textContent = users.length;
    if (totalRentalsElement) totalRentalsElement.textContent = rentals.length;
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

            // Load tab content
            loadTabContent(tabId);
        });
    });

    // Trigger click on the first tab to initialize
    if (tabTriggers.length > 0) {
        tabTriggers[0].click();
    }
}

// Load tab content based on selected tab
function loadTabContent(tabId) {
    switch (tabId) {
        case 'tab-rentals':
            loadRentalsTab();
            break;
        case 'tab-vehicles':
            loadVehiclesTab();
            break;
        case 'tab-users':
            loadUsersTab();
            break;
    }
}

// Load rentals tab content
function loadRentalsTab() {
    const rentalsTableBody = document.querySelector('#tab-rentals .table-body');
    if (!rentalsTableBody) return;

    // Get data from localStorage
    const rentals = JSON.parse(localStorage.getItem('rentals') || '[]');
    const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Clear table body
    rentalsTableBody.innerHTML = '';

    // Create table rows
    rentals.forEach(rental => {
        const vehicle = vehicles.find(v => v.id === rental.vehiculoId) || { marca: 'Desconocido', modelo: 'Desconocido' };
        const user = users.find(u => u.id === rental.usuarioId) || { nombre: 'Desconocido', email: 'Desconocido' };

        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${rental.id}</td>
      <td>${vehicle.marca} ${vehicle.modelo}</td>
      <td>${user.nombre}</td>
      <td>
        <div class="rental-dates">
          <div>${formatDate(rental.fechaInicio)}</div>
          <div class="text-muted">hasta</div>
          <div>${formatDate(rental.fechaFin)}</div>
        </div>
      </td>
      <td>€${rental.precioTotal}</td>
      <td><span class="badge badge-${getStatusClass(rental.estado)}">${rental.estado}</span></td>
      <td>
        <select class="form-select status-select" data-rental-id="${rental.id}">
          <option value="Pendiente" ${rental.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="Activo" ${rental.estado === 'Activo' ? 'selected' : ''}>Activo</option>
          <option value="Completado" ${rental.estado === 'Completado' ? 'selected' : ''}>Completado</option>
          <option value="Cancelado" ${rental.estado === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
        </select>
      </td>
    `;

        rentalsTableBody.appendChild(row);
    });

    // Add event listeners to status selects
    const statusSelects = document.querySelectorAll('.status-select');
    statusSelects.forEach(select => {
        select.addEventListener('change', function() {
            const rentalId = parseInt(this.dataset.rentalId);
            const newStatus = this.value;
            updateRentalStatus(rentalId, newStatus);
        });
    });
}

// Load vehicles tab content
function loadVehiclesTab() {
    const vehiclesTableBody = document.querySelector('#tab-vehicles .table-body');
    if (!vehiclesTableBody) return;

    // Get vehicles from localStorage
    const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');

    // Clear table body
    vehiclesTableBody.innerHTML = '';

    // Create table rows
    vehicles.forEach(vehicle => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${vehicle.id}</td>
      <td>${vehicle.marca} ${vehicle.modelo}</td>
      <td>${vehicle.tipo}</td>
      <td>${vehicle.año}</td>
      <td>€${vehicle.precio}</td>
      <td>
        <span class="badge badge-${vehicle.disponible ? 'success' : 'danger'}">
          ${vehicle.disponible ? 'Disponible' : 'No disponible'}
        </span>
      </td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline-primary" onclick="editVehicle(${vehicle.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteVehicle(${vehicle.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;

        vehiclesTableBody.appendChild(row);
    });

    // Add event listener to add vehicle button
    const addVehicleButton = document.getElementById('add-vehicle-button');
    if (addVehicleButton) {
        addVehicleButton.addEventListener('click', showAddVehicleModal);
    }
}

// Load users tab content
function loadUsersTab() {
    const usersTableBody = document.querySelector('#tab-users .table-body');
    if (!usersTableBody) return;

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Clear table body
    usersTableBody.innerHTML = '';

    // Create table rows
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.nombre}</td>
      <td>${user.email}</td>
      <td>
        <span class="badge badge-${user.role === 'admin' ? 'purple' : 'primary'}">
          ${user.role}
        </span>
      </td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline-primary" onclick="editUser(${user.id})">
            <i class="fas fa-edit"></i>
          </button>
          ${user.id !== 1 ? `
            <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})">
              <i class="fas fa-trash"></i>
            </button>
          ` : ''}
        </div>
      </td>
    `;

        usersTableBody.appendChild(row);
    });
}

// Filter rentals based on search term
function filterRentals(searchTerm) {
    const rentalsTableBody = document.querySelector('#tab-rentals .table-body');
    if (!rentalsTableBody) return;

    const rows = rentalsTableBody.querySelectorAll('tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Filter vehicles based on search term
function filterVehicles(searchTerm) {
    const vehiclesTableBody = document.querySelector('#tab-vehicles .table-body');
    if (!vehiclesTableBody) return;

    const rows = vehiclesTableBody.querySelectorAll('tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Filter users based on search term
function filterUsers(searchTerm) {
    const usersTableBody = document.querySelector('#tab-users .table-body');
    if (!usersTableBody) return;

    const rows = usersTableBody.querySelectorAll('tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Update rental status
function updateRentalStatus(rentalId, newStatus) {
    // Get rentals from localStorage
    const rentals = JSON.parse(localStorage.getItem('rentals') || '[]');

    // Find and update the rental
    const updatedRentals = rentals.map(rental => {
        if (rental.id === rentalId) {
            return { ...rental, estado: newStatus };
        }
        return rental;
    });

    // Save updated rentals
    localStorage.setItem('rentals', JSON.stringify(updatedRentals));

    // Show success message
    showToast('Estado actualizado', `El alquiler ahora está ${newStatus.toLowerCase()}`);

    // Reload rentals tab
    loadRentalsTab();
}

// Show add vehicle modal
function showAddVehicleModal() {
    const modal = document.getElementById('vehicle-modal');
    const modalTitle = modal.querySelector('.modal-title');
    const form = modal.querySelector('form');

    // Reset form
    form.reset();
    form.dataset.mode = 'add';
    form.dataset.vehicleId = '';

    // Set modal title
    modalTitle.textContent = 'Añadir nuevo vehículo';

    // Show modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

// Edit vehicle
function editVehicle(vehicleId) {
    const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
    const vehicle = vehicles.find(v => v.id === vehicleId);

    if (!vehicle) return;

    const modal = document.getElementById('vehicle-modal');
    const modalTitle = modal.querySelector('.modal-title');
    const form = modal.querySelector('form');

    // Set form values
    form.elements['marca'].value = vehicle.marca;
    form.elements['modelo'].value = vehicle.modelo;
    form.elements['año'].value = vehicle.año;
    form.elements['tipo'].value = vehicle.tipo;
    form.elements['precio'].value = vehicle.precio;
    form.elements['disponible'].value = vehicle.disponible.toString();
    form.elements['descripcion'].value = vehicle.descripcion || '';
    form.elements['imagen'].value = vehicle.imagen;

    // Set form mode and vehicle ID
    form.dataset.mode = 'edit';
    form.dataset.vehicleId = vehicleId;

    // Set modal title
    modalTitle.textContent = 'Editar vehículo';

    // Show modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

// Save vehicle (add or edit)
function saveVehicle(form) {
    const mode = form.dataset.mode;
    const vehicleId = parseInt(form.dataset.vehicleId) || Date.now();

    const vehicle = {
        id: vehicleId,
        marca: form.elements['marca'].value,
        modelo: form.elements['modelo'].value,
        año: parseInt(form.elements['año'].value),
        tipo: form.elements['tipo'].value,
        precio: parseFloat(form.elements['precio'].value),
        disponible: form.elements['disponible'].value === 'true',
        imagen: form.elements['imagen'].value,
        descripcion: form.elements['descripcion'].value
    };

    // Get vehicles from localStorage
    const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');

    if (mode === 'add') {
        // Add new vehicle
        vehicles.push(vehicle);
        showToast('Vehículo añadido', 'El vehículo ha sido añadido correctamente');
    } else {
        // Update existing vehicle
        const index = vehicles.findIndex(v => v.id === vehicleId);
        if (index !== -1) {
            vehicles[index] = vehicle;
            showToast('Vehículo actualizado', 'El vehículo ha sido actualizado correctamente');
        }
    }

    // Save updated vehicles
    localStorage.setItem('vehicles', JSON.stringify(vehicles));

    // Close modal
    const modal = document.getElementById('vehicle-modal');
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();

    // Reload vehicles tab
    loadVehiclesTab();
}

// Delete vehicle
function deleteVehicle(vehicleId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este vehículo?')) return;

    // Get vehicles from localStorage
    const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');

    // Filter out the vehicle to delete
    const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== vehicleId);

    // Save updated vehicles
    localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));

    // Show success message
    showToast('Vehículo eliminado', 'El vehículo ha sido eliminado correctamente');

    // Reload vehicles tab
    loadVehiclesTab();
}

// Edit user
function editUser(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);

    if (!user) return;

    const modal = document.getElementById('user-modal');
    const modalTitle = modal.querySelector('.modal-title');
    const form = modal.querySelector('form');

    // Set form values
    form.elements['nombre'].value = user.nombre;
    form.elements['email'].value = user.email;
    form.elements['role'].value = user.role;
    form.elements['password'].value = '';

    // Set form mode and user ID
    form.dataset.mode = 'edit';
    form.dataset.userId = userId;

    // Set modal title
    modalTitle.textContent = 'Editar usuario';

    // Show modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

// Save user (edit)
function saveUser(form) {
    const userId = parseInt(form.dataset.userId);
    const newPassword = form.elements['password'].value;

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Find user index
    const index = users.findIndex(u => u.id === userId);

    if (index !== -1) {
        // Update user
        users[index] = {
            ...users[index],
            nombre: form.elements['nombre'].value,
            email: form.elements['email'].value,
            role: form.elements['role'].value
        };

        // Update password if provided
        if (newPassword) {
            users[index].password = newPassword;
        }

        // Save updated users
        localStorage.setItem('users', JSON.stringify(users));

        // Show success message
        showToast('Usuario actualizado', 'El usuario ha sido actualizado correctamente');
    }

    // Close modal
    const modal = document.getElementById('user-modal');
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();

    // Reload users tab
    loadUsersTab();
}

// Delete user
function deleteUser(userId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Filter out the user to delete
    const updatedUsers = users.filter(user => user.id !== userId);

    // Save updated users
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Show success message
    showToast('Usuario eliminado', 'El usuario ha sido eliminado correctamente');

    // Reload users tab
    loadUsersTab();
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

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const admin = checkAdminAuth();
    if (admin) {
        loadAdminDashboard(admin);

        // Add event listeners to form submissions
        const vehicleForm = document.querySelector('#vehicle-modal form');
        if (vehicleForm) {
            vehicleForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveVehicle(this);
            });
        }

        const userForm = document.querySelector('#user-modal form');
        if (userForm) {
            userForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveUser(this);
            });
        }
    }
});