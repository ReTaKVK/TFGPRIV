// Vehicles JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Load vehicles
    loadVehicles();

    // Handle filter form submission
    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            loadVehicles();
        });
    }

    // Handle price range input
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');
    if (priceRange && priceValue) {
        priceRange.addEventListener('input', function() {
            priceValue.textContent = `${priceRange.value}€`;
        });
    }

    // Handle view toggle
    const gridView = document.getElementById('grid-view');
    const listView = document.getElementById('list-view');
    const vehiclesGrid = document.getElementById('vehicles-grid');
    const vehiclesList = document.getElementById('vehicles-list');

    if (gridView && listView && vehiclesGrid && vehiclesList) {
        gridView.addEventListener('click', function() {
            gridView.classList.add('active');
            listView.classList.remove('active');
            vehiclesGrid.classList.remove('d-none');
            vehiclesList.classList.add('d-none');
        });

        listView.addEventListener('click', function() {
            listView.classList.add('active');
            gridView.classList.remove('active');
            vehiclesList.classList.remove('d-none');
            vehiclesGrid.classList.add('d-none');
        });
    }

    // Handle sort by change
    const sortBy = document.getElementById('sort-by');
    if (sortBy) {
        sortBy.addEventListener('change', function() {
            loadVehicles();
        });
    }

    // Handle rental form submission
    const rentalForm = document.getElementById('rental-form');
    if (rentalForm) {
        rentalForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const vehicleId = document.getElementById('vehicle-id').value;
            const pickupDate = document.getElementById('pickup-date').value;
            const returnDate = document.getElementById('return-date').value;

            createRental(vehicleId, pickupDate, returnDate);
        });
    }
});

