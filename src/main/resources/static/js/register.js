document.addEventListener("DOMContentLoaded", () => {
    // Referencias a elementos del DOM
    const registerForm = document.getElementById("registerForm")
    const registerError = document.getElementById("registerError")
    const registerSuccess = document.getElementById("registerSuccess")

    // URL del API para registro (ajustar según la configuración del backend)
    const REGISTER_API_URL = "https://api.example.com/users/register"

    // Función para validar el formulario
    function validateForm() {
        const password = document.getElementById("password").value
        const confirmPassword = document.getElementById("confirmPassword").value
        const email = document.getElementById("email").value

        // Validar longitud de contraseña
        if (password.length < 8) {
            showError("La contraseña debe tener al menos 8 caracteres.")
            return false
        }

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            showError("Las contraseñas no coinciden.")
            return false
        }

        // Validar formato de email con regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            showError("Por favor, introduce un correo electrónico válido.")
            return false
        }

        return true
    }

    // Función para mostrar errores
    function showError(message) {
        registerError.textContent = message
        registerError.classList.remove("d-none")

        // Ocultar el mensaje después de 5 segundos
        setTimeout(() => {
            registerError.classList.add("d-none")
        }, 5000)
    }

    // Función para mostrar mensaje de éxito
    function showSuccess() {
        registerSuccess.classList.remove("d-none")
        registerForm.reset()

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
            window.location.href = "login.html"
        }, 2000)
    }

    // Manejador del evento submit del formulario
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault()

        // Ocultar mensajes previos
        registerError.classList.add("d-none")
        registerSuccess.classList.add("d-none")

        // Validar formulario
        if (!validateForm()) {
            return
        }

        // Recopilar datos del formulario
        const userData = {
            fullName: document.getElementById("fullName").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            phone: document.getElementById("phone").value,
            address: document.getElementById("address").value,
            role: "user", // Por defecto, todos los registros nuevos son usuarios normales
        }

        try {
            // Simular la llamada a la API (reemplazar con la llamada real)
            // En un entorno real, descomentar el código de fetch y ajustar según la API


                  const response = await fetch("https://api.example.com/users/register", {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(userData)
                  });

                  if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.message || 'Error al registrar usuario');
                  }

                  const data = await response.json();


            // Simulación de registro exitoso (eliminar en producción)
            console.log("Datos de registro:", userData)

            // Guardar en localStorage para simular la base de datos (solo para demo)
            const users = JSON.parse(localStorage.getItem("users") || "[]")
            users.push(userData)
            localStorage.setItem("users", JSON.stringify(users))

            // Mostrar mensaje de éxito
            showSuccess()
        } catch (error) {
            // Mostrar mensaje de error
            showError(error.message || "Error al registrar. Inténtalo de nuevo más tarde.")
            console.error("Error de registro:", error)
        }
    })
})
