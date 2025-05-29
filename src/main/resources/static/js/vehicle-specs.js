// Componente de especificaciones del vehículo animado
document.addEventListener("DOMContentLoaded", () => {
    // Verificar si el elemento existe en la página
    const vehiculoMatriculaElement = document.getElementById("vehiculo-matricula")

    if (vehiculoMatriculaElement) {
        // Obtener el elemento padre (p.card-text)
        const parentElement = vehiculoMatriculaElement.parentNode

        // Guardar la matrícula original
        const matriculaOriginal = vehiculoMatriculaElement.textContent

        // Crear el contenedor principal para las especificaciones
        const specsContainer = document.createElement("div")
        specsContainer.className = "vehicle-specs-dashboard"
        specsContainer.innerHTML = `
      <div class="specs-header">
        <div class="specs-title">
          <i class="bi bi-speedometer2 me-2"></i>
          Especificaciones Técnicas
        </div>
        <div class="specs-matricula">
          <span class="matricula-label">Matrícula:</span>
          <span class="matricula-value" id="matricula-value">${matriculaOriginal}</span>
        </div>
      </div>
      
      <div class="specs-grid">
        <div class="spec-item" data-aos="fade-up" data-aos-delay="100">
          <div class="spec-icon">
            <i class="bi bi-engine"></i>
          </div>
          <div class="spec-details">
            <div class="spec-value" id="spec-motor">
              <div class="counter-container">
                <span class="counter-value">2.0</span>
                <span class="counter-unit">L</span>
              </div>
            </div>
            <div class="spec-label">Motor</div>
            <div class="spec-bar">
              <div class="spec-progress" style="width: 75%"></div>
            </div>
          </div>
        </div>
        
        <div class="spec-item" data-aos="fade-up" data-aos-delay="200">
          <div class="spec-icon">
            <i class="bi bi-lightning-charge"></i>
          </div>
          <div class="spec-details">
            <div class="spec-value" id="spec-potencia">
              <div class="counter-container">
                <span class="counter-value">180</span>
                <span class="counter-unit">CV</span>
              </div>
            </div>
            <div class="spec-label">Potencia</div>
            <div class="spec-bar">
              <div class="spec-progress" style="width: 65%"></div>
            </div>
          </div>
        </div>
        
        <div class="spec-item" data-aos="fade-up" data-aos-delay="300">
          <div class="spec-icon">
            <i class="bi bi-gear"></i>
          </div>
          <div class="spec-details">
            <div class="spec-value" id="spec-cc">
              <div class="counter-container">
                <span class="counter-value">1998</span>
                <span class="counter-unit">CC</span>
              </div>
            </div>
            <div class="spec-label">Cilindrada</div>
            <div class="spec-bar">
              <div class="spec-progress" style="width: 70%"></div>
            </div>
          </div>
        </div>
        
        <div class="spec-item" data-aos="fade-up" data-aos-delay="400">
          <div class="spec-icon">
            <i class="bi bi-fuel-pump"></i>
          </div>
          <div class="spec-details">
            <div class="spec-value" id="spec-combustible">Gasolina</div>
            <div class="spec-label">Combustible</div>
            <div class="spec-bar">
              <div class="spec-progress" style="width: 60%"></div>
            </div>
          </div>
        </div>
        
        <div class="spec-item" data-aos="fade-up" data-aos-delay="500">
          <div class="spec-icon">
            <i class="bi bi-speedometer"></i>
          </div>
          <div class="spec-details">
            <div class="spec-value" id="spec-velocidad">
              <div class="counter-container">
                <span class="counter-value">220</span>
                <span class="counter-unit">km/h</span>
              </div>
            </div>
            <div class="spec-label">Velocidad Máx.</div>
            <div class="spec-bar">
              <div class="spec-progress" style="width: 80%"></div>
            </div>
          </div>
        </div>
        
        <div class="spec-item" data-aos="fade-up" data-aos-delay="600">
          <div class="spec-icon">
            <i class="bi bi-arrow-up-right"></i>
          </div>
          <div class="spec-details">
            <div class="spec-value" id="spec-aceleracion">
              <div class="counter-container">
                <span class="counter-value">7.5</span>
                <span class="counter-unit">s</span>
              </div>
            </div>
            <div class="spec-label">0-100 km/h</div>
            <div class="spec-bar">
              <div class="spec-progress" style="width: 75%"></div>
            </div>
          </div>
        </div>
        
        <div class="spec-item" data-aos="fade-up" data-aos-delay="700">
          <div class="spec-icon">
            <i class="bi bi-droplet"></i>
          </div>
          <div class="spec-details">
            <div class="spec-value" id="spec-consumo">
              <div class="counter-container">
                <span class="counter-value">6.5</span>
                <span class="counter-unit">L/100km</span>
              </div>
            </div>
            <div class="spec-label">Consumo</div>
            <div class="spec-bar">
              <div class="spec-progress" style="width: 55%"></div>
            </div>
          </div>
        </div>
        
        <div class="spec-item" data-aos="fade-up" data-aos-delay="800">
          <div class="spec-icon">
            <i class="bi bi-calendar3"></i>
          </div>
          <div class="spec-details">
            <div class="spec-value" id="spec-anio">
              <div class="counter-container">
                <span class="counter-value">2023</span>
              </div>
            </div>
            <div class="spec-label">Año</div>
            <div class="spec-bar">
              <div class="spec-progress" style="width: 90%"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="specs-footer">
        <div class="specs-gauge">
          <canvas id="gaugeCanvas" width="200" height="100"></canvas>
          <div class="gauge-label">Rendimiento</div>
        </div>
        <div class="specs-chart">
          <canvas id="performanceChart" width="300" height="150"></canvas>
        </div>
      </div>
    `

        // Insertar el contenedor después del párrafo de la matrícula
        // Primero ocultamos el párrafo original
        parentElement.style.display = "none"

        // Luego insertamos el panel de especificaciones después del párrafo
        parentElement.parentNode.insertBefore(specsContainer, parentElement.nextSibling)

        // Inicializar las animaciones de contador
        initCounters()

        // Inicializar el medidor
        initGauge()

        // Inicializar el gráfico de rendimiento
        initPerformanceChart()
    }
})