// Load vehicles
function loadVehicles() {
    const vehiclesGrid = document.getElementById('vehicles-grid');
    const vehiclesList = document.getElementById('vehicles-list');
    const vehiclesCount = document.getElementById('vehicles-count');

    if (!vehiclesGrid || !vehiclesList) return;

    // Show loading spinners
    vehiclesGrid.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>
    `;

    vehiclesList.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>
    `;

    // Get filter values
    const category = document.getElementById('category').value;
    const brand = document.getElementById('brand').value;
    const priceRange = document.getElementById('price-range').value;
    const sortBy = document.getElementById('sort-by').value;

    // In a real app, this would be an API call with query parameters
    fetch('http://localhost:8080/api/vehiculos/disponibles')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener vehículos');
            }
            return response.json();
        })
        .then(vehicles => {
            // Apply filters
            let filteredVehicles = vehicles;

            if (category) {
                filteredVehicles = filteredVehicles.filter(vehicle => vehicle.tipo.toLowerCase() === category.toLowerCase());
            }

            if (brand) {
                filteredVehicles = filteredVehicles.filter(vehicle => vehicle.marca.toLowerCase() === brand.toLowerCase());
            }

            filteredVehicles = filteredVehicles.filter(vehicle => vehicle.precio <= priceRange);

            // Apply sorting
            switch (sortBy) {
                case 'price-asc':
                    filteredVehicles.sort((a, b) => a.precio - b.precio);
                    break;
                case 'price-desc':
                    filteredVehicles.sort((a, b) => b.precio - a.precio);
                    break;
                case 'name-asc':
                    filteredVehicles.sort((a, b) => `${a.marca} ${a.modelo}`.localeCompare(`${b.marca} ${b.modelo}`));
                    break;
                case 'name-desc':
                    filteredVehicles.sort((a, b) => `${b.marca} ${b.modelo}`.localeCompare(`${a.marca} ${a.modelo}`));
                    break;
                default:
                    // Default sorting (recommended)
                    break;
            }

            // Update vehicles count
            if (vehiclesCount) {
                vehiclesCount.textContent = `Mostrando ${filteredVehicles.length} vehículos`;
            }

            // Clear containers
            vehiclesGrid.innerHTML = '';
            vehiclesList.innerHTML = '';

            // Render vehicles
            if (filteredVehicles.length > 0) {
                // Render grid view
                filteredVehicles.forEach(vehicle => {
                    const gridCard = createVehicleGridCard(vehicle);
                    vehiclesGrid.appendChild(gridCard);
                });

                // Render list view
                filteredVehicles.forEach(vehicle => {
                    const listItem = createVehicleListItem(vehicle);
                    vehiclesList.appendChild(listItem);
                });

                // Generate pagination
                generatePagination(filteredVehicles.length);
            } else {
                // No vehicles found
                vehiclesGrid.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-car-front display-1 text-muted mb-3"></i>
                        <h3>No se encontraron vehículos</h3>
                        <p class="text-muted">Intenta con otros filtros</p>
                        <button class="btn btn-outline-primary" onclick="resetFilters()">Limpiar filtros</button>
                    </div>
                `;

                vehiclesList.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-car-front display-1 text-muted mb-3"></i>
                        <h3>No se encontraron vehículos</h3>
                        <p class="text-muted">Intenta con otros filtros</p>
                        <button class="btn btn-outline-primary" onclick="resetFilters()">Limpiar filtros</button>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);

            // For demo purposes, use mock data
            const mockVehicles = [
                {
                    id: 1,
                    marca: 'Audi',
                    modelo: 'A5 Sportback',
                    año: 2023,
                    tipo: 'Sedán',
                    precio: 85,
                    disponible: true,
                    imagen: 'img/audi-a5.jpg',
                    descripcion: 'Elegante sedán deportivo con un potente motor y acabados de lujo.'
                },
                {
                    id: 2,
                    marca: 'BMW',
                    modelo: 'X5',
                    año: 2023,
                    tipo: 'SUV',
                    precio: 120,
                    disponible: true,
                    imagen: 'img/bmw-x5.jpg',
                    descripcion: 'SUV de lujo con amplio espacio interior y tecnología de vanguardia.'
                },
                {
                    id: 3,
                    marca: 'Mercedes-Benz',
                    modelo: 'Clase C',
                    año: 2022,
                    tipo: 'Sedán',
                    precio: 95,
                    disponible: true,
                    imagen: 'img/mercedes-c.jpg',
                    descripcion: 'Sedán de lujo con un diseño elegante y un interior sofisticado.'
                },
                {
                    id: 4,
                    marca: 'Porsche',
                    modelo: '911',
                    año: 2023,
                    tipo: 'Deportivo',
                    precio: 250,
                    disponible: true,
                    imagen: 'img/porsche-911.jpg',
                    descripcion: 'Icónico deportivo con un rendimiento excepcional y un diseño atemporal.'
                },
                {
                    id: 5,
                    marca: 'Tesla',
                    modelo: 'Model 3',
                    año: 2023,
                    tipo: 'Sedán',
                    precio: 110,
                    disponible: true,
                    imagen: 'img/tesla-model3.jpg',
                    descripcion: 'Sedán eléctrico con una autonomía impresionante y tecnología de vanguardia.'
                },
                {
                    id: 6,
                    marca: 'Volkswagen',
                    modelo: 'Golf GTI',
                    año: 2022,
                    tipo: 'Hatchback',
                    precio: 75,
                    disponible: true,
                    imagen: 'img/vw-golf.jpg',
                    descripcion: 'Hatchback deportivo con un equilibrio perfecto entre rendimiento y practicidad.'
                }
            ];

            // Apply filters
            let filteredVehicles = mockVehicles;

            if (category) {
                filteredVehicles = filteredVehicles.filter(vehicle => vehicle.tipo.toLowerCase() === category.toLowerCase());
            }

            if (brand) {
                filteredVehicles = filteredVehicles.filter(vehicle => vehicle.marca.toLowerCase() === brand.toLowerCase());
            }

            filteredVehicles = filteredVehicles.filter(vehicle => vehicle.precio <= priceRange);

            // Apply sorting
            switch (sortBy) {
                case 'price-asc':
                    filteredVehicles.sort((a, b) => a.precio - b.precio);
                    break;
                case 'price-desc':
                    filteredVehicles.sort((a, b) => b.precio - a.precio);
                    break;
                case 'name-asc':
                    filteredVehicles.sort((a, b) => `${a.marca} ${a.modelo}`.localeCompare(`${b.marca} ${b.modelo}`));
                    break;
                case 'name-desc':
                    filteredVehicles.sort((a, b) => `${b.marca} ${b.modelo}`.localeCompare(`${a.marca} ${a.modelo}`));
                    break;
            }

            // Update vehicles count
            if (vehiclesCount) {
                vehiclesCount.textContent = `Mostrando ${filteredVehicles.length} vehículos`;
            }

            // Clear containers
            vehiclesGrid.innerHTML = '';
            vehiclesList.innerHTML = '';

            // Render vehicles
            if (filteredVehicles.length > 0) {
                // Render grid view
                filteredVehicles.forEach(vehicle => {
                    const gridCard = createVehicleGridCard(vehicle);
                    vehiclesGrid.appendChild(gridCard);
                });

                // Render list view
                filteredVehicles.forEach(vehicle => {
                    const listItem = createVehicleListItem(vehicle);
                    vehiclesList.appendChild(listItem);
                });

                // Generate pagination
                generatePagination(filteredVehicles.length);
            } else {
                // No vehicles found
                vehiclesGrid.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-car-front display-1 text-muted mb-3"></i>
                        <h3>No se encontraron vehículos</h3>
                        <p class="text-muted">Intenta con otros filtros</p>
                        <button class="btn btn-outline-primary" onclick="resetFilters()">Limpiar filtros</button>
                    </div>
                `;

                vehiclesList.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-car-front display-1 text-muted mb-3"></i>
                        <h3>No se encontraron vehículos</h3>
                        <p class="text-muted">Intenta con otros filtros</p>
                        <button class="btn btn-outline-primary" onclick="resetFilters()">Limpiar filtros</button>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);

            // For demo purposes, use mock data
            const mockVehicles = [
                {
                    id: 1,
                    marca: 'Audi',
                    modelo: 'A5 Sportback',
                    año: 2023,
                    tipo: 'Sedán',
                    precio: 85,
                    disponible: true,
                    imagen: 'img/audi-a5.jpg',
                    descripcion: 'Elegante sedán deportivo con un potente motor y acabados de lujo.'
                },
                {
                    id: 2,
                    marca: 'BMW',
                    modelo: 'X5',
                    año: 2023,
                    tipo: 'SUV',
                    precio: 120,
                    disponible: true,
                    imagen: 'img/bmw-x5.jpg',
                    descripcion: 'SUV de lujo con amplio espacio interior y tecnología de vanguardia.'
                },
                {
                    id: 3,
                    marca: 'Mercedes-Benz',
                    modelo: 'Clase C',
                    año: 2022,
                    tipo: 'Sedán',
                    precio: 95,
                    disponible: true,
                    imagen: 'img/mercedes-c.jpg',
                    descripcion: 'Sedán de lujo con un diseño elegante y un interior sofisticado.'
                },
                {
                    id: 4,
                    marca: 'Porsche',
                    modelo: '911',
                    año: 2023,
                    tipo: 'Deportivo',
                    precio: 250,
                    disponible: true,
                    imagen: 'img/porsche-911.jpg',
                    descripcion: 'Icónico deportivo con un rendimiento excepcional y un diseño atemporal.'
                },
                {
                    id: 5,
                    marca: 'Tesla',
                    modelo: 'Model 3',
                    año: 2023,
                    tipo: 'Sedán',
                    precio: 110,
                    disponible: true,
                    imagen: 'img/tesla-model3.jpg',
                    descripcion: 'Sedán eléctrico con una autonomía impresionante y tecnología de vanguardia.'
                },
                {
                    id: 6,
                    marca: 'Volkswagen',
                    modelo: 'Golf GTI',
                    año: 2022,
                    tipo: 'Hatchback',
                    precio: 75,
                    disponible: true,
                    imagen: 'img/vw-golf.jpg',
                    descripcion: 'Hatchback deportivo con un equilibrio perfecto entre rendimiento y practicidad.'
                }
            ];

            // Apply filters
            let filteredVehicles = mockVehicles;

            if (category) {
                filteredVehicles = filteredVehicles.filter(vehicle => vehicle.tipo.toLowerCase() === category.toLowerCase());
            }

            if (brand) {
                filteredVehicles = filteredVehicles.filter(vehicle => vehicle.marca.toLowerCase() === brand.toLowerCase());
            }

            filteredVehicles = filteredVehicles.filter(vehicle => vehicle.precio <= priceRange);

            // Apply sorting
            switch (sortBy) {
                case 'price-asc':
                    filteredVehicles.sort((a, b) => a.precio - b.precio);
                    break;
                case 'price-desc':
                    filteredVehicles.sort((a, b) => b.precio - a.precio);
                    break;
                case 'name-asc':
                    filteredVehicles.sort((a, b) => `${a.marca} ${a.modelo}`.localeCompare(`${b.marca} ${b.modelo}`));
                    break;
                case 'name-desc':
                    filteredVehicles.sort((a, b) => `${b.marca} ${b.modelo}`.localeCompare(`${a.marca} ${a.modelo}`));
                    break;
            }

            // Update vehicles count
            if (vehiclesCount) {
                vehiclesCount.textContent = `Mostrando ${filteredVehicles.length} vehículos`;
            }

            // Clear containers
            vehiclesGrid.innerHTML = '';
            vehiclesList.innerHTML = '';

            // Render vehicles
            if (filteredVehicles.length > 0) {
                // Render grid view
                filteredVehicles.forEach(vehicle => {
                    const gridCard = createVehicleGridCard(vehicle);
                    vehiclesGrid.appendChild(gridCard);
                });

                // Render list view
                filteredVehicles.forEach(vehicle => {
                    const listItem = createVehicleListItem(vehicle);
                    vehiclesList.appendChild(listItem);
                });

                // Generate pagination
                generatePagination(filteredVehicles.length);
            } else {
                // No vehicles found
                vehiclesGrid.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-car-front display-1 text-muted mb-3"></i>
                        <h3>No se encontraron vehículos</h3>
                        <p class="text-muted">Intenta con otros filtros</p>
                        <button class="btn btn-outline-primary" onclick="resetFilters()">Limpiar filtros</button>
                    </div>
                `;

                vehiclesList.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-car-front display-1 text-muted mb-3"></i>
                        <h3>No se encontraron vehículos</h3>
                        <p class="text-muted">Intenta con otros filtros</p>
                        <button class="btn btn-outline-primary" onclick="resetFilters()">Limpiar filtros</button>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);

            // For demo purposes, use mock data
            const mockVehicles = [
                {
                    id: 1,
                    marca: 'Audi',
                    modelo: 'A5 Sportback',
                    año: 2023,
                    tipo: 'Sedán',
                    precio: 85,
                    disponible: true,
                    imagen: 'img/audi-a5.jpg',
                    descripcion: 'Elegante sedán deportivo con un potente motor y acabados de lujo.'
                },
                {
                    id: 2,
                    marca: 'BMW',
                    modelo: 'X5',
                    año: 2023,
                    tipo: 'SUV',
                    precio: 120,
                    disponible: true,
                    imagen: 'img/bmw-x5.jpg',
                    descripcion: 'SUV de lujo con amplio espacio interior y tecnología de vanguardia.'
                },
                {
                    id: 3,
                    marca: 'Mercedes-Benz',
                    modelo: 'Clase C',
                    año: 2022,
                    tipo: 'Sedán',
                    precio: 95,
                    disponible: true,
                    imagen: 'img/mercedes-c.jpg',
                    descripcion: 'Sedán de lujo con un diseño elegante y un interior sofisticado.'
                },
                {
                    id: 4,
                    marca: 'Porsche',
                    modelo: '911',
                    año: 2023,
                    tipo: 'Deportivo',
                    precio: 250,
                    disponible: true,
                    imagen: 'img/porsche-911.jpg',
                    descripcion: 'Icónico deportivo con un rendimiento excepcional y un diseño atemporal.'
                },
                {
                    id: 5,
                    marca: 'Tesla',
                    modelo: 'Model 3',
                    año: 2023,
                    tipo: 'Sedán',
                    precio: 110,
                    disponible: true,
                    imagen: 'img/tesla-model3.jpg',
                    descripcion: 'Sedán eléctrico con una autonomía impresionante y tecnología de vanguardia.'
                },
                {
                    id: 6,
                    marca: 'Volkswagen',
                    modelo: 'Golf GTI',
                    año: 2022,
                    tipo: 'Hatchback',
                    precio: 75,
                    disponible: true,
                    imagen: 'img/vw-golf.jpg',
                    descripcion: 'Hatchback deportivo con un equilibrio perfecto entre rendimiento y practicidad.'
                }
            ];

            // Apply filters
            let filteredVehicles = mockVehicles;

            if (category) {
                filteredVehicles = filteredVehicles.filter(vehicle => vehicle.tipo.toLowerCase() === category.toLowerCase());
            }

            if (brand) {
                filteredVehicles = filteredVehicles.filter(vehicle => vehicle.marca.toLowerCase() === brand.toLowerCase());
            }

            filteredVehicles = filteredVehicles.filter(vehicle => vehicle.precio <= priceRange);

            // Apply sorting
            switch (sortBy) {
                case 'price-asc':
                    filteredVehicles.sort((a, b) => a.precio - b.precio);
                    break;
                case 'price-desc':
                    filteredVehicles.sort((a, b) => b.precio - a.precio);
                    break;
                case 'name-asc':
                    filteredVehicles.sort((a, b) => `${a.marca} ${a.modelo}`.localeCompare(`${b.marca} ${b.modelo}`));
                    break;
                case 'name-desc':
                    filteredVehicles.sort((a, b) => `${b.marca} ${b.modelo}`.localeCompare(`${a.marca} ${a.modelo}`));
                    break;
            }

            // Update vehicles count
            if (vehiclesCount) {
                vehiclesCount.textContent = `Mostrando ${filteredVehicles.length} vehículos`;
            }

            // Clear containers
            vehiclesGrid.innerHTML = '';
            vehiclesList.innerHTML = '';

            // Render vehicles
            if (filteredVehicles.length > 0) {
                // Render grid view
                filteredVehicles.forEach(vehicle => {
                    const gridCard = createVehicleGridCard(vehicle);
                    vehiclesGrid.appendChild(gridCard);
                });

                // Render list view
                filteredVehicles.forEach(vehicle => {
                    const listItem = createVehicleListItem(vehicle);
                    vehiclesList.appendChild(listItem);
                });

                // Generate pagination
                generatePagination(filteredVehicles.length);
            } else {
                // No vehicles found
                vehiclesGrid.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-car-front display-1 text-muted mb-3"></i>
                        <h3>No se encontraron vehículos</h3>
                        <p class="text-muted">Intenta con otros filtros</p>
                        <button class="btn btn-outline-primary" onclick="resetFilters()">Limpiar filtros</button>
                    </div>
                `;

                vehiclesList.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-car-front display-1 text-muted mb-3"></i>
                        <h3>No se encontraron vehículos</h3>
                        <p class="text-muted">Intenta con otros filtros</p>
                        <button class="btn btn-outline-primary" onclick="resetFilters()">Limpiar filtros</button>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);

            // For demo purposes, use mock data
            const mockVehicles = [
                {
                    id: 1,
                    marca: 'Audi',
                    modelo: 'A5 Sportback',
                    año: 2023,
                    tipo: 'Sedán',
                    precio: 85,
                    disponible: true,
                    imagen: 'img/audi-a5.jpg',
                    descripcion: 'Elegante sedán deportivo con un potente motor y acabados de lujo.'
                },
                {
                    id: 2,
                    marca: 'BMW',
                    modelo: 'X5',
                    año: 2023,
                    tipo: 'SUV',
                    precio: 120,
                    disponible: true,
                    imagen: 'img/bmw-x5.jpg',
                    descripcion: 'SUV de lujo con amplio espacio interior y tecnología de vanguardia.'
                },
                {
                    id: 3,
                    marca: 'Mercedes-Benz',
                    modelo: 'Clase C',
                    año: 2022,
                    tipo: 'Sedán',
                    precio: 95,
                    disponible: true,
                    imagen: 'img/mercedes-c.jpg',
                    descripcion: 'Sedán de lujo con un diseño elegante y un interior sofisticado.'
                },
                {
                    id: 4,
                    marca: 'Porsche',
                    modelo: '911',
                    año: 2023,
                    tipo: 'Deportivo',
                    precio: 250,
                    disponible: true,
                    imagen: 'img/porsche-911.jpg',
                    descripcion: 'Icónico deportivo con un rendimiento excepcional y un diseño atemporal.'
                },
                {
                    id: 5,
                    marca: 'Tesla',
                    modelo: 'Model 3',
                    año: 2023,
                    tipo: 'Sedán',
                    precio: 110,
                    disponible: true,
                    imagen: 'img/tesla-model3.jpg',
                    descripcion: 'Sedán eléctrico con una autonomía impresionante y tecnología de vanguardia.'
                },
                {
                    id: 6,
                    marca: 'Volkswagen',
                    modelo: 'Golf GTI',
                    año: 2022,
                    tipo: 'Hatchback',
                    precio: 75,
                    disponible: true,
                    imagen: 'img/vw-golf.jpg',
                    descripcion: 'Hatchback deportivo con un equilibrio perfecto entre rendimiento y practicidad.'
                }
            ];

            // Apply filters
            let filteredVehicles = mockVehicles;

            if (category) {
                filteredVehicles = filteredVehicles.filter(vehicle => vehicle.tipo.toLowerCase() === category.toLowerCase());
            }

            if (brand) {
                filteredVehicles = filteredVehicles.filter(vehicle => vehicle.marca.toLowerCase() === brand.toLowerCase());
            }

            filteredVehicles = filteredVehicles.filter(vehicle => vehicle.precio <= priceRange);

            // Apply sorting
            switch (sortBy) {
                case 'price-asc':
                    filteredVehicles.sort((a, b) => a.precio - b.precio);
                    break;
                case 'price-desc':
                    filteredVehicles.sort((a, b) => b.precio - a.precio);
                    break;
                case 'name-asc':
                    filteredVehicles.sort((a, b) => `${a.marca} ${a.modelo}`.localeCompare(`${b.marca} ${b.modelo}`));
                    break;
                case 'name-desc':
                    filteredVehicles.sort((a, b) => `${b.marca} ${b.modelo}`.localeCompare(`${a.marca} ${a.modelo}`));
                    break;
            }

            // Update vehicles count
            if (vehiclesCount) {
                vehiclesCount.textContent = `Mostrando ${filteredVehicles.length} vehículos`;
            }

            // Clear containers
            vehiclesGrid.innerHTML = '';
            vehiclesList.innerHTML = '';

            // Render vehicles
            if (filteredVehicles.length > 0) {
                // Render grid view
                filteredVehicles.forEach(vehicle => {
                    const gridCard = createVehicleGridCard(vehicle);
                    vehiclesGrid.appendChild(gridCard);
                });

                // Render list view
                filteredVehicles.forEach(vehicle => {
                    const listItem = createVehicleListItem(vehicle);
                    vehiclesList.appendChild(listItem);
                });

                // Generate pagination
                generatePagination(filteredVehicles.length);
            } else {
                // No vehicles found
                vehiclesGrid.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-car-front display-1 text-muted mb-3"></i>
                        <h3>No se encontraron vehículos</h3>
                        <p class="text-muted">Intenta con otros filtros</p>
                        <button class="btn btn-outline-primary" onclick="resetFilters()">Limpiar filtros</button>
                    </div>
                `;

                vehiclesList.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-car-front display-1 text-muted mb-3"></i>
                        <h3>No se encontraron vehículos</h3>
                        <p class="text-muted">Intenta con otros filtros</p>
                        <button class="btn btn-outline-primary" onclick="resetFilters()">Limpiar filtros</button>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);

            // For demo purposes, use mock data
            const mockVehicles = [
                {
                    id: 1,
                    marca: 'Audi',
                    modelo: 'A5 Sportback',
                    año: 2023,
                    tipo: 'Sedán',
                    precio: 85,
                    disponible: true,
                    imagen: 'img/audi-a5.jpg',
                    descripcion: 'Elegante sedán deportivo con un potente motor y acabados de lujo.'
                },
                {
                    id: 2,
                    marca: 'BMW',
                    modelo: 'X5',
                    año: 2023,
                    tipo: 'SUV',
                    precio: 120,
                    disponible: true,
                    imagen: 'img/bmw-x5.jpg',
                    descripcion: 'SUV de lujo con amplio espacio interior y tecnología de vanguardia.'
                },
                {
                    id: 3,
                    marca: 'Mercedes-Benz',
                    modelo: 'Clase C',
                    año: 2022,
                    tipo: 'Sedán',
                    precio: 95,
                    disponible: true,
                    imagen: 'img/mercedes-c.jpg',
                    descripcion: 'Sedán de lujo con un diseño elegante y un interior sofisticado.'
                },
                {
                    id: 4,
                    marca: 'Porsche',
                    modelo: '911',
                    año: 2023,
                    tipo: 'Deportivo',
                    precio: 250,
                    disponible: true,
                    imagen: 'img/porsche-911.jpg',
                    descripcion: 'Icónico deportivo con un rendimiento excepcional y un diseño atemporal.'
                },
                {
                    id: 5,
                    marca: 'Tesla',
                    modelo: 'Model 3',
                    año: 2023,
                    tipo: 'Sedán',
                    precio: 110,
                    disponible: true,
                    imagen: 'img/tesla-model3.jpg',
                    descripcion: 'Sedán eléctrico con una autonomía impresionante y tecnología de vanguardia.'
                },
                {
                    id: 6,
                    marca: 'Volkswagen',
                    modelo: 'Golf GTI',
                    año: 2022,
                    tipo: 'Hatchback',
                    precio: 75,
                    disponible: true,
                    imagen: 'img/vw-golf.jpg',
                    descripcion: 'Hatchback deportivo con un equilibrio perfecto entre rendimiento y practicidad.'
                }
            ];

            // Apply filters
            let filteredVehicles = mockVehicles;

            if (category) {
                filteredVehicles = filteredVehicles.filter(vehicle => vehicle.tipo.toLowerCase() === category.toLowerCase());
            }

            if (brand) {
                filteredVehicles = filteredVehicles.filter(vehicle => vehicle.marca.toLowerCase() === brand.toLowerCase());
            }

            filteredVehicles = filteredVehicles.filter(vehicle => vehicle.precio <= priceRange);

            // Apply sorting
            switch (sortBy) {
                case 'price-asc':
                    filteredVehicles.sort((a, b) => a.precio - b.precio);
                    break;
                case 'price-desc':
                    filteredVehicles.sort((a, b) => b.precio - a.precio);
                    break;
                case 'name-asc':
                    filteredVehicles.sort((a, b) => `${a.marca} ${a.modelo}`.localeCompare(`${b.marca} ${b.modelo}`));
                    break;
                case 'name-desc':
                    filteredVehicles.sort((a, b) => `${b.marca} ${b.modelo}`.localeCompare(`${a.marca} ${a.modelo}`));
                    break;
            }

            // Update vehicles count
            if (vehiclesCount) {
                vehiclesCount.textContent = `Mostrando ${filteredVehicles.length} vehículos`;
            }

            // Clear containers
            vehiclesGrid.innerHTML = '';
            vehiclesList.innerHTML = '';

            // Render vehicles
            if (filteredVehicles.length > 0) {
                // Render grid view
                filteredVehicles.forEach(vehicle => {
                    const gridCard = createVehicleGridCard(vehicle);
                    vehiclesGrid.appendChild(gridCard);
                });

                // Render list view
                filteredVehicles.forEach(vehicle => {
                    const listItem = createVehicleListItem(vehicle);
                    vehiclesList.appendChild(listItem);
                });

                // Generate pagination
                generatePagination(filteredVehicles.length);
            } else {
                // No vehicles found
                vehiclesGrid.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-car-front display-1 text-muted mb-3"></i>
                        <h3>No se encontraron vehículos</h3>
                        <p class="text-muted">Intenta con otros filtros</p>
                        <button class="btn btn-outline-primary" onclick="resetFilters()">Limpiar filtros</button>
                    </div>
                `;

                vehiclesList.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-car-front display-1 text-muted mb-3"></i>
                        <h3>No se encontraron vehículos</h3>
                        <p class="text-muted">Intenta con otros filtros</p>
                        <button class="btn btn-outline-primary" onclick="resetFilters()">Limpiar filtros</button>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);

            // Display an error message in the vehicle lists
            vehiclesGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-exclamation-triangle display-1 text-danger mb-3"></i>
                    <h3>Error al cargar los vehículos</h3>
                    <p class="text-muted">Por favor, intenta nuevamente más tarde.</p>
                </div>
            `;
            vehiclesList.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-exclamation-triangle display-1 text-danger mb-3"></i>
                    <h3>Error al cargar los vehículos</h3>
                    <p class="text-muted">Por favor, intenta nuevamente más tarde.</p>
                </div>
            `;
        });
}

