// Variables globales
let vehiculo = null;
let precioTotal = 0;
let diasAlquiler = 0;

// Función para obtener los parámetros de la URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get("id"),
    };
}

// Función para cargar los detalles del vehículo
async function loadVehicleDetails() {
    try {
        const { id } = getUrlParams();
        if (!id) {
            window.location.href = "vehiculos.html";
            return;
        }

        const response = await fetch(`http://localhost:8080/api/vehiculos/${id}`);

        if (!response.ok) {
            throw new Error("Error al cargar los detalles del vehículo");
        }

        vehiculo = await response.json();

        // Mostrar los detalles del vehículo
        displayVehicleDetails(vehiculo);

        // Inicializar el mapa
        initMap(vehiculo.latitud, vehiculo.longitud);

        // Inicializar el selector de fechas
        initDatePickers();
    } catch (error) {
        console.error("Error:", error);
        showToast("Error", "Error al cargar los detalles del vehículo", "error");
    }
}

// Función para mostrar los detalles del vehículo
function displayVehicleDetails(vehicle) {
    // Ocultar el spinner de carga
    document.getElementById("loading").classList.add("d-none");

    // Mostrar el contenido
    document.getElementById("vehiculo-detalle").classList.remove("d-none");

    // Actualizar los elementos con los datos del vehículo
    document.getElementById("vehiculo-titulo").textContent = `${vehicle.marca} ${vehicle.modelo}`;
    document.getElementById("breadcrumb-titulo").textContent = `${vehicle.marca} ${vehicle.modelo}`;
    document.getElementById("vehiculo-nombre").textContent = `${vehicle.marca} ${vehicle.modelo}`;
    document.getElementById("vehiculo-matricula").textContent = vehicle.matricula;
    document.getElementById("vehiculo-disponibilidad").textContent = vehicle.disponible ? "Disponible" : "No disponible";
    document.getElementById("vehiculo-precio").textContent = vehicle.precio;

    // Imagen del vehículo
    const vehiculoImagen = document.getElementById("vehiculo-imagen");
    vehiculoImagen.src = vehicle.imagen || "img/car-placeholder.jpg";
    vehiculoImagen.alt = `${vehicle.marca} ${vehicle.modelo}`;

    // Actualizar el título de la página
    document.title = `${vehicle.marca} ${vehicle.modelo} - RentCar`;

    // Deshabilitar el botón de reserva si el vehículo no está disponible
    const btnReservar = document.getElementById("btn-reservar");
    if (!vehicle.disponible) {
        btnReservar.disabled = true;
        btnReservar.textContent = "No disponible";
    }
}

// Función para inicializar el mapa
function initMap(lat, lng) {
    if (!lat || !lng) return;

    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    const map = new google.maps.Map(mapElement, {
        center: { lat, lng },
        zoom: 15,
    });

    new google.maps.Marker({
        position: { lat, lng },
        map,
        title: `${vehiculo.marca} ${vehiculo.modelo}`,
    });
}

// Función para inicializar los selectores de fecha
function initDatePickers() {
    const fechaInicio = document.getElementById("fechaInicio");
    const fechaFin = document.getElementById("fechaFin");

    if (!fechaInicio || !fechaFin) return;

    // Configurar el selector de fecha de inicio
    const fpInicio = flatpickr(fechaInicio, {
        locale: "es",
        dateFormat: "d/m/Y",
        minDate: "today",
        onChange: (selectedDates, dateStr) => {
            // Actualizar la fecha mínima del selector de fecha de fin
            fpFin.set("minDate", dateStr);

            // Calcular el precio total
            calculateTotalPrice();
        },
    });

    // Configurar el selector de fecha de fin
    const fpFin = flatpickr(fechaFin, {
        locale: "es",
        dateFormat: "d/m/Y",
        minDate: "today",
        onChange: () => {
            // Calcular el precio total
            calculateTotalPrice();
        },
    });
}

// Función para calcular el precio total
function calculateTotalPrice() {
    const fechaInicio = document.getElementById("fechaInicio").value;
    const fechaFin = document.getElementById("fechaFin").value;

    if (!fechaInicio || !fechaFin || !vehiculo) {
        precioTotal = 0;
        diasAlquiler = 0;
        document.getElementById("precio-total").textContent = "0€";
        return;
    }

    // Convertir las fechas a objetos Date
    const inicio = flatpickr.parseDate(fechaInicio, "d/m/Y");
    const fin = flatpickr.parseDate(fechaFin, "d/m/Y");

    // Calcular la diferencia en días
    const diffTime = Math.abs(fin - inicio);
    diasAlquiler = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calcular el precio total
    precioTotal = diasAlquiler * vehiculo.precio;

    // Actualizar el elemento con el precio total
    document.getElementById("precio-total").textContent = `${precioTotal}€`;
}