// Función para inicializar los contadores animados
function initCounters() {
    const counterElements = document.querySelectorAll(".counter-value")

    counterElements.forEach((counter) => {
        const target = Number.parseFloat(counter.textContent)
        const decimalPlaces = counter.textContent.includes(".") ? counter.textContent.split(".")[1].length : 0

        const duration = 2000 // 2 segundos
        const frameRate = 60
        const totalFrames = duration / (1000 / frameRate)

        let currentFrame = 0
        let currentValue = 0

        const animate = () => {
            currentFrame++
            const progress = currentFrame / totalFrames
            const easedProgress = easeOutQuart(progress)

            currentValue = easedProgress * target

            if (decimalPlaces > 0) {
                counter.textContent = currentValue.toFixed(decimalPlaces)
            } else {
                counter.textContent = Math.floor(currentValue)
            }

            if (currentFrame < totalFrames) {
                requestAnimationFrame(animate)
            }
        }

        // Iniciar la animación cuando el elemento sea visible
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animate()
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.1 },
        )

        observer.observe(counter)
    })
}

// Función de easing para animaciones más naturales
function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4)
}

// Función para inicializar el medidor
function initGauge() {
    const canvas = document.getElementById("gaugeCanvas")
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const centerX = canvas.width / 2
    const centerY = canvas.height
    const radius = canvas.height * 0.8

    // Dibujar el arco de fondo
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, 0, false)
    ctx.lineWidth = 10
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)"
    ctx.stroke()

    // Animar el arco de valor
    let currentAngle = Math.PI
    const targetAngle = Math.PI * 0.3 // 70% del arco (0.7 * Math.PI)
    const duration = 2000 // 2 segundos
    const startTime = performance.now()

    function animateGauge(currentTime) {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easeOutQuart(progress)

        currentAngle = Math.PI - (Math.PI - targetAngle) * easedProgress

        // Limpiar el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Dibujar el arco de fondo
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, Math.PI, 0, false)
        ctx.lineWidth = 10
        ctx.strokeStyle = "rgba(200, 200, 200, 0.3)"
        ctx.stroke()

        // Dibujar el arco de valor
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
        gradient.addColorStop(0, "#0a4da3")
        gradient.addColorStop(1, "#1e6fd0")

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, Math.PI, currentAngle, false)
        ctx.lineWidth = 10
        ctx.strokeStyle = gradient
        ctx.stroke()

        // Dibujar el valor
        ctx.font = "bold 24px var(--font-primary)"
        ctx.fillStyle = "#0a4da3"
        ctx.textAlign = "center"
        ctx.fillText(
            Math.round((1 - (currentAngle - targetAngle) / (Math.PI - targetAngle)) * 100) + "%",
            centerX,
            centerY - 20,
        )

        if (progress < 1) {
            requestAnimationFrame(animateGauge)
        }
    }

    // Iniciar la animación cuando el elemento sea visible
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(animateGauge)
                    observer.unobserve(entry.target)
                }
            })
        },
        { threshold: 0.1 },
    )

    observer.observe(canvas)
}

