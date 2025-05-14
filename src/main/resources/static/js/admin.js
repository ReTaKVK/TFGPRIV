// Variables globales

let vehiculos = [];
let usuarios = [];
let alquileres = [];
let currentTab = "dashboard";

// Función para verificar si el usuario es administrador
function checkAdmin() {
    const user = getUser();
    if (!user || user.rol !== "ADMIN") {
        window.location.href = "index.html";
        return false;
    }
    return true;
}

// Función para cargar los datos del panel de administración
async function loadAdminData() {
    try {
        // Verificar si el usuario es administrador
        if (!checkAdmin()) return;

        // Mostrar spinner de carga
        document.getElementById("admin-loading").classList.remove("d-none");
        document.getElementById("admin-content").classList.add("d-none");

        // Cargar datos según la pestaña activa
        if (currentTab === "dashboard") {
            await loadDashboardData();
        } else if (currentTab === "vehiculos") {
            await loadVehiculos();
        } else if (currentTab === "usuarios") {
            await loadUsuarios();
        } else if (currentTab === "alquileres") {
            await loadAlquileres();
        }

        // Ocultar spinner y mostrar contenido
        document.getElementById("admin-loading").classList.add("d-none");
        document.getElementById("admin-content").classList.remove("d-none");
    } catch (error) {
        console.error("Error:", error);
        showToast("Error", "Error al cargar los datos del panel de administración", "error");
    }
}

// Función para cargar los datos del dashboard
async function loadDashboardData() {
    try {
        // Cargar todos los datos necesarios
        await Promise.all([
            loadVehiculos(),
            loadUsuarios(),
            loadAlquileres()
        ]);

        // Actualizar contadores
        document.getElementById("total-vehiculos").textContent = vehiculos.length;
        document.getElementById("total-usuarios").textContent = usuarios.length;
        document.getElementById("total-alquileres").textContent = alquileres.length;

        // Calcular ingresos totales
        const ingresos = alquileres.reduce((total, alquiler) => {
            const fechaInicio = new Date(alquiler.fechaInicio);
            const fechaFin = new Date(alquiler.fechaFin);
            const dias = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
            const vehiculo = vehiculos.find(v => v.id === alquiler.vehiculoId);
            const precio = vehiculo ? vehiculo.precio : 0;
            return total + (dias * precio);
        }, 0);

        document.getElementById("total-ingresos").textContent = `${ingresos.toFixed(2)}€`;

        // Mostrar alquileres recientes
        const recentRentals = alquileres.sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio)).slice(0, 5);
        displayRecentRentals(recentRentals);

        // Mostrar vehículos más alquilados
        displayTopVehicles();
    } catch (error) {
        console.error("Error:", error);
        showToast("Error", "Error al cargar los datos del dashboard", "error");
    }
}

// Función para mostrar los alquileres recientes
function displayRecentRentals(recentRentals) {
    const recentRentalsTable = document.getElementById("recent-rentals-table");
    if (!recentRentalsTable) return;

    let html = "";

    recentRentals.forEach(rental => {
        const fechaInicio = new Date(rental.fechaInicio);
        const fechaFin = new Date(rental.fechaFin);
        const hoy = new Date();

        // Determinar el estado del alquiler
        let estado = "Pendiente";
        let estadoClass = "bg-warning";

        if (fechaInicio <= hoy && fechaFin >= hoy) {
            estado = "Activo";
            estadoClass = "bg-success";
        } else if (fechaFin < hoy) {
            estado = "Completado";
            estadoClass = "bg-info";
        }

        const vehiculo = vehiculos.find(v => v.id === rental.vehiculoId);
        const usuario = usuarios.find(u => u.id === rental.usuarioId);

        html += `
            <tr class="fade-in-up" style="animation-delay: ${recentRentals.indexOf(rental) * 0.1}s">
                <td>${rental.id}</td>
                <td>${usuario ? usuario.nombre : 'Desconocido'}</td>
                <td>${vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : 'Desconocido'}</td>
                <td>${formatDate(rental.fechaInicio)}</td>
                <td>${formatDate(rental.fechaFin)}</td>
                <td><span class="badge ${estadoClass}">${estado}</span></td>
            </tr>
        `;
    });

    recentRentalsTable.innerHTML = html;
}

