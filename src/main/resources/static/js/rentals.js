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

// Format time to HH:MM
function formatTime(date) {
    const d = new Date(date);
    let hours = '' + d.getHours();
    let minutes = '' + d.getMinutes();

    if (hours.length < 2) hours = '0' + hours;
    if (minutes.length < 2) minutes = '0' + minutes;

    return [hours, minutes].join(':');
}

// Calculate days between two dates
function calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
}

// Calculate hours between two dates and times
function calculateHours(startDate, startTime, endDate, endTime) {
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const diffTime = Math.abs(end - start);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    return diffHours;
}

// Calculate total price based on rental type and duration
function calculateTotalPrice(rentalType, duration, pricePerDay) {
    let total = 0;

    if (rentalType === 'hour') {
        // Progressive pricing for hours
        if (duration === 1) {
            total = pricePerDay / 24; // Base price is per day, so divide by 24 for hourly rate
        } else {
            // Apply discount for additional hours
            const firstHour = pricePerDay / 24;
            const additionalHours = (duration - 1) * (pricePerDay / 24 * 0.8); // 20% discount for additional hours
            total = firstHour + additionalHours;
        }
    } else {
        // Progressive pricing for days
        if (duration === 1) {
            total = pricePerDay;
        } else {
            // Apply discount for additional days
            const firstDay = pricePerDay;
            let additionalDays = 0;

            for (let i = 2; i <= duration; i++) {
                // Each additional day gets a bigger discount
                const discount = 0.05 * (i - 1); // 5% more discount for each additional day
                const maxDiscount = 0.3; // Maximum 30% discount
                const actualDiscount = Math.min(discount, maxDiscount);

                additionalDays += pricePerDay * (1 - actualDiscount);
            }

            total = firstDay + additionalDays;
        }
    }

    return parseFloat(total.toFixed(2));
}

// Initialize date pickers, time pickers, and rental form
function initRentalForm() {
    const rentalForm = document.getElementById('rental-form');
    if (!rentalForm) return;

    const rentalTypeSelect = document.getElementById('rental-type');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const daysElement = document.getElementById('rental-days');
    const hoursElement = document.getElementById('rental-hours');
    const totalElement = document.getElementById('rental-total');
    const pricePerDayElement = document.getElementById('price-per-day');
    const submitButton = document.getElementById('submit-rental');
    const timeInputsContainer = document.getElementById('time-inputs-container');

    // Set min date to today for start date
    const today = new Date();
    startDateInput.min = formatDate(today);

    // Set default times
    const currentHour = today.getHours();
    const nextHour = (currentHour + 1) % 24;
    startTimeInput.value = `${currentHour < 10 ? '0' + currentHour : currentHour}:00`;
    endTimeInput.value = `${nextHour < 10 ? '0' + nextHour : nextHour}:00`;

    // Show/hide time inputs based on rental type
    rentalTypeSelect.addEventListener('change', function() {
        if (this.value === 'hour') {
            timeInputsContainer.style.display = 'flex';
            hoursElement.parentElement.style.display = 'block';
            daysElement.parentElement.style.display = 'none';
        } else {
            timeInputsContainer.style.display = 'none';
            hoursElement.parentElement.style.display = 'none';
            daysElement.parentElement.style.display = 'block';
        }
        updateCalculations();
    });

    // Update end date min value when start date changes
    startDateInput.addEventListener('change', function() {
        endDateInput.min = this.value;
        if (endDateInput.value && new Date(endDateInput.value) < new Date(this.value)) {
            endDateInput.value = this.value;
        }
        updateCalculations();
    });

    // Update calculations when inputs change
    endDateInput.addEventListener('change', updateCalculations);
    startTimeInput.addEventListener('change', updateCalculations);
    endTimeInput.addEventListener('change', updateCalculations);

    function updateCalculations() {
        const rentalType = rentalTypeSelect.value;

        if (rentalType === 'day' && startDateInput.value && endDateInput.value) {
            const days = calculateDays(startDateInput.value, endDateInput.value);
            const pricePerDay = parseFloat(pricePerDayElement.dataset.price || pricePerDayElement.textContent.replace('€', ''));
            const totalPrice = calculateTotalPrice('day', days, pricePerDay);

            daysElement.textContent = days + (days === 1 ? ' día' : ' días');
            totalElement.textContent = '€' + totalPrice.toFixed(2);

            submitButton.disabled = days < 1;
        } else if (rentalType === 'hour' && startDateInput.value && endDateInput.value && startTimeInput.value && endTimeInput.value) {
            const hours = calculateHours(startDateInput.value, startTimeInput.value, endDateInput.value, endTimeInput.value);
            const pricePerDay = parseFloat(pricePerDayElement.dataset.price || pricePerDayElement.textContent.replace('€', ''));
            const totalPrice = calculateTotalPrice('hour', hours, pricePerDay);

            hoursElement.textContent = hours + (hours === 1 ? ' hora' : ' horas');
            totalElement.textContent = '€' + totalPrice.toFixed(2);

            submitButton.disabled = hours < 1;
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
        const rentalType = rentalTypeSelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;

        let duration, totalPrice;
        const pricePerDay = parseFloat(pricePerDayElement.dataset.price || pricePerDayElement.textContent.replace('€', ''));

        if (rentalType === 'day') {
            duration = calculateDays(startDate, endDate);
            totalPrice = calculateTotalPrice('day', duration, pricePerDay);
        } else {
            duration = calculateHours(startDate, startTime, endDate, endTime);
            totalPrice = calculateTotalPrice('hour', duration, pricePerDay);
        }

        try {
            // In a real app, this would be an API call
            // For demo purposes, we'll simulate it
            const rental = {
                id: Date.now(),
                vehiculoId: parseInt(vehicleId),
                usuarioId: user.id,
                fechaInicio: startDate,
                horaInicio: rentalType === 'hour' ? startTime : '00:00',
                fechaFin: endDate,
                horaFin: rentalType === 'hour' ? endTime : '23:59',
                tipoAlquiler: rentalType,
                duracion: duration,
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