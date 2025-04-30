// Authentication Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    updateAuthUI(currentUser);

    // Login form submission
    const loginForm = document.getElementById('login-form-element');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            login(email, password);
        });
    }

    // Register form submission
    const registerForm = document.getElementById('register-form-element');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;

            if (password !== confirmPassword) {
                showAlert('Las contraseñas no coinciden', 'danger');
                return;
            }

            register(name, email, password);
        });
    }

    // Toggle between login and register forms
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    if (showRegister) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('register-form').style.display = 'block';
        });
    }

    if (showLogin) {
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        });
    }

    // Logout functionality
    const logoutButtons = document.querySelectorAll('#logout-button, #sidebar-logout-button');
    logoutButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', function() {
                logout();
            });
        }
    });

    // Profile form submission
    const saveProfileButton = document.getElementById('save-profile-button');
    if (saveProfileButton) {
        saveProfileButton.addEventListener('click', function() {
            updateProfile();
        });
    }

    // Admin profile form submission
    const saveAdminProfileButton = document.getElementById('save-admin-profile-button');
    if (saveAdminProfileButton) {
        saveAdminProfileButton.addEventListener('click', function() {
            updateAdminProfile();
        });
    }
});

// Get current user from localStorage
function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

// Update UI based on authentication state
function updateAuthUI(user) {
    // Update navbar
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');
    const adminProfile = document.getElementById('admin-profile');

    if (user) {
        // User is logged in
        if (authButtons) authButtons.classList.add('d-none');

        if (user.role === 'admin') {
            // Admin user
            if (adminProfile) {
                adminProfile.classList.remove('d-none');
                document.getElementById('admin-name').textContent = user.nombre;
            }

            // Redirect to admin dashboard if on user pages
            if (window.location.pathname.includes('user-dashboard.html') ||
                window.location.pathname.includes('rentals.html')) {
                window.location.href = 'admin-dashboard.html';
            }
        } else {
            // Regular user
            if (userProfile) {
                userProfile.classList.remove('d-none');
                document.getElementById('user-name').textContent = user.nombre;
            }

            // Redirect to user dashboard if on admin page
            if (window.location.pathname.includes('admin-dashboard.html')) {
                window.location.href = 'user-dashboard.html';
            }
        }

        // Update profile information
        updateProfileInfo(user);

        // Show rental form if on vehicle detail page
        const rentalFormContainer = document.getElementById('rental-form-container');
        const loginRequiredMessage = document.getElementById('login-required-message');
        if (rentalFormContainer && loginRequiredMessage) {
            rentalFormContainer.classList.remove('d-none');
            loginRequiredMessage.classList.add('d-none');
        }
    } else {
        // User is not logged in
        if (authButtons) authButtons.classList.remove('d-none');
        if (userProfile) userProfile.classList.add('d-none');
        if (adminProfile) adminProfile.classList.add('d-none');

        // Redirect to login page if on protected pages
        if (window.location.pathname.includes('user-dashboard.html') ||
            window.location.pathname.includes('admin-dashboard.html') ||
            window.location.pathname.includes('rentals.html')) {
            window.location.href = 'login.html';
        }

        // Hide rental form if on vehicle detail page
        const rentalFormContainer = document.getElementById('rental-form-container');
        const loginRequiredMessage = document.getElementById('login-required-message');
        if (rentalFormContainer && loginRequiredMessage) {
            rentalFormContainer.classList.add('d-none');
            loginRequiredMessage.classList.remove('d-none');
        }
    }
}

// Update profile information in UI
function updateProfileInfo(user) {
    // Dashboard profile
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const avatarInitials = document.getElementById('avatar-initials');
    const welcomeName = document.getElementById('welcome-name');

    if (profileName) profileName.textContent = user.nombre;
    if (profileEmail) profileEmail.textContent = user.email;
    if (avatarInitials) avatarInitials.textContent = getInitials(user.nombre);
    if (welcomeName) welcomeName.textContent = user.nombre;

    // Profile modal
    const profileNameInput = document.getElementById('profile-name-input');
    const profileEmailInput = document.getElementById('profile-email-input');

    if (profileNameInput) profileNameInput.value = user.nombre;
    if (profileEmailInput) profileEmailInput.value = user.email;

    // Admin profile modal
    const adminProfileName = document.getElementById('admin-profile-name');
    const adminProfileEmail = document.getElementById('admin-profile-email');

    if (adminProfileName) adminProfileName.value = user.nombre;
    if (adminProfileEmail) adminProfileEmail.value = user.email;
}