// Función para mostrar los vehículos más alquilados
function displayTopVehicles() {
    const topVehiclesContainer = document.getElementById("top-vehicles");
    if (!topVehiclesContainer) return;

    // Contar alquileres por vehículo
    const vehicleRentals = {};
    alquileres.forEach(rental => {
        if (!vehicleRentals[rental.vehiculoId]) {
            vehicleRentals[rental.vehiculoId] = 0;
        }
        vehicleRentals[rental.vehiculoId]++;
    });

    // Convertir a array y ordenar
    const topVehicles = Object.entries(vehicleRentals)
        .map(([vehiculoId, count]) => ({
            vehiculo: vehiculos.find(v => v.id === parseInt(vehiculoId)),
            count
        }))
        .filter(item => item.vehiculo) // Filtrar vehículos que existen
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    let html = "";

    if (topVehicles.length === 0) {
        html = `<p class="text-muted">No hay datos disponibles</p>`;
    } else {
        topVehicles.forEach((item, index) => {
            const percentage = Math.round((item.count / alquileres.length) * 100);
            html += `
                <div class="mb-4 fade-in-right" style="animation-delay: ${index * 0.1}s">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <div class="d-flex align-items-center">
                            <img src="${item.vehiculo.imagen || 'img/car-placeholder.jpg'}" class="me-2 rounded" width="40" height="30" alt="${item.vehiculo.marca} ${item.vehiculo.modelo}">
                            <span>${item.vehiculo.marca} ${item.vehiculo.modelo}</span>
                        </div>
                        <span class="badge bg-primary">${item.count} alquileres</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                        <div class="progress-bar" role="progressbar" style="width: ${percentage}%;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
            `;
        });
    }

    topVehiclesContainer.innerHTML = html;
}

// Función para cargar los vehículos
async function loadVehiculos() {
    try {
        const token = getToken();
        if (!token) {
            throw new Error("No se pudo obtener el token de autenticación");
        }

        const response = await fetch(`http://localhost:8080/api/vehiculos`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Error al cargar los vehículos");
        }

        vehiculos = await response.json();

        if (currentTab === "vehiculos") {
            displayVehiculos();
        }

        return vehiculos;
    } catch (error) {
        console.error("Error:", error);
        showToast("Error", error.message || "Error al cargar los vehículos", "error");
        return [];
    }
}

// Función para mostrar los vehículos
function displayVehiculos() {
    const vehiculosTableBody = document.getElementById("vehiculos-table-body");
    if (!vehiculosTableBody) return;

    let html = "";

    vehiculos.forEach((vehiculo, index) => {
        html += `
            <tr class="fade-in-up" style="animation-delay: ${index * 0.05}s">
                <td>${vehiculo.id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${vehiculo.imagen || "img/car-placeholder.jpg"}" class="me-2 cart-item-img" alt="Vehículo">
                        <div>
                            <strong>${vehiculo.marca} ${vehiculo.modelo}</strong>
                            <br>
                            <small class="text-muted">Matrícula: ${vehiculo.matricula}</small>
                        </div>
                    </div>
                </td>
                <td>${vehiculo.precio}€/día</td>
                <td><span class="badge ${vehiculo.disponible ? "bg-success" : "bg-danger"}">${vehiculo.disponible ? "Disponible" : "No disponible"}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editVehiculo(${vehiculo.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteVehiculo(${vehiculo.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    vehiculosTableBody.innerHTML = html;
}

// Función para cargar los usuarios
async function loadUsuarios() {
    try {
        const token = getToken();
        if (!token) {
            throw new Error("No se pudo obtener el token de autenticación");
        }

        const response = await fetch(`http://localhost:8080/api/usuarios`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Error al cargar los usuarios");
        }

        usuarios = await response.json();

        if (currentTab === "usuarios") {
            displayUsuarios();
        }

        return usuarios;
    } catch (error) {
        console.error("Error:", error);
        showToast("Error", error.message || "Error al cargar los usuarios", "error");
        return [];
    }
}

