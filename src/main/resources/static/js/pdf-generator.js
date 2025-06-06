/**
 * Generador de tickets PDF para RentCar - Versión con espaciado corregido
 * Este script utiliza jsPDF para crear un comprobante de alquiler descargable
 */

// Función principal para generar el PDF del ticket
function generateTicketPDF(alquilerData, vehiculoData, usuarioData) {
    return new Promise((resolve, reject) => {
        try {
            // Cargar la biblioteca jsPDF
            const script = document.createElement("script")
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
            script.onload = () => {
                // Cargar el complemento para autoTabla
                const autoTableScript = document.createElement("script")
                autoTableScript.src =
                    "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js"
                autoTableScript.onload = () => {
                    // Una vez cargadas las bibliotecas, crear el PDF
                    createPDF(alquilerData, vehiculoData, usuarioData).then(resolve).catch(reject)
                }
                document.head.appendChild(autoTableScript)
            }
            document.head.appendChild(script)
        } catch (error) {
            reject(error)
        }
    })
}

// Función para crear el PDF con los datos proporcionados
async function createPDF(alquilerData, vehiculoData, usuarioData) {
    const { jsPDF } = window.jspdf
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    })

    // Configuración de colores profesionales
    const colors = {
        primary: [37, 99, 235],
        secondary: [16, 185, 129],
        accent: [245, 158, 11],
        dark: [15, 23, 42],
        light: [248, 250, 252],
        white: [255, 255, 255],
    }

    let yPosition = 10

    // === HEADER CORPORATIVO ===
    doc.setFillColor(...colors.primary)
    doc.rect(0, 0, 210, 45, "F")

    // Líneas decorativas
    doc.setFillColor(...colors.accent)
    doc.rect(0, 42, 210, 2, "F")
    doc.setFillColor(...colors.secondary)
    doc.rect(0, 44, 210, 1, "F")

    // Logo y marca principal
    doc.setTextColor(...colors.white)
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("RENTCAR", 20, 18)

    // Subtítulo corporativo
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("COMPROBANTE OFICIAL DE ALQUILER", 20, 26)

    // Número de comprobante
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(`Comprobante N° ALQ-${alquilerData.id}`, 20, 35)

    // Información de fecha y estado en la esquina
    const fechaEmision = new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(`Emitido: ${fechaEmision}`, 140, 16)
    doc.text("Estado: CONFIRMADO", 140, 22)
    doc.text("Documento Oficial", 140, 28)

    yPosition = 55

    // === INFORMACIÓN DE LA EMPRESA ===
    doc.setFillColor(...colors.light)
    doc.rect(15, yPosition, 180, 18, "F")
    doc.setDrawColor(...colors.primary)
    doc.setLineWidth(0.5)
    doc.rect(15, yPosition, 180, 18, "S")

    doc.setTextColor(...colors.dark)
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.text("RentCar S.L. | CIF: B12345678 | Registro Mercantil: Madrid, Tomo 1234, Folio 567", 20, yPosition + 5)
    doc.text("Dirección: Calle Principal 123, 28001 Madrid, España", 20, yPosition + 9)
    doc.text("Tel: (+34) 123 456 789 | Email: info@rentcar.com | Web: www.rentcar.com", 20, yPosition + 13)

    yPosition += 28

    // === INFORMACIÓN DEL CLIENTE Y VEHÍCULO ===
    // Cliente
    doc.setFillColor(...colors.primary)
    doc.rect(15, yPosition, 85, 8, "F")
    doc.setTextColor(...colors.white)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("DATOS DEL CLIENTE", 20, yPosition + 6)

    yPosition += 12
    doc.setTextColor(...colors.dark)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")

    if (usuarioData) {
        doc.text(`Nombre: ${usuarioData.nombre || "No disponible"}`, 20, yPosition)
        doc.text(`Email: ${usuarioData.email || "No disponible"}`, 20, yPosition + 4)
        doc.text(`ID Cliente: #${usuarioData.id}`, 20, yPosition + 8)

        // Nivel del usuario
        const nivelUsuario = usuarioData.nivelUsuario || "BRONCE"
        doc.setTextColor(...colors.accent)
        doc.setFont("helvetica", "bold")
        doc.text(`Nivel: ${nivelUsuario}`, 20, yPosition + 12)
    }

    // Vehículo
    doc.setFillColor(...colors.secondary)
    doc.rect(110, yPosition - 12, 85, 8, "F")
    doc.setTextColor(...colors.white)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("VEHÍCULO ALQUILADO", 115, yPosition - 6)

    doc.setTextColor(...colors.dark)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(`${vehiculoData.marca} ${vehiculoData.modelo}`, 115, yPosition)
    doc.text(`Matrícula: ${vehiculoData.matricula || "No disponible"}`, 115, yPosition + 4)
    doc.text(`Precio/día: €${vehiculoData.precio.toFixed(2)}`, 115, yPosition + 8)
    doc.text(`Estado: Confirmado`, 115, yPosition + 12)

    yPosition += 25

    // === DETALLES DEL ALQUILER ===
    doc.setFillColor(...colors.accent)
    doc.rect(15, yPosition, 180, 8, "F")
    doc.setTextColor(...colors.white)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("DETALLES DEL PERÍODO DE ALQUILER", 20, yPosition + 6)

    yPosition += 15

    // Calcular duración y precios
    const fechaInicio = parseDate(alquilerData.fechaInicio)
    const fechaFin = parseDate(alquilerData.fechaFin)
    const duracionMs = fechaFin - fechaInicio
    const duracionDias = Math.ceil(duracionMs / (1000 * 60 * 60 * 24))
    const subtotal = duracionDias * vehiculoData.precio

    // Calcular descuento según nivel
    const nivelUsuario = usuarioData?.nivelUsuario || "BRONCE"
    const descuentos = { BRONCE: 0, PLATA: 5, ORO: 10, DIAMANTE: 15 }
    const descuentoPorcentaje = descuentos[nivelUsuario] || 0
    const descuento = (subtotal * descuentoPorcentaje) / 100
    const total = subtotal - descuento

    // Tabla de detalles
    const tableData = [
        ["Fecha de inicio", formatDateTime(fechaInicio)],
        ["Fecha de finalización", formatDateTime(fechaFin)],
        ["Duración total", `${duracionDias} día${duracionDias !== 1 ? "s" : ""}`],
        ["Precio por día", `€${vehiculoData.precio.toFixed(2)}`],
        ["Subtotal", `€${subtotal.toFixed(2)}`],
    ]

    if (descuento > 0) {
        tableData.push([`Descuento ${nivelUsuario} (${descuentoPorcentaje}%)`, `-€${descuento.toFixed(2)}`])
    }

    tableData.push(["TOTAL FINAL", `€${total.toFixed(2)}`])

    doc.autoTable({
        startY: yPosition,
        body: tableData,
        theme: "grid",
        styles: {
            fontSize: 8,
            cellPadding: 2,
        },
        columnStyles: {
            0: { fontStyle: "bold", cellWidth: 55, fillColor: [248, 250, 252] },
            1: { cellWidth: 125 },
        },
        bodyStyles: (row, column, data) => {
            if (row === tableData.length - 1) {
                return {
                    fontStyle: "bold",
                    fillColor: colors.secondary,
                    textColor: colors.white,
                    fontSize: 9,
                }
            }
            if (tableData[row] && tableData[row][0].includes("Descuento")) {
                return {
                    textColor: colors.secondary,
                    fontStyle: "bold",
                }
            }
            return {}
        },
        margin: { left: 15, right: 15 },
    })

    yPosition = doc.lastAutoTable.finalY + 20

    // === INFORMACIÓN IMPORTANTE ===
    doc.setFillColor(254, 243, 199)
    doc.rect(15, yPosition, 180, 25, "F")
    doc.setDrawColor(...colors.accent)
    doc.setLineWidth(0.5)
    doc.rect(15, yPosition, 180, 25, "S")

    doc.setTextColor(...colors.accent)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("INFORMACIÓN IMPORTANTE", 105, yPosition + 6, { align: "center" })

    yPosition += 10
    doc.setTextColor(...colors.dark)
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")

    const infoTexts = [
        "• Presente este comprobante y documento de identidad válido al recoger el vehículo",
        "• El vehículo debe devolverse con el mismo nivel de combustible",
        "• Inspección obligatoria antes y después del alquiler",
        "• Cualquier daño será evaluado según nuestras políticas de empresa",
    ]

    infoTexts.forEach((text, index) => {
        doc.text(text, 20, yPosition + index * 3.5)
    })

    yPosition += 20

    // === CÓDIGO QR ===
    try {
        await addQRCode(doc, { id: alquilerData.id }, vehiculoData, 165, yPosition - 15)
    } catch (error) {
        console.warn("No se pudo generar el código QR:", error)
    }

    // === FOOTER PROFESIONAL ===
    yPosition = 240

    doc.setDrawColor(...colors.primary)
    doc.setLineWidth(0.5)
    doc.line(15, yPosition, 195, yPosition)

    yPosition += 5
    doc.setTextColor(...colors.primary)
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.text("RENTCAR - Soluciones Premium de Alquiler de Vehículos", 105, yPosition, { align: "center" })

    yPosition += 4
    doc.setFont("helvetica", "normal")
    doc.setFontSize(6)
    doc.text("Licencia de actividad: 2024/MAD/001 | Seguros: Mapfre Póliza 123456789", 105, yPosition, {
        align: "center",
    })

    yPosition += 3
    doc.text("© 2025 RentCar S.L. Todos los derechos reservados.", 105, yPosition, { align: "center" })

    // Mensaje de ahorro si aplica
    if (descuento > 0) {
        yPosition += 5
        doc.setTextColor(...colors.secondary)
        doc.setFontSize(7)
        doc.setFont("helvetica", "bold")
        doc.text(`¡ENHORABUENA! Has ahorrado €${descuento.toFixed(2)} gracias a tu nivel ${nivelUsuario}`, 105, yPosition, {
            align: "center",
        })
    }

    // Número de página y validación
    doc.setTextColor(...colors.dark)
    doc.setFontSize(6)
    doc.setFont("helvetica", "normal")
    doc.text("Documento válido y verificable", 195, 275, { align: "right" })
    doc.text(`ID: ALQ-${alquilerData.id}`, 15, 275)

    // Guardar el PDF
    const fileName = `RentCar-Comprobante-ALQ${alquilerData.id}-${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(fileName)

    return fileName
}

// Función para añadir código QR
async function addQRCode(doc, alquilerData, vehiculoData, x = 150, y = 110) {
    return new Promise((resolve, reject) => {
        try {
            // Crear URL para el código QR
            const qrData = `ALQUILER-${alquilerData.id}-${vehiculoData.matricula || "NOPLATE"}`
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`

            // Cargar la imagen del QR
            const img = new Image()
            img.crossOrigin = "Anonymous"
            img.onload = function () {
                // Añadir la imagen al PDF
                const imgWidth = 25
                const imgHeight = 25
                doc.addImage(this, "PNG", x, y, imgWidth, imgHeight)

                // Añadir texto debajo del QR
                doc.setFontSize(6)
                doc.setTextColor(80)
                doc.text("Código de verificación", x + imgWidth / 2, y + imgHeight + 3, { align: "center" })

                resolve()
            }
            img.onerror = () => {
                // Si hay error al cargar el QR, continuamos sin él
                console.warn("No se pudo cargar el código QR")
                resolve()
            }
            img.src = qrUrl
        } catch (error) {
            console.error("Error al generar el código QR:", error)
            resolve() // Resolvemos de todos modos para no bloquear la generación del PDF
        }
    })
}