// Función para obtener el ID del usuario autenticado
function obtenerUsuarioId() {
    const user = localStorage.getItem('user');
    if (user) {
        try {
            const userData = JSON.parse(user);
            return userData.id;
        } catch (error) {
            console.error('Error al parsear datos del usuario:', error);
            return null;
        }
    }
    return null;
}
// Función para agregar el vehículo al carrito
async function addToCart() {
    const fechaInicio = document.getElementById("fechaInicio").value;
    const fechaFin = document.getElementById("fechaFin").value;

    if (!fechaInicio || !fechaFin) {
        showToast("Error", "Por favor, selecciona las fechas de inicio y fin", "error");
        return;
    }

    // Convertir las fechas a objetos Date
    const inicio = flatpickr.parseDate(fechaInicio, "d/m/Y");
    const fin = flatpickr.parseDate(fechaFin, "d/m/Y");

    // Verificar que la fecha de fin sea posterior a la de inicio
    if (fin <= inicio) {
        showToast("Error", "La fecha de fin debe ser posterior a la fecha de inicio", "error");
        return;
    }

    // Obtener el ID del usuario
    const usuarioId = obtenerUsuarioId();
    if (!usuarioId) {
        showToast("Error", "No se pudo obtener el ID del usuario", "error");
        return;
    }

    // Crear el objeto de carrito según la estructura esperada por el backend
    const carritoItem = {
        usuarioId: usuarioId,
        vehiculoId: vehiculo.id,
        dias: diasAlquiler,
        fechaInicio: inicio.toISOString(), // Enviar la fecha de inicio seleccionada
        fechaFin: fin.toISOString()        // Enviar la fecha de fin seleccionada
    };

    console.log("Enviando datos al carrito:", carritoItem);

    // Enviar al backend para agregar al carrito
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast("Error", "No se encontró el token de autenticación", "error");
            return;
        }

        const response = await fetch('http://localhost:8080/api/carrito/agregar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(carritoItem),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || "Error al agregar el vehículo al carrito");
        }

        // Mostrar notificación
        showToast("Éxito", "Vehículo agregado al carrito", "success");

        // Redirigir al carrito
        setTimeout(() => {
            window.location.href = "carrito.html";
        }, 1500);
    } catch (error) {
        console.error("Error al agregar al carrito:", error);
        showToast("Error", error.message, "error");
    }
}

// Función para mostrar notificaciones
function showToast(title, message, type = "success") {
    const toast = document.getElementById("toast");
    const toastTitle = document.getElementById("toastTitle");
    const toastMessage = document.getElementById("toastMessage");

    toastTitle.textContent = title;
    toastMessage.textContent = message;

    // Aplicar clase según el tipo
    toast.classList.remove("bg-success", "bg-danger", "bg-warning", "text-white");
    if (type === "success") {
        toast.classList.add("bg-success", "text-white");
    } else if (type === "error") {
        toast.classList.add("bg-danger", "text-white");
    } else if (type === "warning") {
        toast.classList.add("bg-warning");
    }

    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Función para verificar si el usuario está autenticado
function isAuthenticated() {
    return localStorage.getItem("token") !== null;
}

// Eventos
document.addEventListener("DOMContentLoaded", () => {
    loadVehicleDetails();

    // Evento para el formulario de reserva
    const reservaForm = document.getElementById("reservaForm");
    if (reservaForm) {
        reservaForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // Verificar si el usuario está autenticado
            if (!isAuthenticated()) {
                // Guardar la URL actual para redirigir después del login
                sessionStorage.setItem("redirectAfterLogin", window.location.href);

                // Mostrar el modal de login
                const loginModalElement = document.getElementById("loginModal");
                const loginModal = new bootstrap.Modal(loginModalElement);
                loginModal.show();

                // Mostrar mensaje
                showToast("Información", "Debes iniciar sesión para reservar un vehículo", "warning");
                return;
            }

            // Agregar al carrito
            addToCart();
        });
    }
});