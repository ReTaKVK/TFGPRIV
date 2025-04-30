// rentals.js - Handles rental functionality

// Format date to YYYY-MM-DD
function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

// Calculate days between two dates
function calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
}

// Calculate total price
function calculateTotalPrice(days, pricePerDay) {
    return days * pricePerDay;
}

// Initialize date pickers and rental form
function initRentalForm() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const rentalForm = document.getElementById('rental-form');
    const daysElement = document.getElementById('rental-days');
    const totalElement = document.getElementById('rental-total');
    const pricePerDayElement = document.getElementById('price-per-day');
    const submitButton = document.getElementById('submit-rental');

    if (!rentalForm) return;

    // Set min date to today for start date
    const today = new Date();
    startDateInput.min = formatDate(today);

    // Update end date min value when start date changes
    startDateInput.addEventListener('change', function() {
        endDateInput.min = this.value;
        if (endDateInput.value && new Date(endDateInput.value) < new Date(this.value)) {
            endDateInput.value = this.value;
        }
        updateCalculations();
    });

    endDateInput.addEventListener('change', updateCalculations);

    function updateCalculations() {
        if (startDateInput.value && endDateInput.value) {
            const days = calculateDays(startDateInput.value, endDateInput.value);
            const pricePerDay = parseFloat(pricePerDayElement.dataset.price || pricePerDayElement.textContent.replace('€', ''));
            const totalPrice = calculateTotalPrice(days, pricePerDay);

            daysElement.textContent = days + (days === 1 ? ' día' : ' días');
            totalElement.textContent = '€' + totalPrice;

            submitButton.disabled = days < 1;
        }
    }

    // Handle form submission
    rentalForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) {
            window.location.href = '/login.html';
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Procesando...';

        const vehicleId = this.dataset.vehicleId;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const days = calculateDays(startDate, endDate);
        const pricePerDay = parseFloat(pricePerDayElement.dataset.price || pricePerDayElement.textContent.replace('€', ''));
        const totalPrice = calculateTotalPrice(days, pricePerDay);

        try {
            // In a real app, this would be an API call
            // For demo purposes, we'll simulate it
            const rental = {
                id: Date.now(),
                vehiculoId: parseInt(vehicleId),
                usuarioId: user.id,
                fechaInicio: startDate,
                fechaFin: endDate,
                estado: 'Pendiente',
                precioTotal: totalPrice
            };

            // Store rental in localStorage for demo purposes
            const rentals = JSON.parse(localStorage.getItem('rentals') || '[]');
            rentals.push(rental);
            localStorage.setItem('rentals', JSON.stringify(rentals));

            // Show success message
            showToast('Reserva realizada', 'Tu alquiler ha sido procesado correctamente');

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = user.role === 'admin' ? '/admin.html' : '/dashboard.html';
            }, 1500);
        } catch (error) {
            showToast('Error', 'No se pudo procesar el alquiler. Inténtalo de nuevo.', 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Reservar ahora';
        }
    });

    // Initialize with default values
    if (startDateInput.value && endDateInput.value) {
        updateCalculations();
    }
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initRentalForm();
});