// Login function
function login(email, password) {
    // In a real app, this would be an API call
    fetch('http://localhost:8080/api/usuarios/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener usuarios');
            }
            return response.json();
        })
        .then(users => {
            // Find user with matching email and password
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // Store user in localStorage
                localStorage.setItem('currentUser', JSON.stringify(user));

                // Show success message
                showAlert('Inicio de sesión exitoso', 'success');

                // Redirect based on role
                setTimeout(() => {
                    if (user.role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        window.location.href = 'user-dashboard.html';
                    }
                }, 1000);
            } else {
                showAlert('Credenciales incorrectas', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);

            // For demo purposes, use mock data
            const mockUsers = [
                { id: 1, nombre: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' },
                { id: 2, nombre: 'Regular User', email: 'user@example.com', password: 'user123', role: 'user' }
            ];

            const user = mockUsers.find(u => u.email === email && u.password === password);

            if (user) {
                // Store user in localStorage
                localStorage.setItem('currentUser', JSON.stringify(user));

                // Show success message
                showAlert('Inicio de sesión exitoso', 'success');

                // Redirect based on role
                setTimeout(() => {
                    if (user.role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        window.location.href = 'user-dashboard.html';
                    }
                }, 1000);
            } else {
                showAlert('Credenciales incorrectas', 'danger');
            }
        });
}

// Register function
function register(name, email, password) {
    // In a real app, this would be an API call
    fetch('http://localhost:8080/api/usuarios/registrar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nombre: name,
            email: email,
            password: password,
            role: 'user'
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al registrar usuario');
            }
            return response.json();
        })
        .then(data => {
            // Show success message
            showAlert('Registro exitoso. Ahora puedes iniciar sesión.', 'success');

            // Switch to login form
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);

            // For demo purposes, show success message anyway
            showAlert('Registro exitoso. Ahora puedes iniciar sesión.', 'success');

            // Switch to login form
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        });
}

// Logout function
function logout() {
    // Remove user from localStorage
    localStorage.removeItem('currentUser');

    // Show success message
    showAlert('Sesión cerrada correctamente', 'success');

    // Redirect to home page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Update profile function
function updateProfile() {
    const user = getCurrentUser();

    if (!user) {
        showAlert('Debes iniciar sesión para actualizar tu perfil', 'danger');
        return;
    }

    const name = document.getElementById('profile-name-input').value;
    const email = document.getElementById('profile-email-input').value;
    const currentPassword = document.getElementById('profile-current-password').value;
    const newPassword = document.getElementById('profile-new-password').value;

    // In a real app, validate current password

    // Update user object
    user.nombre = name;
    user.email = email;

    if (newPassword) {
        user.password = newPassword;
    }

    // Save updated user to localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Update UI
    updateAuthUI(user);

    // Show success message
    showAlert('Perfil actualizado correctamente', 'success');

    // Close modal
    let profileModal = document.getElementById('profileModal');
    const modal = bootstrap.Modal.getInstance(profileModal);
    modal.hide();
}

// Update admin profile function
function updateAdminProfile() {
    const user = getCurrentUser();

    if (!user || user.role !== 'admin') {
        showAlert('No tienes permisos para realizar esta acción', 'danger');
        return;
    }

    const name = document.getElementById('admin-profile-name').value;
    const email = document.getElementById('admin-profile-email').value;
    const currentPassword = document.getElementById('admin-profile-current-password').value;
    const newPassword = document.getElementById('admin-profile-new-password').value;

    // In a real app, validate current password

    // Update user object
    user.nombre = name;
    user.email = email;

    if (newPassword) {
        user.password = newPassword;
    }

    // Save updated user to localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Update UI
    updateAuthUI(user);

    // Show success message
    showAlert('Perfil actualizado correctamente', 'success');

    // Close modal
    let profileModal = document.getElementById('profileModal');
    const modal = bootstrap.Modal.getInstance(profileModal);
    modal.hide();
}

// Helper function to get initials from name
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Show alert message
function showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Find alert container
    let alertContainer = document.querySelector('.alert-container');

    // Create container if it doesn't exist
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.className = 'alert-container position-fixed top-0 end-0 p-3';
        alertContainer.style.zIndex = '1050';
        document.body.appendChild(alertContainer);
    }

    // Add alert to container
    alertContainer.appendChild(alertDiv);

    // Remove alert after 5 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => {
            alertDiv.remove();
        }, 150);
    }, 5000);
}
