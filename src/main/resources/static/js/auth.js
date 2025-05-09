document.addEventListener('DOMContentLoaded', () => {
// Constantes para URLs de API (ajustar según la configuración del backend)
    const API_BASE_URL = "http://localhost:8080/api"; // Ajusta la URL base de tu backend
    const LOGIN_API_URL = `${API_BASE_URL}/auth/login`;
    const REGISTER_API_URL = `${API_BASE_URL}/usuarios/registrar`; // URL para el registro

// Constantes para almacenamiento local
    const TOKEN_KEY = "auth_token";
    const USER_KEY = "user_data";

// Clase principal de autenticación
    class AuthService {
        constructor() {
            this.token = localStorage.getItem(TOKEN_KEY);
            this.user = JSON.parse(localStorage.getItem(USER_KEY) || "null");

            // Inicializar la interfaz de usuario basada en el estado de autenticación
            this.updateUI();

            // Configurar listeners para formularios
            this.setupEventListeners();
        }

        // Configurar listeners de eventos
        setupEventListeners() {
            // Formulario de login
            const loginForm = document.getElementById("loginForm");
            if (loginForm) {
                loginForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    this.login();
                });
            }

            // Formulario de registro (si tienes uno)
            const registerForm = document.getElementById("registerForm");
            if (registerForm) {
                registerForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    this.register();
                });
            }

            // Botón de cerrar sesión (en todas las páginas)
            document.addEventListener("click", (e) => {
                if (e.target && e.target.id === "logoutBtn") {
                    e.preventDefault();
                    this.logout();
                }
            });
        }

        // Actualizar la interfaz de usuario basada en el estado de autenticación
        updateUI() {
            const isLoggedIn = this.isAuthenticated();
            const userNavItems = document.querySelectorAll(".user-nav-item");
            const adminNavItems = document.querySelectorAll(".admin-nav-item");
            const guestNavItems = document.querySelectorAll(".guest-nav-item");
            const userNameElement = document.getElementById("userName");

            // Actualizar elementos de navegación
            if (userNavItems.length > 0) {
                userNavItems.forEach((item) => {
                    item.style.display = isLoggedIn ? "block" : "none";
                });
            }

            if (adminNavItems.length > 0 && this.user) {
                adminNavItems.forEach((item) => {
                    item.style.display = isLoggedIn && this.user.rol === "ADMIN" ? "block" : "none"; // Ajusta según el nombre de tu rol en el backend
                });
            }

            if (guestNavItems.length > 0) {
                guestNavItems.forEach((item) => {
                    item.style.display = isLoggedIn ? "none" : "block";
                });
            }

            // Actualizar nombre de usuario si está disponible
            if (userNameElement && this.user) {
                userNameElement.textContent = this.user.nombre || this.user.email; // Ajusta según los campos de tu usuario
            }

            // Actualizar botones de login/logout en la barra de navegación
            this.updateNavButtons();
        }

        // Actualizar botones de navegación
        updateNavButtons() {
            const navbarRight = document.querySelector(".navbar .d-flex");
            if (!navbarRight) return;

            // Buscar el botón de login existente
            const loginButton = navbarRight.querySelector('a[href="login.html"]');

            if (this.isAuthenticated() && loginButton) {
                // Crear menú desplegable para usuario autenticado
                const userDropdown = document.createElement("div");
                userDropdown.className = "dropdown me-2";
                userDropdown.innerHTML = `
                <button class="btn btn-outline-primary dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-person-circle me-1"></i>${this.user.nombre || this.user.email}
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    ${
                    this.user.rol === "ADMIN" // Ajusta según el nombre de tu rol en el backend
                        ? '<li><a class="dropdown-item" href="admin-dashboard.html"><i class="bi bi-speedometer2 me-2"></i>Panel de Admin</a></li>'
                        : '<li><a class="dropdown-item" href="user-dashboard.html"><i class="bi bi-speedometer2 me-2"></i>Mi Dashboard</a></li>'
                }
                    <li><a class="dropdown-item" href="rentals.html"><i class="bi bi-list-check me-2"></i>Mis Alquileres</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" id="logoutBtn"><i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión</a></li>
                </ul>
            `;

                // Reemplazar el botón de login con el menú desplegable
                loginButton.parentNode.replaceChild(userDropdown, loginButton);

                // Inicializar el dropdown de Bootstrap
                const bootstrap = window.bootstrap;
                if (bootstrap && bootstrap.Dropdown) {
                    new bootstrap.Dropdown(document.getElementById("userDropdown"));
                }
            } else if (!this.isAuthenticated() && !loginButton) {
                // Si no está autenticado y no hay botón de login, recrearlo
                const cartButton = navbarRight.querySelector('a[href="cart.html"]');
                if (cartButton) {
                    const loginBtn = document.createElement("a");
                    loginBtn.href = "login.html";
                    loginBtn.className = "btn btn-outline-primary me-2";
                    loginBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-1"></i>Iniciar Sesión';

                    navbarRight.insertBefore(loginBtn, cartButton);
                }
            }
        }

        // Verificar si el usuario está autenticado
        isAuthenticated() {
            return !!this.token && !!this.user;
        }

        // Verificar si el usuario es administrador
        isAdmin() {
            return this.isAuthenticated() && this.user && this.user.rol === "ADMIN"; // Ajusta según el nombre de tu rol en el backend
        }

        // Iniciar sesión
        async login() {
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const rememberMe = document.getElementById("rememberMe").checked;
            const loginError = document.getElementById("loginError");

            try {
                // Ocultar mensajes de error previos
                if (loginError) {
                    loginError.classList.add("d-none");
                }

                const response = await fetch(LOGIN_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({email, password})
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al iniciar sesión');
                }

                const data = await response.json();
                this.token = data.token;
                this.user = {
                    email: data.nombre, // Ajusta según la estructura de tu respuesta
                    nombre: data.email, // Ajusta según la estructura de tu respuesta
                    rol: data.rol // Ajusta según la estructura de tu respuesta
                };

                // Guardar en localStorage/sessionStorage
                this.saveAuthData(rememberMe);

                // Actualizar UI
                this.updateUI();

                // Redirigir según el rol
                this.redirectToDashboard();

            } catch (error) {
                // Mostrar mensaje de error
                if (loginError) {
                    loginError.textContent = error.message || "Error al iniciar sesión. Inténtalo de nuevo.";
                    loginError.classList.remove("d-none");
                }
                console.error("Error de login:", error);
            }
        }

        // Registrar usuario (si tienes un formulario de registro)
        async register() {
            const nombre = document.getElementById("registerFullName").value; // Ajusta según tus campos de registro
            const email = document.getElementById("registerEmail").value;
            const password = document.getElementById("registerPassword").value; // Ajusta según tus campos de registro
            const registerError = document.getElementById("registerError"); // Ajusta el ID del elemento de error

            try {
                if (registerError) {
                    registerError.classList.add("d-none");
                }

                const response = await fetch(REGISTER_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({nombre, email, password}) // Ajusta según los campos que espera tu backend
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al registrar usuario');
                }

                const data = await response.json();
                this.token = data.token; // Suponiendo que el backend devuelve el token tras el registro
                this.user = {
                    email: data.nombre, // Ajusta según la estructura de tu respuesta
                    nombre: data.email, // Ajusta según la estructura de tu respuesta
                    rol: data.rol // Ajusta según la estructura de tu respuesta
                };

                // Guardar en localStorage
                this.saveAuthData(true); // Generalmente se guarda tras el registro

                // Actualizar UI
                this.updateUI();

                // Redirigir según el rol
                this.redirectToDashboard();

            } catch (error) {
                if (registerError) {
                    registerError.textContent = error.message || "Error al registrar usuario. Inténtalo de nuevo.";
                    registerError.classList.remove("d-none");
                }
                console.error("Error de registro:", error);
            }
        }

        // Guardar datos de autenticación en localStorage o sessionStorage
        saveAuthData(rememberMe) {
            if (rememberMe) {
                localStorage.setItem(TOKEN_KEY, this.token);
                localStorage.setItem(USER_KEY, JSON.stringify(this.user));
            } else {
                sessionStorage.setItem(TOKEN_KEY, this.token);
                sessionStorage.setItem(USER_KEY, JSON.stringify(this.user));
            }
        }

        // Redirigir al dashboard según el rol del usuario
        redirectToDashboard() {
            if (this.user.rol === "ADMIN") { // Ajusta según el nombre de tu rol en el backend
                window.location.href = "admin-dashboard.html";
            } else {
                window.location.href = "user-dashboard.html";
            }
        }

        // Cerrar sesión
        logout() {
            // Eliminar datos de autenticación
            this.token = null;
            this.user = null;

            // Limpiar almacenamiento
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            sessionStorage.removeItem(TOKEN_KEY);
            sessionStorage.removeItem(USER_KEY);

            // Actualizar UI
            this.updateUI();

            // Redirigir a la página de inicio
            window.location.href = "index.html";
        }

        // Verificar si el usuario está autenticado
        isAuthenticated() {
            return !!this.token && !!this.user;
        }

        // Verificar si el usuario es administrador
        isAdmin() {
            return this.isAuthenticated() && this.user && this.user.rol === "ADMIN"; // Ajusta según el nombre de tu rol en el backend
        }

        // Verificar acceso a páginas protegidas (adaptar según tus rutas)
        checkPageAccess() {
            const currentPage = window.location.pathname.split("/").pop();
            const authRequiredPages = ["user-dashboard.html", "rentals.html", "checkout.html"];
            const adminRequiredPages = ["admin-dashboard.html"];

            if (authRequiredPages.includes(currentPage) && !this.isAuthenticated()) {
                window.location.href = "login.html?redirect=" + currentPage;
                return false;
            }

            if (adminRequiredPages.includes(currentPage) && !this.isAdmin()) {
                window.location.href = "user-dashboard.html";
                return false;
            }

            if ((currentPage === "login.html" || currentPage === "register.html") && this.isAuthenticated()) {
                this.redirectToDashboard();
                return false;
            }

            return true;
        }

        // Obtener token para peticiones autenticadas
        getAuthToken() {
            return this.token;
        }

        // Obtener datos del usuario actual
        getCurrentUser() {
            return this.user;
        }
    }

// Inicializar el servicio de autenticación
    const authService = new AuthService();

// Verificar acceso a la página actual
    document.addEventListener("DOMContentLoaded", () => {
        authService.checkPageAccess();
    });

// Exportar el servicio de autenticación para uso en otros archivos
    window.authService = authService;
})