document.addEventListener("DOMContentLoaded", async () => {
    console.log("🎉 Cargando página de confirmación...")

    // Verificar autenticación
    if (!isAuthenticated()) {
        showToastSimple("Error", "Debes iniciar sesión para ver esta página", "error")
        setTimeout(() => {
            window.location.href = "index.html"
        }, 2000)
        return
    }

    try {
        // Obtener datos del último pago desde localStorage
        const lastPayment = localStorage.getItem("lastPayment")
        const currentUser = getUser()

        if (!lastPayment) {
            showToastSimple("Información", "No se encontraron datos de pago reciente", "warning")
            setTimeout(() => {
                window.location.href = "perfil-mejorado.html"
            }, 3000)
            return
        }

        const paymentData = JSON.parse(lastPayment)
        console.log("Datos del último pago:", paymentData)

        // Mostrar detalles de la confirmación
        displayConfirmationDetails(paymentData, currentUser)

        // NO limpiar datos del pago para permitir regenerar PDF
        // localStorage.removeItem("lastPayment")
    } catch (error) {
        console.error("Error al cargar confirmación:", error)
        showToastSimple("Error", "Error al cargar los detalles de la confirmación", "error")
    }
})

function displayConfirmationDetails(paymentData, user) {
    // Generar número de reserva único
    const bookingNumber = `ALQ-${Date.now().toString().slice(-6)}`

    // Actualizar números de reserva
    const bookingElements = document.querySelectorAll("#booking-number, #confirmation-booking-number")
    bookingElements.forEach((el) => {
        if (el) el.textContent = bookingNumber
    })

    // Fecha actual
    const today = new Date().toLocaleDateString("es-ES")
    const dateElement = document.getElementById("booking-date")
    if (dateElement) dateElement.textContent = today

    // Información del cliente
    if (user) {
        const nameElement = document.getElementById("customer-name")
        const emailElement = document.getElementById("customer-email")
        const levelElement = document.getElementById("customer-level")

        if (nameElement) nameElement.textContent = user.nombre || "No disponible"
        if (emailElement) emailElement.textContent = user.email || "No disponible"

        if (levelElement) {
            const nivelInfo = getNivelInfo(user.nivelUsuario || "BRONCE")
            levelElement.innerHTML = `
        <span class="badge" style="background: ${nivelInfo.gradient}; color: white;">
          <i class="bi bi-star-fill"></i> ${nivelInfo.nombre}
        </span>
      `
        }
    }

    // Detalles de vehículos
    displayVehicleDetails(paymentData.vehicles || [])

    // Resumen del pago
    displayPaymentSummary(paymentData, user)

    // Generar QR
    generateQRCode(bookingNumber)
}

function displayVehicleDetails(vehicles) {
    const container = document.getElementById("vehicles-details")
    if (!container) return

    if (!vehicles || vehicles.length === 0) {
        container.innerHTML = `
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        No se encontraron detalles específicos de vehículos.
      </div>
    `
        return
    }

    let html = ""
    vehicles.forEach((vehicle, index) => {
        // Usar directamente la URL de la imagen que devuelve la API
        console.log("Datos del vehículo:", vehicle)
        console.log("URL de imagen:", vehicle.imagen)
        console.log("Matrícula:", vehicle.matricula)

        html += `
      <div class="vehicle-item ${index > 0 ? "border-top pt-3 mt-3" : ""}">
        <div class="row align-items-center">
          <div class="col-md-3">
            <img src="${vehicle.imagen }" 
                 class="card-img-top vehicle-img" 
                 alt="${vehicle.marca} ${vehicle.modelo}"
                 >
          </div>
          <div class="col-md-6">
            <h5 class="mb-1">${vehicle.marca} ${vehicle.modelo}</h5>
            <p class="text-muted mb-1">
              <i class="bi bi-credit-card me-1"></i>Matrícula: ${vehicle.matricula}
            </p>
            <p class="text-muted mb-1">
              <i class="bi bi-calendar3 me-1"></i>Duración: ${vehicle.dias ?? 1} día${(vehicle.dias ?? 1) > 1 ? "s" : ""}
            </p>
            <p class="text-muted mb-0">
              <i class="bi bi-calendar-range me-1"></i>
              Del ${formatDate(vehicle.fechaInicio)} al ${formatDate(vehicle.fechaFin)}
            </p>
          </div>
          <div class="col-md-3 text-end">
            <h5 class="text-success mb-0">${(vehicle.total ?? vehicle.precio).toFixed(2)}€</h5>
            <small class="text-muted">${(vehicle.precioPorDia ?? vehicle.precio).toFixed(2)}€/día</small>
          </div>
        </div>
      </div>
    `
    })

    container.innerHTML = html
}