// Create vehicle grid card
function createVehicleGridCard(vehicle) {
    const card = document.createElement('div');
    card.classList.add('col-md-4', 'mb-4');

    card.innerHTML = `
        <div class="card h-100">
            <img src="${vehicle.imagen}" class="card-img-top" alt="${vehicle.marca} ${vehicle.modelo}">
            <div class="card-body">
                <h5 class="card-title">${vehicle.marca} ${vehicle.modelo}</h5>
                <p class="card-text">${vehicle.descripcion}</p>
                <p class="card-text"><small class="text-muted">${vehicle.tipo} - ${vehicle.año}</small></p>
                <p class="card-text fw-bold">${vehicle.precio}€ / día</p>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#rentalModal" onclick="setVehicleId(${vehicle.id})">Alquilar</button>
            </div>
        </div>
    `;

    return card;
}

// Create vehicle list item
function createVehicleListItem(vehicle) {
    const listItem = document.createElement('div');
    listItem.classList.add('list-group-item');

    listItem.innerHTML = `
        <div class="row align-items-center">
            <div class="col-md-3">
                <img src="${vehicle.imagen}" alt="${vehicle.marca} ${vehicle.modelo}" class="img-fluid">
            </div>
            <div class="col-md-6">
                <h4>${vehicle.marca} ${vehicle.modelo}</h4>
                <p>${vehicle.descripcion}</p>
                <p><small class="text-muted">${vehicle.tipo} - ${vehicle.año}</small></p>
            </div>
            <div class="col-md-3 text-end">
                <p class="fw-bold">${vehicle.precio}€ / día</p>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#rentalModal" onclick="setVehicleId(${vehicle.id})">Alquilar</button>
            </div>
        </div>
    `;

    return listItem;
}

