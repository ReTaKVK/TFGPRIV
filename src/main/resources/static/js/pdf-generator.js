/**
 * Generador de tickets PDF para RentCar
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
    // Crear un nuevo documento PDF
    const { jsPDF } = window.jspdf
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    })

    // Configurar fuentes
    doc.setFont("helvetica", "normal")

    // Añadir logo y encabezado
    addHeader(doc)

    // Añadir información del ticket
    addTicketInfo(doc, alquilerData)

    // Añadir información del cliente
    addClientInfo(doc, usuarioData)

    // Añadir detalles del vehículo
    addVehicleDetails(doc, vehiculoData)

    // Añadir detalles del alquiler
    addRentalDetails(doc, alquilerData, vehiculoData)

    // Añadir términos y condiciones
    addTermsAndConditions(doc)

    // Añadir pie de página
    addFooter(doc)

    // Añadir código QR
    await addQRCode(doc, alquilerData, vehiculoData)

    // Guardar el PDF con un nombre específico
    const fileName = `RentCar_Reserva_${alquilerData.id}_${formatDateForFileName(new Date())}.pdf`
    doc.save(fileName)

    return fileName
}

// Función para añadir el encabezado con logo
function addHeader(doc) {
    // Título principal
    doc.setFontSize(22)
    doc.setTextColor(10, 77, 163) // Color azul corporativo
    doc.text("RentCar", 105, 20, { align: "center" })

    // Subtítulo
    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text("Comprobante de Alquiler", 105, 27, { align: "center" })

    // Línea separadora
    doc.setDrawColor(10, 77, 163)
    doc.setLineWidth(0.5)
    doc.line(20, 32, 190, 32)

    // Información de la empresa
    doc.setFontSize(9)
    doc.setTextColor(80)
    doc.text("RentCar S.L. - CIF: B12345678", 20, 38)
    doc.text("Calle Principal 123, 28001 Madrid", 20, 43)
    doc.text("Tel: (+34) 123 456 789 - Email: info@rentcar.com", 20, 48)
    doc.text("www.rentcar.com", 20, 53)
}

// Función para añadir información del ticket
function addTicketInfo(doc, alquilerData) {
    // Recuadro para información del ticket
    doc.setDrawColor(200)
    doc.setFillColor(245, 245, 245)
    doc.rect(130, 38, 60, 25, "F")
    doc.setDrawColor(10, 77, 163)
    doc.rect(130, 38, 60, 25, "S")

    // Información del ticket
    doc.setFontSize(10)
    doc.setTextColor(10, 77, 163)
    doc.text("COMPROBANTE Nº:", 133, 45)
    doc.setFontSize(11)
    doc.setTextColor(0)
    doc.text(`ALQ-${alquilerData.id}`, 175, 45, { align: "right" })

    doc.setFontSize(10)
    doc.setTextColor(10, 77, 163)
    doc.text("FECHA:", 133, 52)
    doc.setFontSize(11)
    doc.setTextColor(0)
    doc.text(formatDate(new Date()), 175, 52, { align: "right" })

    doc.setFontSize(10)
    doc.setTextColor(10, 77, 163)
    doc.text("ESTADO:", 133, 59)
    doc.setFontSize(11)
    doc.setTextColor(0, 150, 0)
    doc.text("CONFIRMADO", 175, 59, { align: "right" })
}

// Función para añadir información del cliente
function addClientInfo(doc, usuarioData) {
    doc.setFontSize(12)
    doc.setTextColor(10, 77, 163)
    doc.text("DATOS DEL CLIENTE", 20, 70)

    doc.setDrawColor(10, 77, 163)
    doc.setLineWidth(0.2)
    doc.line(20, 72, 80, 72)

    doc.setFontSize(10)
    doc.setTextColor(0)

    // Si tenemos datos del usuario, los mostramos
    if (usuarioData) {
        doc.text(`Nombre: ${usuarioData.nombre || "No disponible"}`, 20, 80)
        doc.text(`Email: ${usuarioData.email || "No disponible"}`, 20, 86)
        doc.text(`ID Cliente: ${usuarioData.id}`, 20, 92)
    } else {
        // Si no tenemos datos del usuario, intentamos obtenerlos del localStorage
        const userName = localStorage.getItem("userName") || "No disponible"
        const userEmail = localStorage.getItem("userEmail") || "No disponible"
        const userId = obtenerUsuarioId() || "No disponible"

        doc.text(`Nombre: ${userName}`, 20, 80)
        doc.text(`Email: ${userEmail}`, 20, 86)
        doc.text(`ID Cliente: ${userId}`, 20, 92)
    }
}

// Función para añadir detalles del vehículo
function addVehicleDetails(doc, vehiculoData) {
    doc.setFontSize(12)
    doc.setTextColor(10, 77, 163)
    doc.text("DETALLES DEL VEHÍCULO", 20, 110)

    doc.setDrawColor(10, 77, 163)
    doc.setLineWidth(0.2)
    doc.line(20, 112, 100, 112)

    // Crear tabla con detalles del vehículo
    const vehicleData = [
        ["Marca", vehiculoData.marca],
        ["Modelo", vehiculoData.modelo],
        ["Matrícula", vehiculoData.matricula || "No disponible"],
        ["Precio por día", `€${vehiculoData.precio.toFixed(2)}`],
    ]

    doc.autoTable({
        startY: 118,
        head: [["Característica", "Valor"]],
        body: vehicleData,
        theme: "grid",
        headStyles: {
            fillColor: [10, 77, 163],
            textColor: [255, 255, 255],
            fontStyle: "bold",
        },
        styles: {
            fontSize: 10,
            cellPadding: 3,
        },
        columnStyles: {
            0: { fontStyle: "bold", cellWidth: 40 },
            1: { cellWidth: 60 },
        },
        margin: { left: 20 },
    })
}

// Función para añadir detalles del alquiler
function addRentalDetails(doc, alquilerData, vehiculoData) {
    const finalY = doc.lastAutoTable.finalY + 15

    doc.setFontSize(12)
    doc.setTextColor(10, 77, 163)
    doc.text("DETALLES DEL ALQUILER", 20, finalY)

    doc.setDrawColor(10, 77, 163)
    doc.setLineWidth(0.2)
    doc.line(20, finalY + 2, 100, finalY + 2)

    // Calcular duración y precio total
    const fechaInicio = new Date(alquilerData.fechaInicio)
    const fechaFin = new Date(alquilerData.fechaFin)
    const duracionMs = fechaFin - fechaInicio
    const duracionDias = Math.ceil(duracionMs / (1000 * 60 * 60 * 24))
    const precioTotal = duracionDias * vehiculoData.precio

    // Crear tabla con detalles del alquiler
    const rentalData = [
        ["Fecha de inicio", formatDateTime(fechaInicio)],
        ["Fecha de fin", formatDateTime(fechaFin)],
        ["Duración", `${duracionDias} día${duracionDias !== 1 ? "s" : ""}`],
        ["Precio por día", `€${vehiculoData.precio.toFixed(2)}`],
        ["PRECIO TOTAL", `€${precioTotal.toFixed(2)}`],
    ]

    doc.autoTable({
        startY: finalY + 8,
        body: rentalData,
        theme: "grid",
        styles: {
            fontSize: 10,
            cellPadding: 3,
        },
        columnStyles: {
            0: { fontStyle: "bold", cellWidth: 40 },
            1: { cellWidth: 60 },
        },
        margin: { left: 20 },
        bodyStyles: (row, column, data) => {
            if (row === rentalData.length - 1) {
                return {
                    fontStyle: "bold",
                    fillColor: [240, 240, 240],
                    textColor: [10, 77, 163],
                }
            }
            return {}
        },
    })
}

// Función para añadir términos y condiciones
function addTermsAndConditions(doc) {
    const finalY = doc.lastAutoTable.finalY + 15

    doc.setFontSize(10)
    doc.setTextColor(10, 77, 163)
    doc.text("TÉRMINOS Y CONDICIONES", 105, finalY, { align: "center" })

    doc.setDrawColor(10, 77, 163)
    doc.setLineWidth(0.2)
    doc.line(65, finalY + 2, 145, finalY + 2)

    doc.setFontSize(8)
    doc.setTextColor(80)

    const terms = [
        "1. Es necesario presentar este comprobante junto con una identificación válida para recoger el vehículo.",
        "2. El vehículo debe ser devuelto con el tanque de combustible lleno.",
        "3. Se aplicarán cargos adicionales por devolución tardía.",
        "4. El cliente es responsable de cualquier daño causado al vehículo durante el período de alquiler.",
        "5. Para más información, consulte nuestros términos y condiciones completos en www.rentcar.com/terminos.",
    ]

    let y = finalY + 8
    terms.forEach((term) => {
        doc.text(term, 20, y)
        y += 5
    })
}

// Función para añadir pie de página
function addFooter(doc) {
    const pageCount = doc.internal.getNumberOfPages()

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)

        // Línea separadora
        doc.setDrawColor(10, 77, 163)
        doc.setLineWidth(0.5)
        doc.line(20, 280, 190, 280)

        // Texto del pie de página
        doc.setFontSize(8)
        doc.setTextColor(100)
        doc.text("© 2025 RentCar. Todos los derechos reservados.", 105, 287, { align: "center" })

        // Número de página
        doc.text(`Página ${i} de ${pageCount}`, 190, 287, { align: "right" })
    }
}

// Función para añadir código QR
async function addQRCode(doc, alquilerData, vehiculoData) {
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
                const imgWidth = 40
                const imgHeight = 40
                doc.addImage(this, "PNG", 150, 110, imgWidth, imgHeight)

                // Añadir texto debajo del QR
                doc.setFontSize(8)
                doc.setTextColor(80)
                doc.text("Muestra este código en nuestra oficina", 150 + imgWidth / 2, 110 + imgHeight + 5, { align: "center" })

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