function displayPaymentSummary(paymentData, user) {
    const container = document.getElementById("payment-details")
    if (!container) return

    const subtotal = paymentData.subtotal || 0
    const descuento = paymentData.descuento || 0
    const iva = paymentData.iva || 0
    const total = paymentData.total || 0
    const paymentMethod = paymentData.paymentMethod || "card"

    const methodNames = {
        card: "Tarjeta de Crédito/Débito",
        paypal: "PayPal",
        transfer: "Transferencia Bancaria",
    }

    const nivelUsuario = user?.nivelUsuario || "BRONCE"
    const descuentoPorcentaje = user?.descuentoPorcentaje || 0

    container.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <h6 class="text-primary mb-3">
          <i class="bi bi-calculator me-2"></i>Desglose del Pago
        </h6>
        <div class="bg-light p-3 rounded">
          <div class="d-flex justify-content-between mb-2">
            <span>Subtotal:</span>
            <span class="fw-bold">${subtotal.toFixed(2)}€</span>
          </div>
          ${
        descuento > 0
            ? `
          <div class="d-flex justify-content-between mb-2 text-success">
            <span><i class="bi bi-tag-fill me-1"></i>Descuento ${nivelUsuario} (${descuentoPorcentaje}%):</span>
            <span class="fw-bold">-${descuento.toFixed(2)}€</span>
          </div>
          `
            : ""
    }
          <div class="d-flex justify-content-between mb-2">
            <span>IVA (21%):</span>
            <span class="fw-bold">${iva.toFixed(2)}€</span>
          </div>
          <hr>
          <div class="d-flex justify-content-between">
            <span class="fw-bold fs-5">Total Pagado:</span>
            <span class="fw-bold text-success fs-4">${total.toFixed(2)}€</span>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <h6 class="text-primary mb-3">
          <i class="bi bi-credit-card me-2"></i>Método de Pago
        </h6>
        <div class="payment-method-used">
          <div class="d-flex align-items-center mb-3">
            <div class="payment-method-icon">
              <i class="bi bi-${paymentMethod === "card" ? "credit-card" : paymentMethod === "paypal" ? "paypal" : "bank"}"></i>
            </div>
            <div>
              <h6 class="mb-0">${methodNames[paymentMethod]}</h6>
              ${
        paymentMethod === "card"
            ? `<small class="text-muted">**** **** **** ${paymentData.cardLast4 || "9012"}</small>`
            : paymentMethod === "paypal"
                ? `<small class="text-muted">${paymentData.paypalEmail || "usuario@paypal.com"}</small>`
                : `<small class="text-muted">Transferencia completada</small>`
    }
            </div>
          </div>
          <div class="text-center">
            <span class="badge bg-success fs-6 px-3 py-2">
              <i class="bi bi-check-circle-fill me-2"></i>
              Pago Confirmado
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="alert alert-success mt-4">
      <div class="d-flex align-items-center">
        <i class="bi bi-check-circle-fill me-3" style="font-size: 1.5rem;"></i>
        <div>
          <h6 class="mb-1">¡Pago procesado exitosamente!</h6>
          <p class="mb-0">
            ${descuento > 0 ? `Has ahorrado ${descuento.toFixed(2)}€ gracias a tu nivel ${nivelUsuario}. ` : ""}
            Recibirás un email de confirmación en breve.
          </p>
        </div>
      </div>
    </div>
  `
}

function generateQRCode(bookingNumber) {
    const qrElement = document.getElementById("booking-qr")
    if (qrElement) {
        // Generar QR con datos de la reserva
        const qrData = `RENTCAR-${bookingNumber}-${Date.now()}`
        qrElement.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`
        qrElement.alt = `QR Code para reserva ${bookingNumber}`
    }
}