// Función para mostrar los usuarios
function displayUsuarios() {
    const usuariosTableBody = document.getElementById("usuarios-table-body");
    if (!usuariosTableBody) return;

    let html = "";

    usuarios.forEach((usuario, index) => {
        html += `
            <tr class="fade-in-up" style="animation-delay: ${index * 0.05}s">
                <td>${usuario.id}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.email}</td>
                <td><span class="badge ${usuario.rol === "ADMIN" ? "bg-danger" : "bg-primary"}">${usuario.rol}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editUsuario(${usuario.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUsuario(${usuario.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    usuariosTableBody.innerHTML = html;
}

// Función para cargar los alquileres
async function loadAlquileres() {
    try {
        const token = getToken();
        if (!token) {
            throw new Error("No se pudo obtener el token de autenticación");
        }

        const response = await fetch(`http://localhost:8080/api/alquileres`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Error al cargar los alquileres");
        }

        alquileres = await response.json();

        if (currentTab === "alquileres") {
            displayAlquileres();
        }

        return alquileres;
    } catch (error) {
        console.error("Error:", error);
        showToast("Error", error.message || "Error al cargar los alquileres", "error");
        return [];
    }
}

// Función para mostrar los alquileres
function displayAlquileres() {
    const alquileresTableBody = document.getElementById("alquileres-table-body");
    if (!alquileresTableBody) return;

    let html = "";

    alquileres.forEach((alquiler, index) => {
        const fechaInicio = new Date(alquiler.fechaInicio);
        const fechaFin = new Date(alquiler.fechaFin);
        const hoy = new Date();

        // Determinar el estado del alquiler
        let estado = "Pendiente";
        let estadoClass = "bg-warning";

        if (fechaInicio <= hoy && fechaFin >= hoy) {
            estado = "Activo";
            estadoClass = "bg-success";
        } else if (fechaFin < hoy) {
            estado = "Completado";
            estadoClass = "bg-info";
        }

        const vehiculo = vehiculos.find(v => v.id === alquiler.vehiculoId);
        const usuario = usuarios.find(u => u.id === alquiler.usuarioId);

        html += `
            <tr class="fade-in-up" style="animation-delay: ${index * 0.05}s">
                <td>${alquiler.id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${vehiculo?.imagen || "img/car-placeholder.jpg"}" class="me-2 cart-item-img" alt="Vehículo">
                        <div>
                            <strong>${vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : 'Desconocido'}</strong>
                            <br>
                            <small class="text-muted">Matrícula: ${vehiculo?.matricula || 'N/A'}</small>
                        </div>
                    </div>
                </td>
                <td>${usuario?.nombre || 'Desconocido'}</td>
                <td>${formatDate(alquiler.fechaInicio)}</td>
                <td>${formatDate(alquiler.fechaFin)}</td>
                <td><span class="badge ${estadoClass}">${estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editAlquiler(${alquiler.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteAlquiler(${alquiler.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    alquileresTableBody.innerHTML = html;
}

// Función para editar un vehículo
function editVehiculo(id) {
    try {
        const vehiculo = vehiculos.find((v) => v.id === id);
        if (!vehiculo) {
            throw new Error("Vehículo no encontrado");
        }

        // Rellenar el formulario con los datos del vehículo
        document.getElementById("vehiculo-id").value = vehiculo.id;
        document.getElementById("vehiculo-marca").value = vehiculo.marca;
        document.getElementById("vehiculo-modelo").value = vehiculo.modelo;
        document.getElementById("vehiculo-matricula").value = vehiculo.matricula;
        document.getElementById("vehiculo-precio").value = vehiculo.precio;
        document.getElementById("vehiculo-disponible").checked = vehiculo.disponible;
        document.getElementById("vehiculo-imagen").value = vehiculo.imagen || '';
        document.getElementById("vehiculo-latitud").value = vehiculo.latitud || '';
        document.getElementById("vehiculo-longitud").value = vehiculo.longitud || '';

        // Actualizar el título del modal
        document.getElementById("vehiculoModalLabel").textContent = "Editar vehículo";

        // Mostrar el modal
        const vehiculoModal = new bootstrap.Modal(document.getElementById("vehiculoModal"));
        vehiculoModal.show();
    } catch (error) {
        console.error("Error:", error);
        showToast("Error", error.message || "Error al editar el vehículo", "error");
    }
}

// Función para eliminar un vehículo
async function deleteVehiculo(id) {
    try {
        if (!confirm("¿Estás seguro de que deseas eliminar este vehículo?")) {
            return;
        }

        const token = getToken();
        if (!token) {
            throw new Error("No se pudo obtener el token de autenticación");
        }

        const response = await fetch(`http://localhost:8080/api/vehiculos/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Error al eliminar el vehículo");
        }

        await loadVehiculos();
        showToast("Éxito", "Vehículo eliminado con éxito", "success");
    } catch (error) {
        console.error("Error:", error);
        showToast("Error", error.message || "Error al eliminar el vehículo", "error");
    }
}

