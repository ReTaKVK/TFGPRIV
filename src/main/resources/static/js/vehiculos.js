// Reemplaza con la URL de tu API

// Variables globales
let allVehicles = [];
let filteredVehicles = [];

// Función para cargar todos los vehículos disponibles
async function loadVehicles() {
    try {
        const vehiculosContainer = document.getElementById("vehiculos-container");
        if (!vehiculosContainer) return;

        const response = await fetch(`http://localhost:8080/api/vehiculos/disponibles`);
        if (!response.ok) {
            throw new Error("Error al cargar los vehículos");
        }

        allVehicles = await response.json();
        filteredVehicles = [...allVehicles];

        loadBrands(); // Cargar marcas en el filtro
        displayVehicles(filteredVehicles); // Mostrar vehículos
    } catch (error) {
        console.error("Error:", error);
        const vehiculosContainer = document.getElementById("vehiculos-container");
        if (vehiculosContainer) {
            vehiculosContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p>Error al cargar los vehículos. Por favor, inténtalo de nuevo más tarde.</p>
                </div>
            `;
        }
    }
}

// Función para cargar las marcas únicas
function loadBrands() {
    const marcaFilter = document.getElementById("marcaFilter");
    if (!marcaFilter) return;

    const uniqueBrands = [...new Set(allVehicles.map(vehicle => vehicle.marca))];
    uniqueBrands.sort();

    uniqueBrands.forEach(brand => {
        const option = document.createElement("option");
        option.value = brand;
        option.textContent = brand;
        marcaFilter.appendChild(option);
    });
}

// Función para mostrar vehículos
function displayVehicles(vehicles) {
    const vehiculosContainer = document.getElementById("vehiculos-container");
    if (!vehiculosContainer) return;

    // Limpiar el contenido anterior, incluyendo el spinner
    vehiculosContainer.innerHTML = "";

    if (vehicles.length === 0) {
        vehiculosContainer.innerHTML = `
            <div class="col-12 text-center">
                <p>No se encontraron vehículos que coincidan con los filtros seleccionados.</p>
            </div>
        `;
        return;
    }

    vehicles.forEach(vehicle => {
        const card = document.createElement("div");
        card.className = "col-md-4 col-lg-3";
        card.innerHTML = `
            <div class="card h-100 shadow-sm vehicle-card">
                <img src="${vehicle.imagen || "img/car-placeholder.jpg"}" class="card-img-top vehicle-img" alt="${vehicle.marca} ${vehicle.modelo}">
                <div class="card-body">
                    <h5 class="card-title">${vehicle.marca} ${vehicle.modelo}</h5>
                    <p class="card-text">
                        <span class="badge bg-success">${vehicle.disponible ? "Disponible" : "No disponible"}</span>
                    </p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-primary fw-bold">${vehicle.precio}€/día</span>
                        <a href="detalle-vehiculo.html?id=${vehicle.id}" class="btn btn-outline-primary">Ver detalles</a>
                    </div>
                </div>
            </div>
        `;
        vehiculosContainer.appendChild(card);
    });

}

// Función para aplicar filtros
function applyFilters() {
    const marcaFilter = document.getElementById("marcaFilter").value;
    const precioFilter = document.getElementById("precioFilter").value;

    filteredVehicles = allVehicles.filter(vehicle => {
        if (marcaFilter && vehicle.marca !== marcaFilter) {
            return false;
        }
        if (vehicle.precio > precioFilter) {
            return false;
        }
        return true;
    });

    displayVehicles(filteredVehicles);
}

// Eventos DOM
document.addEventListener("DOMContentLoaded", () => {
    loadVehicles();

    const precioFilter = document.getElementById("precioFilter");
    const precioValue = document.getElementById("precioValue");

    if (precioFilter && precioValue) {
        precioFilter.addEventListener("input", function () {
            precioValue.textContent = `${this.value}€`;
        });
    }

    const applyFiltersBtn = document.getElementById("applyFilters");
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener("click", applyFilters);
    }
});

document.addEventListener('DOMContentLoaded', function() {
// Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

// Scroll reveal animation
    function reveal() {
        const reveals = document.querySelectorAll('.reveal');

        for (let i = 0; i < reveals.length; i++) {
            const windowHeight = window.innerHeight;
            const elementTop = reveals[i].getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add('active');
            }
        }
    }

    window.addEventListener('scroll', reveal);
    reveal(); // Para elementos visibles al cargar la página
});