function getNivelInfo(nivel) {
    const niveles = {
        BRONCE: {
            nombre: "Bronce",
            color: "#CD7F32",
            gradient: "linear-gradient(135deg, #CD7F32, #A0522D)",
        },
        PLATA: {
            nombre: "Plata",
            color: "#C0C0C0",
            gradient: "linear-gradient(135deg, #C0C0C0, #A8A8A8)",
        },
        ORO: {
            nombre: "Oro",
            color: "#FFD700",
            gradient: "linear-gradient(135deg, #FFD700, #FFA500)",
        },
        DIAMANTE: {
            nombre: "Diamante",
            color: "#00BFFF",
            gradient: "linear-gradient(135deg, #00BFFF, #87CEEB)",
        },
    }
    return niveles[nivel] || niveles["BRONCE"]
}

function formatDate(dateString) {
    if (!dateString) return "No disponible"

    try {
        const date = new Date(dateString)
        return date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    } catch (error) {
        return "Fecha inválida"
    }
}

function isAuthenticated() {
    return localStorage.getItem("token") !== null
}

function getUser() {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
}

// Función de toast simple que no depende de Bootstrap
function showToastSimple(title, message, type = "success") {
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`)

    // Crear un toast simple con CSS puro si no existe
    let toastContainer = document.getElementById("toast-container")

    if (!toastContainer) {
        toastContainer = document.createElement("div")
        toastContainer.id = "toast-container"
        toastContainer.style.position = "fixed"
        toastContainer.style.bottom = "20px"
        toastContainer.style.right = "20px"
        toastContainer.style.zIndex = "9999"
        document.body.appendChild(toastContainer)
    }

    // Crear el toast
    const toast = document.createElement("div")
    toast.className = "simple-toast"
    toast.style.backgroundColor =
        type === "success" ? "#10b981" : type === "error" ? "#ef4444" : type === "warning" ? "#f59e0b" : "#3b82f6"
    toast.style.color = "white"
    toast.style.padding = "12px 20px"
    toast.style.borderRadius = "8px"
    toast.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"
    toast.style.marginTop = "10px"
    toast.style.opacity = "0"
    toast.style.transition = "opacity 0.3s ease"

    // Contenido del toast
    toast.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">${title}</div>
    <div>${message}</div>
  `

    // Añadir al contenedor
    toastContainer.appendChild(toast)

    // Mostrar con animación
    setTimeout(() => {
        toast.style.opacity = "1"
    }, 10)

    // Ocultar después de 3 segundos
    setTimeout(() => {
        toast.style.opacity = "0"
        setTimeout(() => {
            toastContainer.removeChild(toast)
        }, 300)
    }, 3000)
}

// =========================================
// GENERADOR DE PDF PROFESIONAL MEJORADO
// =========================================

// Configurar botón de descarga con PDF ULTRA PROFESIONAL
document.addEventListener("DOMContentLoaded", () => {
    const downloadBtn = document.getElementById("download-btn")
    if (downloadBtn) {
        downloadBtn.addEventListener("click", async (e) => {
            e.preventDefault()

            try {
                showToastSimple("Información", "Generando comprobante PDF ultra profesional...", "info")

                // Obtener datos para el PDF
                const currentUser = getUser()
                const bookingNumber =
                    document.getElementById("booking-number")?.textContent || `ALQ-${Date.now().toString().slice(-6)}`
                const lastPayment = localStorage.getItem("lastPayment")
                const paymentData = lastPayment ? JSON.parse(lastPayment) : null

                if (!paymentData) {
                    showToastSimple("Error", "No se encontraron datos de pago para generar el PDF", "error")
                    return
                }

                await generateProfessionalPDF(currentUser, bookingNumber, paymentData)

                showToastSimple("Éxito", "Comprobante PDF ultra profesional descargado", "success")
            } catch (error) {
                console.error("Error al generar PDF:", error)
                showToastSimple("Error", "Error al generar el comprobante PDF: " + error.message, "error")
            }
        })
    }
})

