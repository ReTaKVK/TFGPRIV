// Variables globales
let vehiculo = null
let precioTotal = 0
let diasAlquiler = 0

// Función para obtener los parámetros de la URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search)
    return {
        id: params.get("id"),
    }
}

// Función para cargar los detalles del vehículo
async function loadVehicleDetails() {
    try {
        const { id } = getUrlParams()
        if (!id) {
            window.location.href = "vehiculos.html"
            return
        }

        const response = await fetch(`http://localhost:8080/api/vehiculos/${id}`)

        if (!response.ok) {
            throw new Error("Error al cargar los detalles del vehículo")
        }

        vehiculo = await response.json()

        // Mostrar los detalles del vehículo
        displayVehicleDetails(vehiculo)

        // Inicializar el mapa
        initMap(vehiculo.latitud, vehiculo.longitud)

        // Inicializar el selector de fechas
        initDatePickers()
    } catch (error) {
        console.error("Error:", error)
        showToast("Error", "Error al cargar los detalles del vehículo", "error")
    }
}

// Función para generar especificaciones técnicas aleatorias pero realistas
function generateRandomSpecs(vehicle) {
    // Usamos el ID del vehículo como semilla para que los valores sean consistentes
    // para el mismo vehículo en diferentes cargas de página
    const seed = hashCode(vehicle.id.toString() + vehicle.matricula)
    const random = seededRandom(seed)

    // Determinar la categoría del vehículo basada en el modelo/marca para generar valores apropiados
    const isLuxury = /mercedes|bmw|audi|lexus|porsche/i.test(vehicle.marca)
    const isSports = /deportivo|sport|gt|coupe/i.test(vehicle.modelo)
    const isEconomic = /toyota|honda|hyundai|kia|dacia/i.test(vehicle.marca)

    // Generar valores basados en la categoría
    let motorBase, potenciaBase, ccBase, velocidadBase, aceleracionBase, consumoBase

    if (isLuxury || isSports) {
        motorBase = random() > 0.5 ? 3.0 : 2.5
        potenciaBase = 220 + Math.floor(random() * 180) // 220-400 CV
        ccBase = 2500 + Math.floor(random() * 1500) // 2500-4000 CC
        velocidadBase = 240 + Math.floor(random() * 60) // 240-300 km/h
        aceleracionBase = 4 + random() * 2 // 4-6 segundos
        consumoBase = 8 + random() * 4 // 8-12 L/100km
    } else if (isEconomic) {
        motorBase = random() > 0.5 ? 1.4 : 1.6
        potenciaBase = 90 + Math.floor(random() * 40) // 90-130 CV
        ccBase = 1200 + Math.floor(random() * 600) // 1200-1800 CC
        velocidadBase = 160 + Math.floor(random() * 40) // 160-200 km/h
        aceleracionBase = 10 + random() * 3 // 10-13 segundos
        consumoBase = 4 + random() * 2 // 4-6 L/100km
    } else {
        motorBase = random() > 0.5 ? 1.8 : 2.0
        potenciaBase = 130 + Math.floor(random() * 70) // 130-200 CV
        ccBase = 1600 + Math.floor(random() * 800) // 1600-2400 CC
        velocidadBase = 180 + Math.floor(random() * 60) // 180-240 km/h
        aceleracionBase = 7 + random() * 3 // 7-10 segundos
        consumoBase = 6 + random() * 2 // 6-8 L/100km
    }

    // Determinar tipo de combustible
    const combustibles = ["Gasolina", "Diésel", "Híbrido", "Eléctrico"]
    const combustibleIndex = Math.floor(random() * (isLuxury ? 4 : 3)) // Los de lujo tienen más probabilidad de ser eléctricos
    const combustible = combustibles[combustibleIndex]

    // Ajustar valores según el tipo de combustible
    if (combustible === "Diésel") {
        potenciaBase *= 0.9
        consumoBase *= 0.8
        aceleracionBase *= 1.1
    } else if (combustible === "Híbrido") {
        consumoBase *= 0.7
    } else if (combustible === "Eléctrico") {
        motorBase = "Eléctrico"
        potenciaBase *= 1.2
        consumoBase = 0
        aceleracionBase *= 0.7
    }

    // Año del vehículo (entre 2018 y 2024)
    const anio = 2018 + Math.floor(random() * 7)

    return {
        motor: typeof motorBase === "string" ? motorBase : motorBase.toFixed(1),
        potencia: Math.round(potenciaBase),
        cc: Math.round(ccBase),
        combustible: combustible,
        velocidadMax: Math.round(velocidadBase),
        aceleracion: aceleracionBase.toFixed(1),
        consumo: combustible === "Eléctrico" ? "0" : consumoBase.toFixed(1),
        anio: anio.toString(),
    }
}

