// Declarar la variable google (asumiendo que se carga a través de un script tag)
// Si se usa un import, reemplazar esto con la declaración de importación correcta
// @ts-ignore
// var google;

// Función para inicializar el mapa
function initMap() {
    const mapElement = document.getElementById("map")
    if (!mapElement) return

    // Coordenadas de la oficina (ejemplo)
    const officeLocation = { lat: 40.416775, lng: -3.70379 }

    const map = new google.maps.Map(mapElement, {
        center: officeLocation,
        zoom: 15,
    })

    new google.maps.Marker({
        position: officeLocation,
        map,
        title: "RentCar - Oficina Central",
    })
}

// Función para mostrar un toast (notificación)
function showToast(title, message, type) {
    // Crear el elemento toast
    const toast = document.createElement("div")
    toast.classList.add("toast", "fade", "show")
    toast.setAttribute("role", "alert")
    toast.setAttribute("aria-live", "assertive")
    toast.setAttribute("aria-atomic", "true")

    // Crear el header del toast
    const toastHeader = document.createElement("div")
    toastHeader.classList.add("toast-header")

    // Agregar el título al header
    const toastTitle = document.createElement("strong")
    toastTitle.classList.add("me-auto")
    toastTitle.textContent = title

    // Agregar el botón de cerrar al header
    const closeButton = document.createElement("button")
    closeButton.classList.add("btn-close")
    closeButton.setAttribute("type", "button")
    closeButton.setAttribute("data-bs-dismiss", "toast")
    closeButton.setAttribute("aria-label", "Close")

    toastHeader.appendChild(toastTitle)
    toastHeader.appendChild(closeButton)

    // Crear el cuerpo del toast
    const toastBody = document.createElement("div")
    toastBody.classList.add("toast-body")
    toastBody.textContent = message

    // Agregar el header y el cuerpo al toast
    toast.appendChild(toastHeader)
    toast.appendChild(toastBody)

    // Agregar el toast al DOM
    document.body.appendChild(toast)

    // Eliminar el toast después de unos segundos
    setTimeout(() => {
        toast.remove()
    }, 5000)
}

// Eventos
document.addEventListener("DOMContentLoaded", () => {
    // Evento para el formulario de contacto
    const contactForm = document.getElementById("contact-form")
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault()

            // Obtener los valores del formulario
            const nombre = document.getElementById("contact-nombre").value
            const email = document.getElementById("contact-email").value
            const asunto = document.getElementById("contact-asunto").value
            const mensaje = document.getElementById("contact-mensaje").value

            // Validar el formulario
            if (!nombre || !email || !asunto || !mensaje) {
                const contactError = document.getElementById("contact-error")
                contactError.textContent = "Por favor, completa todos los campos"
                contactError.classList.remove("d-none")
                return
            }

            // Simular envío del formulario
            setTimeout(() => {
                // Ocultar mensaje de error si está visible
                document.getElementById("contact-error").classList.add("d-none")

                // Mostrar mensaje de éxito
                document.getElementById("contact-success").classList.remove("d-none")

                // Limpiar el formulario
                contactForm.reset()

                // Mostrar notificación
                showToast("Éxito", "Tu mensaje ha sido enviado correctamente", "success")
            }, 1000)
        })
    }
})