async function generateProfessionalPDF(user, bookingNumber, paymentData) {
    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === "undefined") {
        // Intentar cargar jsPDF si no está disponible
        await loadJsPDF()
    }

    const { jsPDF } = window.jspdf

    // Crear documento PDF A4
    const doc = new jsPDF("portrait", "mm", "a4")
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Paleta de colores profesional
    const colors = {
        primary: [37, 99, 235], // Azul corporativo
        secondary: [16, 185, 129], // Verde éxito
        accent: [245, 158, 11], // Dorado
        dark: [15, 23, 42], // Gris muy oscuro
        light: [248, 250, 252], // Gris muy claro
        white: [255, 255, 255],
        danger: [239, 68, 68], // Rojo
    }

    // === HEADER CORPORATIVO PREMIUM ===
    // Fondo degradado principal
    doc.setFillColor(...colors.primary)
    doc.rect(0, 0, pageWidth, 70, "F")

    // Líneas decorativas doradas
    doc.setFillColor(...colors.accent)
    doc.rect(0, 65, pageWidth, 3, "F")
    doc.setFillColor(...colors.secondary)
    doc.rect(0, 68, pageWidth, 2, "F")

    // Logo y marca
    doc.setTextColor(...colors.white)
    doc.setFontSize(32)
    doc.setFont("helvetica", "bold")
    doc.text("RENTCAR", 20, 30)

    // Subtítulo corporativo
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("COMPROBANTE OFICIAL DE ALQUILER", 20, 40)

    // Número de reserva destacado
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text(`N° ${bookingNumber}`, 20, 55)

    // Información de fecha y hora en la esquina
    const fechaCompleta = new Date().toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Emitido: ${fechaCompleta}`, pageWidth - 20, 25, { align: "right" })
    doc.text("Documento verificado", pageWidth - 20, 35, { align: "right" })

    let yPosition = 90

    // === INFORMACIÓN DEL CLIENTE ===
    // Caja con sombra
    doc.setFillColor(...colors.light)
    doc.roundedRect(15, yPosition - 5, pageWidth - 30, 45, 3, 3, "F")

    // Borde sutil
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.roundedRect(15, yPosition - 5, pageWidth - 30, 45, 3, 3, "S")

    doc.setTextColor(...colors.primary)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("INFORMACIÓN DEL CLIENTE", 20, yPosition + 8)

    yPosition += 18
    doc.setTextColor(...colors.dark)
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")

    // Información en columnas
    doc.text(`Nombre completo:`, 20, yPosition)
    doc.setFont("helvetica", "bold")
    doc.text(`${user?.nombre || "No disponible"}`, 60, yPosition)

    doc.setFont("helvetica", "normal")
    doc.text(`Email:`, 20, yPosition + 8)
    doc.setFont("helvetica", "bold")
    doc.text(`${user?.email || "No disponible"}`, 60, yPosition + 8)

    // Nivel del usuario con estilo premium
    const nivelInfo = getNivelInfo(user?.nivelUsuario || "BRONCE")
    doc.setTextColor(...colors.accent)
    doc.setFont("helvetica", "bold")
    doc.text(`Nivel de membresía:`, pageWidth - 80, yPosition, { align: "left" })
    doc.text(`${nivelInfo.nombre.toUpperCase()}`, pageWidth - 80, yPosition + 8, { align: "left" })

    if (user?.descuentoPorcentaje > 0) {
        doc.setTextColor(...colors.secondary)
        doc.text(`Descuento aplicado: ${user.descuentoPorcentaje}%`, pageWidth - 80, yPosition + 16, { align: "left" })
    }

    yPosition += 50

    // === DETALLES DE VEHÍCULOS ===
    if (paymentData?.vehicles && paymentData.vehicles.length > 0) {
        // Header de sección
        doc.setFillColor(...colors.primary)
        doc.rect(15, yPosition, pageWidth - 30, 15, "F")

        doc.setTextColor(...colors.white)
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("VEHÍCULOS ALQUILADOS", 20, yPosition + 10)

        yPosition += 25

        // Lista de vehículos con diseño premium
        for (let index = 0; index < paymentData.vehicles.length; index++) {
            const vehicle = paymentData.vehicles[index]

            if (yPosition > pageHeight - 80) {
                doc.addPage()
                yPosition = 30
            }

            // Fondo alternado
            if (index % 2 === 0) {
                doc.setFillColor(252, 252, 252)
                doc.rect(15, yPosition - 5, pageWidth - 30, 50, "F")
            }

            // Borde izquierdo colorido
            doc.setFillColor(...colors.accent)
            doc.rect(15, yPosition - 5, 3, 50, "F")

            // Intentar cargar y añadir imagen del vehículo
            try {
                if (vehicle.imagen) {
                    await addVehicleImageToPDF(doc, vehicle.imagen, 25, yPosition, 40, 30)
                }
            } catch (error) {
                console.warn("No se pudo cargar la imagen del vehículo:", error)
                // Continuar sin imagen
            }

            // Información del vehículo (ajustada para la imagen)
            doc.setTextColor(...colors.dark)
            doc.setFontSize(13)
            doc.setFont("helvetica", "bold")
            doc.text(`${index + 1}. ${vehicle.marca} ${vehicle.modelo}`, 75, yPosition + 5)

            // Depuración de matrícula
            console.log("Matrícula en PDF:", vehicle.matricula)

            // Buscar la matrícula en todas las propiedades posibles
            let matricula = "No disponible"
            if (vehicle.matricula) {
                matricula = vehicle.matricula
            } else if (vehicle.Matricula) {
                matricula = vehicle.Matricula
            } else {
                // Buscar en todas las propiedades
                for (const key in vehicle) {
                    if (key.toLowerCase() === "matricula") {
                        matricula = vehicle[key]
                        break
                    }
                }
            }

            doc.setFontSize(10)
            doc.setFont("helvetica", "normal")
            doc.text(`Matrícula: ${matricula}`, 75, yPosition + 13)
            doc.text(`Duración: ${vehicle.dias ?? 1} día${(vehicle.dias ?? 1) > 1 ? "s" : ""}`, 75, yPosition + 20)
            doc.text(`Precio por día: ${(vehicle.precioPorDia ?? vehicle.precio).toFixed(2)}€`, 75, yPosition + 27)

            // Precio total destacado
            doc.setTextColor(...colors.secondary)
            doc.setFontSize(14)
            doc.setFont("helvetica", "bold")
            doc.text(`${(vehicle.total ?? vehicle.precio).toFixed(2)}€`, pageWidth - 25, yPosition + 15, { align: "right" })

            yPosition += 55
        }
    }

    // === RESUMEN FINANCIERO PREMIUM ===
    if (yPosition > pageHeight - 100) {
        doc.addPage()
        yPosition = 30
    }

    // Caja del resumen con sombra
    doc.setFillColor(...colors.light)
    doc.roundedRect(15, yPosition, pageWidth - 30, 80, 5, 5, "F")

    doc.setDrawColor(...colors.primary)
    doc.setLineWidth(1)
    doc.roundedRect(15, yPosition, pageWidth - 30, 80, 5, 5, "S")

    doc.setTextColor(...colors.primary)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("RESUMEN FINANCIERO", 20, yPosition + 15)

    yPosition += 30

    if (paymentData) {
        doc.setTextColor(...colors.dark)
        doc.setFontSize(12)
        doc.setFont("helvetica", "normal")

        // Líneas del resumen con mejor espaciado
        const lineHeight = 10
        let currentLine = 0

        doc.text(`Subtotal:`, 25, yPosition + currentLine * lineHeight)
        doc.text(`${paymentData.subtotal.toFixed(2)}€`, pageWidth - 25, yPosition + currentLine * lineHeight, {
            align: "right",
        })
        currentLine++

        if (paymentData.descuento > 0) {
            doc.setTextColor(...colors.secondary)
            doc.text(`Descuento ${user?.nivelUsuario}:`, 25, yPosition + currentLine * lineHeight)
            doc.text(`-${paymentData.descuento.toFixed(2)}€`, pageWidth - 25, yPosition + currentLine * lineHeight, {
                align: "right",
            })
            currentLine++
            doc.setTextColor(...colors.dark)
        }

        doc.text(`IVA (21%):`, 25, yPosition + currentLine * lineHeight)
        doc.text(`${paymentData.iva.toFixed(2)}€`, pageWidth - 25, yPosition + currentLine * lineHeight, { align: "right" })
        currentLine++

        // Línea separadora
        doc.setDrawColor(...colors.primary)
        doc.setLineWidth(0.8)
        doc.line(25, yPosition + currentLine * lineHeight + 3, pageWidth - 25, yPosition + currentLine * lineHeight + 3)
        currentLine++

        // Total destacado
        doc.setTextColor(...colors.primary)
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.text(`TOTAL PAGADO:`, 25, yPosition + currentLine * lineHeight + 5)
        doc.text(`${paymentData.total.toFixed(2)}€`, pageWidth - 25, yPosition + currentLine * lineHeight + 5, {
            align: "right",
        })
    }

    yPosition += 90

    // === CÓDIGO QR INTEGRADO ===
    if (yPosition > pageHeight - 80) {
        doc.addPage()
        yPosition = 30
    }

    // Generar QR code con datos completos
    const qrData = JSON.stringify({
        booking: bookingNumber,
        customer: user?.email,
        date: new Date().toISOString(),
        total: paymentData?.total || 0,
        vehicles:
            paymentData?.vehicles?.map((v) => ({
                marca: v.marca,
                modelo: v.modelo,
                matricula: v.matricula || "No disponible",
                dias: v.dias ?? 1,
                total: v.total ?? v.precio,
            })) || [],
    })

    // Título para la sección QR
    doc.setTextColor(...colors.primary)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("CÓDIGO QR DE VERIFICACIÓN", pageWidth / 2, yPosition, { align: "center" })

    yPosition += 10

    // Caja para QR
    doc.setFillColor(...colors.white)
    doc.roundedRect(pageWidth / 2 - 30, yPosition, 60, 60, 3, 3, "F")
    doc.setDrawColor(...colors.primary)
    doc.setLineWidth(1)
    doc.roundedRect(pageWidth / 2 - 30, yPosition, 60, 60, 3, 3, "S")

    // Texto del QR
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text("Escanear para verificar la reserva", pageWidth / 2, yPosition + 65, { align: "center" })

    // Añadir QR real
    try {
        await addQRCodeToPDF(doc, qrData, pageWidth / 2 - 25, yPosition + 5, 50, 50)
    } catch (error) {
        console.warn("No se pudo generar el código QR:", error)
        // Simular QR con texto
        doc.setFontSize(6)
        doc.text("QR CODE", pageWidth / 2, yPosition + 30, { align: "center" })
        doc.text(bookingNumber, pageWidth / 2, yPosition + 35, { align: "center" })
    }

    yPosition += 70

    // === INFORMACIÓN IMPORTANTE ===
    if (yPosition > pageHeight - 60) {
        doc.addPage()
        yPosition = 30
    }

    // Caja de información crítica
    doc.setFillColor(254, 243, 199) // Amarillo claro
    doc.roundedRect(15, yPosition, pageWidth - 30, 50, 3, 3, "F")

    doc.setDrawColor(...colors.accent)
    doc.setLineWidth(1)
    doc.roundedRect(15, yPosition, pageWidth - 30, 50, 3, 3, "S")

    doc.setTextColor(...colors.accent)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("INFORMACIÓN IMPORTANTE", 20, yPosition + 12)

    yPosition += 20
    doc.setTextColor(...colors.dark)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    const infoTexts = [
        "• Presente este comprobante al recoger su vehículo",
        "• Documentación de identidad válida obligatoria",
        "• Inspección del vehículo antes y después del alquiler",
        "• Cualquier daño será evaluado y facturado por separado",
        "• Política de combustible: devolver con el mismo nivel",
    ]

    infoTexts.forEach((text, index) => {
        doc.text(text, 20, yPosition + index * 6)
    })

    // === FOOTER CORPORATIVO ===
    yPosition = pageHeight - 40

    // Línea decorativa superior
    doc.setDrawColor(...colors.primary)
    doc.setLineWidth(2)
    doc.line(15, yPosition, pageWidth - 15, yPosition)

    yPosition += 8

    // Información de contacto
    doc.setTextColor(...colors.dark)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("RENTCAR - Soluciones Premium de Alquiler", pageWidth / 2, yPosition, { align: "center" })

    yPosition += 6
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.text("Calle Principal 123, Ciudad | Tel: (+34) 123 456 789 | Email: info@rentcar.com", pageWidth / 2, yPosition, {
        align: "center",
    })

    yPosition += 6
    doc.text("www.rentcar.com | Síguenos en redes sociales @RentCarOficial", pageWidth / 2, yPosition, {
        align: "center",
    })

    yPosition += 8
    doc.setTextColor(...colors.primary)
    doc.setFont("helvetica", "bold")
    doc.text(`Documento generado automáticamente el ${new Date().toLocaleString("es-ES")}`, pageWidth / 2, yPosition, {
        align: "center",
    })

    // Mensaje de ahorro si aplica
    if (paymentData?.descuento > 0) {
        yPosition += 8
        doc.setTextColor(...colors.secondary)
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text(
            `¡FELICIDADES! Has ahorrado ${paymentData.descuento.toFixed(2)}€ gracias a tu nivel ${user?.nivelUsuario}`,
            pageWidth / 2,
            yPosition,
            { align: "center" },
        )
    }

    // Número de página y validación
    doc.setTextColor(...colors.dark)
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.text("Página 1 de 1", pageWidth - 20, pageHeight - 10, { align: "right" })
    doc.text(`Documento válido | ID: ${bookingNumber}`, 20, pageHeight - 10)

    // Descargar PDF
    const fileName = `RentCar-Comprobante-${bookingNumber}-${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(fileName)
}