// Función hash simple para generar una semilla a partir de un string
function hashCode(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convertir a entero de 32 bits
    }
    return hash
}

// Generador de números aleatorios con semilla
function seededRandom(seed) {
    const m = 2 ** 35 - 31
    const a = 185852
    let s = seed % m
    return () => (s = (s * a) % m) / m
}

// Función para mostrar los detalles del vehículo
function displayVehicleDetails(vehicle) {
    // Ocultar el spinner de carga
    document.getElementById("loading").classList.add("d-none")

    // Mostrar el contenido
    document.getElementById("vehiculo-detalle").classList.remove("d-none")

    // Actualizar los elementos con los datos del vehículo
    document.getElementById("vehiculo-titulo").textContent = `${vehicle.marca} ${vehicle.modelo}`
    document.getElementById("breadcrumb-titulo").textContent = `${vehicle.marca} ${vehicle.modelo}`
    document.getElementById("vehiculo-nombre").textContent = `${vehicle.marca} ${vehicle.modelo}`
    document.getElementById("vehiculo-matricula").textContent = vehicle.matricula
    document.getElementById("vehiculo-disponibilidad").textContent = vehicle.disponible ? "Disponible" : "No disponible"
    document.getElementById("vehiculo-precio").textContent = vehicle.precio

    // Imagen del vehículo
    const vehiculoImagen = document.getElementById("vehiculo-imagen")
    vehiculoImagen.src = vehicle.imagen || "img/car-placeholder.jpg"
    vehiculoImagen.alt = `${vehicle.marca} ${vehicle.modelo}`

    // Actualizar el título de la página
    document.title = `${vehicle.marca} ${vehicle.modelo} - RentCar`

    // Deshabilitar el botón de reserva si el vehículo no está disponible
    const btnReservar = document.getElementById("btn-reservar")
    if (!vehicle.disponible) {
        btnReservar.disabled = true
        btnReservar.textContent = "No disponible"
    }

    // Generar datos técnicos aleatorios pero realistas para este vehículo
    const datosTecnicos = generateRandomSpecs(vehicle)

    // Disparar evento con los datos técnicos
    document.dispatchEvent(
        new CustomEvent("vehicleDataLoaded", {
            detail: {
                ...vehicle,
                ...datosTecnicos,
            },
        }),
    )
}

// Función para inicializar el mapa
function initMap(lat, lng) {
    if (!lat || !lng) return

    const mapElement = document.getElementById("map")
    if (!mapElement) return

    const map = new google.maps.Map(mapElement, {
        center: { lat, lng },
        zoom: 15,
    })

    new google.maps.Marker({
        position: { lat, lng },
        map,
        title: `${vehiculo.marca} ${vehiculo.modelo}`,
    })
}

// Función para inicializar los selectores de fecha
function initDatePickers() {
    const fechaInicio = document.getElementById("fechaInicio")
    const fechaFin = document.getElementById("fechaFin")

    if (!fechaInicio || !fechaFin) return

    // Configurar el selector de fecha de inicio
    const fpInicio = flatpickr(fechaInicio, {
        locale: "es",
        dateFormat: "d/m/Y",
        minDate: "today",
        onChange: (selectedDates, dateStr) => {
            // Actualizar la fecha mínima del selector de fecha de fin
            fpFin.set("minDate", dateStr)

            // Calcular el precio total
            calculateTotalPrice()
        },
    })

    // Configurar el selector de fecha de fin
    const fpFin = flatpickr(fechaFin, {
        locale: "es",
        dateFormat: "d/m/Y",
        minDate: "today",
        onChange: () => {
            // Calcular el precio total
            calculateTotalPrice()
        },
    })
}

// Función para calcular el precio total
function calculateTotalPrice() {
    const fechaInicio = document.getElementById("fechaInicio").value
    const fechaFin = document.getElementById("fechaFin").value

    if (!fechaInicio || !fechaFin || !vehiculo) {
        precioTotal = 0
        diasAlquiler = 0
        document.getElementById("precio-total").textContent = "0€"
        return
    }

    // Convertir las fechas a objetos Date
    const inicio = flatpickr.parseDate(fechaInicio, "d/m/Y")
    const fin = flatpickr.parseDate(fechaFin, "d/m/Y")

    // Calcular la diferencia en días
    const diffTime = Math.abs(fin - inicio)
    diasAlquiler = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Calcular el precio total
    precioTotal = diasAlquiler * vehiculo.precio

    // Actualizar el elemento con el precio total
    document.getElementById("precio-total").textContent = `${precioTotal}€`
}

// Función para obtener el ID del usuario autenticado
function obtenerUsuarioId() {
    const user = localStorage.getItem("user")
    if (user) {
        try {
            const userData = JSON.parse(user)
            return userData.id
        } catch (error) {
            console.error("Error al parsear datos del usuario:", error)
            return null
        }
    }
    return null
}