// Función para guardar un vehículo (crear o actualizar)
async function saveVehiculo(event) {
    event.preventDefault();

    try {
        const id = document.getElementById("vehiculo-id").value;
        const vehiculoData = {
            marca: document.getElementById("vehiculo-marca").value,
            modelo: document.getElementById("vehiculo-modelo").value,
            matricula: document.getElementById("vehiculo-matricula").value,
            precio: Number.parseFloat(document.getElementById("vehiculo-precio").value),
            disponible: document.getElementById("vehiculo-disponible").checked,
            imagen: document.getElementById("vehiculo-imagen").value,
            latitud: document.getElementById("vehiculo-latitud").value ? Number.parseFloat(document.getElementById("vehiculo-latitud").value) : null,
            longitud: document.getElementById("vehiculo-longitud").value ? Number.parseFloat(document.getElementById("vehiculo-longitud").value) : null,
        };

        const token = getToken();
        if (!token) {
            throw new Error("No se pudo obtener el token de autenticación");
        }

        let response;
        if (id) {
            // Actualizar vehículo existente
            response = await fetch(`${API_URL}/vehiculos/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(vehiculoData),
            });
        } else {
            // Crear nuevo vehículo
            response = await fetch(`http://localhost:8080/api/vehiculos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(vehiculoData),
            });
        }

        if (!response.ok) {
            throw new Error("Error al guardar el vehículo");
        }

        // Cerrar el modal
        const vehiculoModal = bootstrap.Modal.getInstance(document.getElementById("vehiculoModal"));
        vehiculoModal.hide();

        // Recargar los vehículos
        await loadVehiculos();

        showToast("Éxito", `Vehículo ${id ? "actualizado" : "creado"} con éxito`, "success");
    } catch (error) {
        console.error("Error:", error);
        showToast("Error", error.message || "Error al guardar el vehículo", "error");
    }
}

// Función para editar un usuario
function editUsuario(id) {
    try {
        const usuario = usuarios.find((u) => u.id === id);
        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }

        // Rellenar el formulario con los datos del usuario
        document.getElementById("usuario-id").value = usuario.id;
        document.getElementById("usuario-nombre").value = usuario.nombre;
        document.getElementById("usuario-email").value = usuario.email;
        document.getElementById("usuario-password").value = '';
        document.getElementById("usuario-rol").value = usuario.rol;

        // Actualizar el título del modal
        document.getElementById("usuarioModalLabel").textContent = "Editar usuario";

        // Mostrar el modal
        const usuarioModal = new bootstrap.Modal(document.getElementById("usuarioModal"));
        usuarioModal.show();
    } catch (error) {
        console.error("Error:", error);
        showToast("Error", error.message || "Error al editar el usuario", "error");
    }
}

