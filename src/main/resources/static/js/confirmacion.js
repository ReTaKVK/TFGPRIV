document.addEventListener("DOMContentLoaded", async () => {
    console.log("🎉 Cargando página de confirmación...")

    // Verificar autenticación
    if (!isAuthenticated()) {
        showToast("Error", "Debes iniciar sesión para ver esta página", "error")
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
            showToast("Información", "No se encontraron datos de pago reciente", "warning")
            setTimeout(() => {
                window.location.href = "perfil.html"
            }, 3000)
            return
        }

        const paymentData = JSON.parse(lastPayment)
        console.log("Datos del último pago:", paymentData)

        // Mostrar detalles de la confirmación
        displayConfirmationDetails(paymentData, currentUser)

        // Limpiar datos del pago después de mostrarlos
        localStorage.removeItem("lastPayment")
    } catch (error) {
        console.error("Error al cargar confirmación:", error)
        showToast("Error", "Error al cargar los detalles de la confirmación", "error")
    }
})

function displayConfirmationDetails(paymentData, user) {
    // Generar número de reserva
    const bookingNumber = `ALQ-${Date.now().toString().slice(-6)}`

    // Actualizar números de reserva
    document.getElementById("booking-number").textContent = bookingNumber
    document.getElementById("confirmation-booking-number").textContent = bookingNumber

    // Fecha actual
    const today = new Date().toLocaleDateString("es-ES")
    document.getElementById("booking-date").textContent = today

    // Información del cliente
    if (user) {
        document.getElementById("customer-name").textContent = user.nombre || "No disponible"
        document.getElementById("customer-email").textContent = user.email || "No disponible"

        const nivelInfo = getNivelInfo(user.nivelUsuario || "BRONCE")
        document.getElementById("customer-level").innerHTML = `
      <span class="badge" style="background: ${nivelInfo.gradient}; color: white;">
        <i class="bi bi-star-fill"></i> ${nivelInfo.nombre}
      </span>
    `
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
        html += `
      <div class="vehicle-item ${index > 0 ? "border-top pt-3 mt-3" : ""}">
        <div class="row align-items-center">
          <div class="col-md-3">
            <img src="${vehicle.imagen || "/placeholder.svg?height=100&width=150"}" 
                 alt="${vehicle.marca} ${vehicle.modelo}" 
                 class="img-fluid rounded"
                 onerror="this.src='/placeholder.svg?height=100&width=150'">
          </div>
          <div class="col-md-6">
            <h5 class="mb-1">${vehicle.marca} ${vehicle.modelo}</h5>
            <p class="text-muted mb-1">Matrícula: ${vehicle.matricula || "No disponible"}</p>
            <p class="text-muted mb-1">Duración: ${vehicle.dias} días</p>
            <p class="text-muted mb-0">
              Del ${formatDate(vehicle.fechaInicio)} al ${formatDate(vehicle.fechaFin)}
            </p>
          </div>
          <div class="col-md-3 text-end">
            <h5 class="text-success mb-0">${vehicle.total.toFixed(2)}€</h5>
            <small class="text-muted">${vehicle.precioPorDia.toFixed(2)}€/día</small>
          </div>
        </div>
      </div>
    `
    })

    container.innerHTML = html
}