// Función para inicializar el gráfico de rendimiento
function initPerformanceChart() {
    const canvas = document.getElementById("performanceChart")
    if (!canvas) return

    const ctx = canvas.getContext("2d")

    // Datos para el gráfico
    const labels = ["Potencia", "Eficiencia", "Confort", "Seguridad", "Tecnología"]
    const data = [85, 70, 90, 95, 80]
    const maxValue = 100

    // Configuración del gráfico
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) * 0.8

    // Calcular los puntos del polígono
    const points = []
    const angles = []

    for (let i = 0; i < labels.length; i++) {
        const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2
        angles.push(angle)
        points.push({
            x: centerX + radius * Math.cos(angle) * (data[i] / maxValue),
            y: centerY + radius * Math.sin(angle) * (data[i] / maxValue),
        })
    }

    // Animar el gráfico
    let progress = 0
    const duration = 2000 // 2 segundos
    const startTime = performance.now()

    function animateChart(currentTime) {
        const elapsed = currentTime - startTime
        progress = Math.min(elapsed / duration, 1)
        const easedProgress = easeOutQuart(progress)

        // Limpiar el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Dibujar las líneas de fondo
        ctx.strokeStyle = "rgba(200, 200, 200, 0.3)"
        ctx.lineWidth = 1

        for (let i = 0; i < labels.length; i++) {
            const angle = angles[i]

            ctx.beginPath()
            ctx.moveTo(centerX, centerY)
            ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle))
            ctx.stroke()

            // Dibujar círculos concéntricos
            for (let j = 1; j <= 4; j++) {
                const radiusRatio = j / 4
                ctx.beginPath()
                ctx.arc(centerX, centerY, radius * radiusRatio, 0, Math.PI * 2)
                ctx.stroke()
            }
        }

        // Dibujar el polígono de datos
        ctx.beginPath()

        const currentPoints = []

        for (let i = 0; i < labels.length; i++) {
            const angle = angles[i]
            const currentRadius = radius * (data[i] / maxValue) * easedProgress

            const x = centerX + currentRadius * Math.cos(angle)
            const y = centerY + currentRadius * Math.sin(angle)

            currentPoints.push({ x, y })

            if (i === 0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
        }

        ctx.lineTo(currentPoints[0].x, currentPoints[0].y)
        ctx.closePath()

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, "rgba(10, 77, 163, 0.7)")
        gradient.addColorStop(1, "rgba(30, 111, 208, 0.7)")

        ctx.fillStyle = gradient
        ctx.fill()

        ctx.strokeStyle = "#0a4da3"
        ctx.lineWidth = 2
        ctx.stroke()

        // Dibujar los puntos
        for (const point of currentPoints) {
            ctx.beginPath()
            ctx.arc(point.x, point.y, 5, 0, Math.PI * 2)
            ctx.fillStyle = "#0a4da3"
            ctx.fill()
            ctx.strokeStyle = "#ffffff"
            ctx.lineWidth = 2
            ctx.stroke()
        }

        // Dibujar las etiquetas
        ctx.font = "12px var(--font-primary)"
        ctx.fillStyle = "#333333"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        for (let i = 0; i < labels.length; i++) {
            const angle = angles[i]
            const labelRadius = radius * 1.15

            const x = centerX + labelRadius * Math.cos(angle)
            const y = centerY + labelRadius * Math.sin(angle)

            ctx.fillText(labels[i], x, y)
        }

        if (progress < 1) {
            requestAnimationFrame(animateChart)
        }
    }

    // Iniciar la animación cuando el elemento sea visible
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(animateChart)
                    observer.unobserve(entry.target)
                }
            })
        },
        { threshold: 0.1 },
    )

    observer.observe(canvas)
}