// Función para verificar disponibilidad
async function verificarDisponibilidad(vehiculoId, fechaInicio, fechaFin) {
    try {
        const token = localStorage.getItem("token")
        if (!token) {
            return false
        }

        const response = await fetch(
            `http://localhost:8080/api/vehiculos/${vehiculoId}/disponibilidad?fechaInicio=${fechaInicio.toISOString()}&fechaFin=${fechaFin.toISOString()}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        )

        if (!response.ok) {
            return false
        }

        return await response.json()
    } catch (error) {
        console.error("Error al verificar disponibilidad:", error)
        return false
    }
}

// Función para agregar el vehículo al carrito
async function addToCart() {
    const fechaInicio = document.getElementById("fechaInicio").value
    const fechaFin = document.getElementById("fechaFin").value

    if (!fechaInicio || !fechaFin) {
        showToast("Error", "Por favor, selecciona las fechas de inicio y fin", "error")
        return
    }

    // Convertir las fechas a objetos Date
    const inicio = flatpickr.parseDate(fechaInicio, "d/m/Y")
    const fin = flatpickr.parseDate(fechaFin, "d/m/Y")

    // Verificar que la fecha de fin sea posterior a la de inicio
    if (fin <= inicio) {
        showToast("Error", "La fecha de fin debe ser posterior a la fecha de inicio", "error")
        return
    }

    // Obtener el ID del usuario
    const usuarioId = obtenerUsuarioId()
    if (!usuarioId) {
        showToast("Error", "No se pudo obtener el ID del usuario", "error")
        return
    }

    // Verificar disponibilidad antes de agregar al carrito
    const disponible = await verificarDisponibilidad(vehiculo.id, inicio, fin)
    if (!disponible) {
        showToast("Error", "El vehículo no está disponible en las fechas seleccionadas", "error")
        return
    }

    // Crear el objeto de carrito según la estructura esperada por el backend
    const carritoItem = {
        usuarioId: usuarioId,
        vehiculoId: vehiculo.id,
        dias: diasAlquiler,
        fechaInicio: inicio.toISOString(), // Enviar la fecha de inicio seleccionada
        fechaFin: fin.toISOString(), // Enviar la fecha de fin seleccionada
    }

    console.log("Enviando datos al carrito:", carritoItem)

    // Enviar al backend para agregar al carrito
    try {
        const token = localStorage.getItem("token")
        if (!token) {
            showToast("Error", "No se encontró el token de autenticación", "error")
            return
        }

        const response = await fetch("http://localhost:8080/api/carrito/agregar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(carritoItem),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => null)
            throw new Error(errorData?.message || "Error al agregar el vehículo al carrito")
        }

        // Mostrar notificación
        showToast("Éxito", "Vehículo agregado al carrito", "success")

        // Redirigir al carrito
        setTimeout(() => {
            window.location.href = "carrito.html"
        }, 1500)
    } catch (error) {
        console.error("Error al agregar al carrito:", error)
        showToast("Error", error.message, "error")
    }
}

// Función para mostrar notificaciones
function showToast(title, message, type = "success") {
    const toast = document.getElementById("toast")
    const toastTitle = document.getElementById("toastTitle")
    const toastMessage = document.getElementById("toastMessage")

    toastTitle.textContent = title
    toastMessage.textContent = message

    // Aplicar clase según el tipo
    toast.classList.remove("bg-success", "bg-danger", "bg-warning", "text-white")
    if (type === "success") {
        toast.classList.add("bg-success", "text-white")
    } else if (type === "error") {
        toast.classList.add("bg-danger", "text-white")
    } else if (type === "warning") {
        toast.classList.add("bg-warning")
    }

    const bsToast = new bootstrap.Toast(toast)
    bsToast.show()
}

// Función para verificar si el usuario está autenticado
function isAuthenticated() {
    return localStorage.getItem("token") !== null
}

// Eventos
document.addEventListener("DOMContentLoaded", () => {
    loadVehicleDetails()

    // Evento para el formulario de reserva
    const reservaForm = document.getElementById("reservaForm")
    if (reservaForm) {
        reservaForm.addEventListener("submit", (e) => {
            e.preventDefault()

            // Verificar si el usuario está autenticado
            if (!isAuthenticated()) {
                // Guardar la URL actual para redirigir después del login
                sessionStorage.setItem("redirectAfterLogin", window.location.href)

                // Mostrar el modal de login
                const loginModalElement = document.getElementById("loginModal")
                const loginModal = new bootstrap.Modal(loginModalElement)
                loginModal.show()

                // Mostrar mensaje
                showToast("Información", "Debes iniciar sesión para reservar un vehículo", "warning")
                return
            }

            // Agregar al carrito
            addToCart()
        })
    }
})