// Función para eliminar un usuario
async function deleteUsuario(id) {
    try {
        if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
            return;
        }

        const token = getToken();
        if (!token) {
            throw new Error("No se pudo obtener el token de autenticación");
        }

        const response = await fetch(`http://localhost:8080/api/usuarios/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Error al eliminar el usuario");
        }

        await loadUsuarios();
        showToast("Éxito", "Usuario eliminado con éxito", "success");
    } catch (error) {
        console.error("Error:", error);
        showToast("Error", error.message || "Error al eliminar el usuario", "error");
    }
}

// Función para guardar un usuario (crear o actualizar)
async function saveUsuario(event) {
    event.preventDefault();

    try {
        const id = document.getElementById("usuario-id").value;
        const usuarioData = {
            nombre: document.getElementById("usuario-nombre").value,
            email: document.getElementById("usuario-email").value,
            rol: document.getElementById("usuario-rol").value,
        };

        // Agregar contraseña solo si se proporciona una nueva
        const password = document.getElementById("usuario-password").value;
        if (password) {
            usuarioData.password = password;
        }

        const token = getToken();
        if (!token) {
            throw new Error("No se pudo obtener el token de autenticación");
        }

        let response;
        if (id) {
            // Actualizar usuario existente
            response = await fetch(`http://localhost:8080/api/usuarios/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(usuarioData),
            });
        } else {
            // Crear nuevo usuario
            if (!password) {
                throw new Error("La contraseña es obligatoria para crear un nuevo usuario");
            }

            response = await fetch(`http://localhost:8080/api/usuarios`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(usuarioData),
            });
        }

        if (!response.ok) {
            throw new Error("Error al guardar el usuario");
        }

        // Cerrar el modal
        const usuarioModal = bootstrap.Modal.getInstance(document.getElementById("usuarioModal"));
        usuarioModal.hide();

        // Recargar los usuarios
        await loadUsuarios();

        showToast("Éxito", `Usuario ${id ? "actualizado" : "creado"} con éxito`, "success");
    } catch (error) {
        console.error("Error:", error);
        showToast("Error", error.message || "Error al guardar el usuario", "error");
    }
}

// Función para editar un alquiler
function editAlquiler(id) {
    try {
        const alquiler = alquileres.find((a) => a.id === id);
        if (!alquiler) {
            throw new Error("Alquiler no encontrado");
        }

        // Cargar opciones de usuarios y vehículos
        loadAlquilerOptions();

        // Rellenar el formulario con los datos del alquiler
        document.getElementById("alquiler-id").value = alquiler.id;
        document.getElementById("alquiler-usuario").value = alquiler.usuarioId;
        document.getElementById("alquiler-vehiculo").value = alquiler.vehiculoId;
        document.getElementById("alquiler-fecha-inicio").value = formatDateForInput(alquiler.fechaInicio);
        document.getElementById("alquiler-fecha-fin").value = formatDateForInput(alquiler.fechaFin);

        // Actualizar el título del modal
        document.getElementById("alquilerModalLabel").textContent = "Editar alquiler";

        // Mostrar el modal
        const alquilerModal = new bootstrap.Modal(document.getElementById("alquilerModal"));
        alquilerModal.show();
    } catch (error) {
        console.error("Error:", error);
        showToast("Error", error.message || "Error al editar el alquiler", "error");
    }
}