// Función para añadir imagen de vehículo al PDF
async function addVehicleImageToPDF(doc, imageUrl, x, y, width, height) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = "anonymous"

        img.onload = function () {
            try {
                doc.addImage(this, "JPEG", x, y, width, height)
                resolve()
            } catch (error) {
                console.warn("Error al añadir imagen:", error)
                resolve() // Continuar sin imagen
            }
        }

        img.onerror = () => {
            console.warn("No se pudo cargar la imagen del vehículo")
            resolve() // Continuar sin imagen
        }

        img.src = imageUrl
    })
}

// Función para añadir código QR al PDF
async function addQRCodeToPDF(doc, qrData, x, y, width, height) {
    return new Promise((resolve, reject) => {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`

        const img = new Image()
        img.crossOrigin = "anonymous"

        img.onload = function () {
            try {
                doc.addImage(this, "PNG", x, y, width, height)
                resolve()
            } catch (error) {
                console.warn("Error al añadir QR:", error)
                resolve()
            }
        }

        img.onerror = () => {
            console.warn("No se pudo cargar el código QR")
            resolve()
        }

        img.src = qrUrl
    })
}

// Función para cargar jsPDF si no está disponible
async function loadJsPDF() {
    return new Promise((resolve, reject) => {
        // Si ya está cargado, resolver inmediatamente
        if (window.jspdf) {
            return resolve()
        }

        // Cargar jsPDF
        const script = document.createElement("script")
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        script.onload = () => {
            // Cargar el complemento para autoTabla
            const autoTableScript = document.createElement("script")
            autoTableScript.src =
                "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js"
            autoTableScript.onload = resolve
            autoTableScript.onerror = () => reject(new Error("No se pudo cargar jspdf-autotable"))
            document.head.appendChild(autoTableScript)
        }
        script.onerror = () => reject(new Error("No se pudo cargar jsPDF"))
        document.head.appendChild(script)
    })
}