// Función para parsear fechas mejorada
function parseDate(dateString) {
    if (!dateString) return new Date()

    try {
        // Si es un array de números [año, mes, día, hora, minuto, segundo]
        if (Array.isArray(dateString)) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = dateString
            return new Date(year, month - 1, day, hour, minute, second)
        }

        // Si es string
        if (typeof dateString === "string") {
            // Si contiene 'T', es formato ISO
            if (dateString.includes("T")) {
                return new Date(dateString)
            } else {
                // Si es formato YYYY-MM-DD, añadir tiempo para evitar problemas de zona horaria
                return new Date(dateString + "T00:00:00")
            }
        }

        // Si ya es Date
        return new Date(dateString)
    } catch (error) {
        console.error("Error al parsear fecha:", error)
        return new Date()
    }
}

// Función para formatear fecha y hora
function formatDateTime(date) {
    if (!(date instanceof Date) || isNaN(date)) return "Fecha no válida"

    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")

    return `${day}/${month}/${year}, ${hours}:${minutes}`
}

// Función para formatear solo fecha
function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) return "Fecha no válida"

    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
}

// Función para formatear fecha para nombre de archivo
function formatDateForFileName(date) {
    if (!(date instanceof Date) || isNaN(date)) return "unknown-date"

    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()

    return `${year}${month}${day}`
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