// Función para cargar las opciones de usuarios y vehículos en el formulario de alquiler
function loadAlquilerOptions() {
    const usuarioSelect = document.getElementById("alquiler-usuario");
    const vehiculoSelect = document.getElementById("alquiler-vehiculo");

    // Limpiar opciones actuales
    usuarioSelect.innerHTML = '<option value="">Seleccionar usuario</option>';
    vehiculoSelect.innerHTML = '<option value="">Seleccionar vehículo</option>';

    // Agregar opciones de usuarios
    usuarios.forEach(usuario => {
        const option = document.createElement("option");
        option.value = usuario.id;
        option.textContent = `${usuario.nombre} (${usuario.email})`;
        usuarioSelect.appendChild(option);
    });

    // Agregar opciones de vehículos
    vehiculos.forEach(vehiculo => {
        const option = document.createElement("option");
        option.value = vehiculo.id;
        option.textContent = `${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.matricula})`;
        vehiculoSelect.appendChild(option);
    });
}

// Función para eliminar un alquiler
async function deleteAlquiler(id) {
    try {
        if (!confirm("¿Estás seguro de que deseas eliminar este alquiler?")) {
            return;
        }

        const token = getToken();
        if (!token) {
            throw new Error("No se pudo obtener el token de autenticación");
        }

        const response = await fetch(`http://localhost:8080/api/alquileres/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Error al eliminar el alquiler");
        }

        await loadAlquileres();
        showToast("Éxito", "Alquiler eliminado con éxito", "success");
    } catch (error) {
        console.error("Error:", error);
        showToast("Error", error.message || "Error al eliminar el alquiler", "error");
    }
}

// Función para guardar un alquiler (crear o actualizar)
async function saveAlquiler(event) {
    event.preventDefault();

    try {
        const id = document.getElementById("alquiler-id").value;
        const alquilerData = {
            usuarioId: parseInt(document.getElementById("alquiler-usuario").value),
            vehiculoId: parseInt(document.getElementById("alquiler-vehiculo").value),
            fechaInicio: document.getElementById("alquiler-fecha-inicio").value,
            fechaFin: document.getElementById("alquiler-fecha-fin").value,
        };

        const token = getToken();
        if (!token) {
            throw new Error("No se pudo obtener el token de autenticación");
        }

        let response;
        if (id) {
            // Actualizar alquiler existente
            response = await fetch(`http://localhost:8080/api/alquileres/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(alquilerData),
            });
        } else {
            // Crear nuevo alquiler
            response = await fetch(`http://localhost:8080/api/alquileres`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(alquilerData),
            });
        }

        if (!response.ok) {
            throw new Error("Error al guardar el alquiler");
        }

        // Cerrar el modal
        const alquilerModal = bootstrap.Modal.getInstance(document.getElementById("alquilerModal"));
        alquilerModal.hide();

        // Recargar los alquileres
        await loadAlquileres();

        showToast("Éxito", `Alquiler ${id ? "actualizado" : "creado"} con éxito`, "success");
    } catch (error) {
        console.error("Error:", error);
        showToast("Error", error.message || "Error al guardar el alquiler", "error");
    }
}

// Función para guardar la configuración general
function saveConfig(event) {
    event.preventDefault();

    // Simulación de guardado de configuración
    showToast("Éxito", "Configuración guardada con éxito", "success");
}

// Función para guardar la configuración de alquileres
function saveAlquileresConfig(event) {
    event.preventDefault();

    // Simulación de guardado de configuración
    showToast("Éxito", "Configuración de alquileres guardada con éxito", "success");
}

// Función para formatear fechas
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
}

// Función para formatear fechas para inputs
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
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