// Actualizar los datos del vehículo cuando se cargue la información
document.addEventListener("vehicleDataLoaded", (e) => {
    const vehicleData = e.detail

    // Actualizar los datos específicos del vehículo si están disponibles
    if (vehicleData.motor) {
        const motorElement = document.querySelector("#spec-motor .counter-value")
        if (motorElement) {
            motorElement.textContent = vehicleData.motor
        }

        // Ajustar la unidad para motores eléctricos
        const unitElement = document.querySelector("#spec-motor .counter-unit")
        if (unitElement && vehicleData.motor === "Eléctrico") {
            unitElement.textContent = ""
        }
    }

    if (vehicleData.potencia) {
        const potenciaElement = document.querySelector("#spec-potencia .counter-value")
        if (potenciaElement) {
            potenciaElement.textContent = vehicleData.potencia
        }
    }

    if (vehicleData.cc) {
        const ccElement = document.querySelector("#spec-cc .counter-value")
        if (ccElement) {
            ccElement.textContent = vehicleData.cc
        }
    }

    if (vehicleData.combustible) {
        const combustibleElement = document.getElementById("spec-combustible")
        if (combustibleElement) {
            combustibleElement.textContent = vehicleData.combustible
        }
    }

    if (vehicleData.velocidadMax) {
        const velocidadElement = document.querySelector("#spec-velocidad .counter-value")
        if (velocidadElement) {
            velocidadElement.textContent = vehicleData.velocidadMax
        }
    }

    if (vehicleData.aceleracion) {
        const aceleracionElement = document.querySelector("#spec-aceleracion .counter-value")
        if (aceleracionElement) {
            aceleracionElement.textContent = vehicleData.aceleracion
        }
    }

    if (vehicleData.consumo) {
        const consumoElement = document.querySelector("#spec-consumo .counter-value")
        if (consumoElement) {
            consumoElement.textContent = vehicleData.consumo
        }

        // Ajustar la visualización para vehículos eléctricos
        if (vehicleData.combustible === "Eléctrico") {
            const consumoContainer = document.querySelector("#spec-consumo")
            if (consumoContainer) {
                const unitElement = document.querySelector("#spec-consumo .counter-unit")
                if (unitElement) {
                    unitElement.textContent = "kWh/100km"
                }
            }
        }
    }

    if (vehicleData.anio) {
        const anioElement = document.querySelector("#spec-anio .counter-value")
        if (anioElement) {
            anioElement.textContent = vehicleData.anio
        }
    }

    // Actualizar el gráfico de rendimiento con datos basados en las especificaciones
    updatePerformanceChart(vehicleData)

    // Reiniciar las animaciones
    initCounters()
    initGauge()
})

// Función para actualizar el gráfico de rendimiento basado en las especificaciones del vehículo
function updatePerformanceChart(vehicleData) {
    const canvas = document.getElementById("performanceChart")
    if (!canvas) return

    // Calcular valores de rendimiento basados en las especificaciones
    let potencia = 0
    let eficiencia = 0
    let confort = 0
    let seguridad = 0
    let tecnologia = 0

    // Potencia basada en CV
    if (vehicleData.potencia) {
        const cv = Number.parseInt(vehicleData.potencia)
        if (cv >= 300) potencia = 95
        else if (cv >= 200) potencia = 85
        else if (cv >= 150) potencia = 75
        else if (cv >= 100) potencia = 65
        else potencia = 55
    }

    // Eficiencia basada en consumo y tipo de combustible
    if (vehicleData.combustible === "Eléctrico") {
        eficiencia = 95
    } else if (vehicleData.combustible === "Híbrido") {
        eficiencia = 85
    } else {
        const consumo = Number.parseFloat(vehicleData.consumo || "8.0")
        if (consumo <= 4) eficiencia = 90
        else if (consumo <= 6) eficiencia = 80
        else if (consumo <= 8) eficiencia = 70
        else if (consumo <= 10) eficiencia = 60
        else eficiencia = 50
    }

    // Confort basado en marca y año
    const isLuxury = /mercedes|bmw|audi|lexus|porsche/i.test(vehicleData.marca)
    const anio = Number.parseInt(vehicleData.anio || "2020")

    if (isLuxury) {
        confort = 90
    } else if (anio >= 2022) {
        confort = 85
    } else if (anio >= 2020) {
        confort = 80
    } else if (anio >= 2018) {
        confort = 75
    } else {
        confort = 70
    }

    // Seguridad basada en año y marca
    if (anio >= 2022) {
        seguridad = isLuxury ? 95 : 90
    } else if (anio >= 2020) {
        seguridad = isLuxury ? 90 : 85
    } else if (anio >= 2018) {
        seguridad = isLuxury ? 85 : 80
    } else {
        seguridad = isLuxury ? 80 : 75
    }

    // Tecnología basada en tipo de combustible, año y marca
    if (vehicleData.combustible === "Eléctrico") {
        tecnologia = 95
    } else if (vehicleData.combustible === "Híbrido") {
        tecnologia = 90
    } else if (isLuxury && anio >= 2020) {
        tecnologia = 85
    } else if (isLuxury || anio >= 2022) {
        tecnologia = 80
    } else if (anio >= 2020) {
        tecnologia = 75
    } else {
        tecnologia = 70
    }

    // Actualizar el gráfico con estos valores
    const data = [potencia, eficiencia, confort, seguridad, tecnologia]

    // Guardar los datos para que el gráfico los use cuando se inicialice
    canvas.dataset.chartData = JSON.stringify(data)
}