function displayPaymentSummary(paymentData, user) {
    const container = document.getElementById("payment-details")

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
        <h6 class="text-primary mb-3">Desglose del Pago</h6>
        <table class="table table-borderless">
          <tr>
            <td>Subtotal:</td>
            <td class="text-end">${subtotal.toFixed(2)}€</td>
          </tr>
          ${
        descuento > 0
            ? `
          <tr class="text-success">
            <td>Descuento ${nivelUsuario} (${descuentoPorcentaje}%):</td>
            <td class="text-end">-${descuento.toFixed(2)}€</td>
          </tr>
          `
            : ""
    }
          <tr>
            <td>IVA (21%):</td>
            <td class="text-end">${iva.toFixed(2)}€</td>
          </tr>
          <tr class="border-top">
            <td><strong>Total Pagado:</strong></td>
            <td class="text-end"><strong class="text-success fs-5">${total.toFixed(2)}€</strong></td>
          </tr>
        </table>
      </div>
      <div class="col-md-6">
        <h6 class="text-primary mb-3">Método de Pago</h6>
        <div class="payment-method-used">
          <div class="d-flex align-items-center mb-2">
            <i class="bi bi-${paymentMethod === "card" ? "credit-card" : paymentMethod === "paypal" ? "paypal" : "bank"} me-2 text-primary"></i>
            <span>${methodNames[paymentMethod]}</span>
          </div>
          ${
        paymentMethod === "card"
            ? `
            <small class="text-muted">**** **** **** ${paymentData.cardLast4 || "9012"}</small>
          `
            : paymentMethod === "paypal"
                ? `
            <small class="text-muted">${paymentData.paypalEmail || "sb-buyer@personal.example.com"}</small>
          `
                : `
            <small class="text-muted">Transferencia completada</small>
          `
    }
          <div class="mt-2">
            <span class="badge bg-success">
              <i class="bi bi-check-circle me-1"></i>
              Pago Confirmado
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="alert alert-success mt-4">
      <i class="bi bi-check-circle-fill me-2"></i>
      <strong>¡Pago procesado exitosamente!</strong><br>
      ${descuento > 0 ? `Has ahorrado ${descuento.toFixed(2)}€ gracias a tu nivel ${nivelUsuario}. ` : ""}
      Recibirás un email de confirmación en breve.
    </div>
  `
}

function generateQRCode(bookingNumber) {
    const qrElement = document.getElementById("booking-qr")
    if (qrElement) {
        // Generar QR con datos de la reserva
        const qrData = `RENTCAR-${bookingNumber}-${Date.now()}`
        qrElement.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`
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
        return date.toLocaleDateString("es-ES")
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

function showToast(title, message, type = "success") {
    const toast = document.getElementById("toast")
    const toastTitle = document.getElementById("toastTitle")
    const toastMessage = document.getElementById("toastMessage")

    if (!toast || !toastTitle || !toastMessage) return

    toastTitle.textContent = title
    toastMessage.textContent = message

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

// Configurar botón de descarga con PDF ULTRA PROFESIONAL
document.getElementById("download-btn")?.addEventListener("click", async (e) => {
    e.preventDefault()

    try {
        showToast("Información", "Generando comprobante PDF ultra profesional...", "info")

        // Obtener datos para el PDF
        const currentUser = getUser()
        const bookingNumber = document.getElementById("booking-number").textContent
        const lastPayment = localStorage.getItem("lastPayment")
        const paymentData = lastPayment ? JSON.parse(lastPayment) : null

        await generateUltraProfessionalPDF(currentUser, bookingNumber, paymentData)

        showToast("Éxito", "Comprobante PDF ultra profesional descargado", "success")
    } catch (error) {
        console.error("Error al generar PDF:", error)
        showToast("Error", "Error al generar el comprobante PDF", "error")
    }
})

async function generateUltraProfessionalPDF(user, bookingNumber, paymentData) {
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
        paymentData.vehicles.forEach((vehicle, index) => {
            if (yPosition > pageHeight - 60) {
                doc.addPage()
                yPosition = 30
            }

            // Fondo alternado
            if (index % 2 === 0) {
                doc.setFillColor(252, 252, 252)
                doc.rect(15, yPosition - 5, pageWidth - 30, 35, "F")
            }

            // Borde izquierdo colorido
            doc.setFillColor(...colors.accent)
            doc.rect(15, yPosition - 5, 3, 35, "F")

            doc.setTextColor(...colors.dark)
            doc.setFontSize(13)
            doc.setFont("helvetica", "bold")
            doc.text(`${index + 1}. ${vehicle.marca} ${vehicle.modelo}`, 25, yPosition + 5)

            doc.setFontSize(10)
            doc.setFont("helvetica", "normal")
            doc.text(`Matrícula: ${vehicle.matricula || "No disponible"}`, 30, yPosition + 13)
            doc.text(`Duración: ${vehicle.dias} día${vehicle.dias > 1 ? "s" : ""}`, 30, yPosition + 20)
            doc.text(`Precio por día: ${vehicle.precioPorDia.toFixed(2)}€`, 30, yPosition + 27)

            // Precio total destacado
            doc.setTextColor(...colors.secondary)
            doc.setFontSize(14)
            doc.setFont("helvetica", "bold")
            doc.text(`${vehicle.total.toFixed(2)}€`, pageWidth - 25, yPosition + 15, { align: "right" })

            yPosition += 40
        })
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
        vehicles: paymentData?.vehicles?.length || 0,
    })

    // Caja para QR
    doc.setFillColor(...colors.white)
    doc.roundedRect(pageWidth - 70, yPosition, 50, 50, 3, 3, "F")
    doc.setDrawColor(...colors.primary)
    doc.setLineWidth(1)
    doc.roundedRect(pageWidth - 70, yPosition, 50, 50, 3, 3, "S")

    // Texto del QR
    doc.setTextColor(...colors.dark)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("CÓDIGO QR", pageWidth - 45, yPosition - 5, { align: "center" })
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.text("Escanear para verificar", pageWidth - 45, yPosition + 55, { align: "center" })

    // Generar QR usando API externa
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`

    // Simular QR con texto (ya que no podemos insertar imagen real)
    doc.setFontSize(6)
    doc.text("QR CODE", pageWidth - 45, yPosition + 25, { align: "center" })
    doc.text(bookingNumber, pageWidth - 45, yPosition + 30, { align: "center" })

    // === INFORMACIÓN IMPORTANTE ===
    yPosition += 60

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