// Eventos
document.addEventListener("DOMContentLoaded", () => {
    // Verificar si el usuario es administrador
    if (!checkAdmin()) return;

    // Cargar datos iniciales
    loadAdminData();

    // Eventos para las pestañas
    const tabLinks = document.querySelectorAll(".nav-link[data-tab]");
    tabLinks.forEach((link) => {
        link.addEventListener("click", function () {
            currentTab = this.dataset.tab;
            loadAdminData();
        });
    });

    // Evento para el botón de nuevo vehículo
    const newVehiculoBtn = document.getElementById("new-vehiculo-btn");
    if (newVehiculoBtn) {
        newVehiculoBtn.addEventListener("click", () => {
            // Limpiar el formulario
            document.getElementById("vehiculo-form").reset();
            document.getElementById("vehiculo-id").value = "";

            // Actualizar el título del modal
            document.getElementById("vehiculoModalLabel").textContent = "Nuevo vehículo";

            // Mostrar el modal
            const vehiculoModal = new bootstrap.Modal(document.getElementById("vehiculoModal"));
            vehiculoModal.show();
        });
    }

    // Evento para el formulario de vehículo
    const vehiculoForm = document.getElementById("vehiculo-form");
    if (vehiculoForm) {
        vehiculoForm.addEventListener("submit", saveVehiculo);
    }

    // Evento para el botón de nuevo usuario
    const newUsuarioBtn = document.getElementById("new-usuario-btn");
    if (newUsuarioBtn) {
        newUsuarioBtn.addEventListener("click", () => {
            // Limpiar el formulario
            document.getElementById("usuario-form").reset();
            document.getElementById("usuario-id").value = "";

            // Actualizar el título del modal
            document.getElementById("usuarioModalLabel").textContent = "Nuevo usuario";

            // Mostrar el modal
            const usuarioModal = new bootstrap.Modal(document.getElementById("usuarioModal"));
            usuarioModal.show();
        });
    }

    // Evento para el formulario de usuario
    const usuarioForm = document.getElementById("usuario-form");
    if (usuarioForm) {
        usuarioForm.addEventListener("submit", saveUsuario);
    }

    // Evento para el botón de nuevo alquiler
    const newAlquilerBtn = document.getElementById("new-alquiler-btn");
    if (newAlquilerBtn) {
        newAlquilerBtn.addEventListener("click", () => {
            // Limpiar el formulario
            document.getElementById("alquiler-form").reset();
            document.getElementById("alquiler-id").value = "";

            // Cargar opciones de usuarios y vehículos
            loadAlquilerOptions();

            // Actualizar el título del modal
            document.getElementById("alquilerModalLabel").textContent = "Nuevo alquiler";

            // Mostrar el modal
            const alquilerModal = new bootstrap.Modal(document.getElementById("alquilerModal"));
            alquilerModal.show();
        });
    }

    // Evento para el formulario de alquiler
    const alquilerForm = document.getElementById("alquiler-form");
    if (alquilerForm) {
        alquilerForm.addEventListener("submit", saveAlquiler);
    }

    // Evento para el formulario de configuración general
    const configForm = document.getElementById("config-form");
    if (configForm) {
        configForm.addEventListener("submit", saveConfig);
    }

    // Evento para el formulario de configuración de alquileres
    const configAlquileresForm = document.getElementById("config-alquileres-form");
    if (configAlquileresForm) {
        configAlquileresForm.addEventListener("submit", saveAlquileresConfig);
    }

    // Evento para el botón de cerrar sesión
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            logout();
            window.location.href = "index.html";
        });
    }

    // Configurar botones de navegación según el usuario
    setupNavButtons();

    // Inicializar tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Función para configurar los botones de navegación según el usuario
function setupNavButtons() {
    const navbarButtons = document.getElementById("navbarButtons");
    if (!navbarButtons) return;

    const user = getUser();
    if (!user) return;

    let html = "";

    // Botón de perfil
    html += `
        <a href="profile.html" class="btn btn-outline-light me-2">
            <i class="bi bi-person-circle me-1"></i>Mi perfil
        </a>
    `;

    // Botón de cerrar sesión
    html += `
        <button class="btn btn-outline-light" onclick="logout(); window.location.href='index.html';">
            <i class="bi bi-box-arrow-right me-1"></i>Cerrar sesión
        </button>
    `;

    navbarButtons.innerHTML = html;
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

// Función para obtener el token de autenticación
function getToken() {
    return localStorage.getItem("token");
}

// Función para obtener el usuario actual
function getUser() {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch (error) {
        console.error("Error al parsear el usuario:", error);
        return null;
    }
}