// Generate pagination
function generatePagination(totalVehicles) {
    const vehiclesPerPage = 9;
    const totalPages = Math.ceil(totalVehicles / vehiclesPerPage);
    const paginationContainer = document.getElementById('pagination');

    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    if (totalPages > 1) {
        let currentPage = 1; // You'll need to manage the current page state

        const paginationList = document.createElement('ul');
        paginationList.classList.add('pagination', 'justify-content-center');

        // Previous button
        const previousButton = document.createElement('li');
        previousButton.classList.add('page-item');
        previousButton.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
        paginationList.appendChild(previousButton);

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageItem = document.createElement('li');
            pageItem.classList.add('page-item');
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            paginationList.appendChild(pageItem);

            // Add active class to the first page initially
            if (i === 1) {
                pageItem.classList.add('active');
            }

            // Handle page click
            pageItem.addEventListener('click', function(e) {
                e.preventDefault();

                // Remove active class from the current active page
                document.querySelector('#pagination .page-item.active').classList.remove('active');

                // Add active class to the clicked page
                pageItem.classList.add('active');

                currentPage = i;

                // Load vehicles for the selected page (you'll need to implement this)
                // loadVehicles(currentPage);
            });
        }

        // Next button
        const nextButton = document.createElement('li');
        nextButton.classList.add('page-item');
        nextButton.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
        paginationList.appendChild(nextButton);

        paginationContainer.appendChild(paginationList);
    }
}

// Set vehicle ID for rental
function setVehicleId(vehicleId) {
    document.getElementById('vehicle-id').value = vehicleId;
}

// Create rental
function createRental(vehicleId, pickupDate, returnDate) {
    // In a real app, this would be an API call to create a rental
    alert(`Alquiler creado para el vehículo ${vehicleId} desde ${pickupDate} hasta ${returnDate}`);

    // Close the modal
    const rentalModal = document.getElementById('rentalModal');
    const modal = bootstrap.Modal.getInstance(rentalModal);
    modal.hide();
}