// Theme Toggle Functionality
document.addEventListener("DOMContentLoaded", () => {
    // Get theme preferences from localStorage
    const darkMode = localStorage.getItem("darkMode") === "true"
    const colorblindMode = localStorage.getItem("colorblindMode") === "true"

    // Apply saved preferences
    if (darkMode) {
        document.getElementById("dark-mode-styles").removeAttribute("disabled")
        updateThemeToggleText(true)
    }

    if (colorblindMode) {
        document.getElementById("colorblind-styles").removeAttribute("disabled")
        updateColorblindToggleText(true)
    }

    // Theme toggle button
    const themeToggle = document.getElementById("theme-toggle")
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const darkModeStylesheet = document.getElementById("dark-mode-styles")
            const isDarkMode = darkModeStylesheet.hasAttribute("disabled")

            if (isDarkMode) {
                darkModeStylesheet.removeAttribute("disabled")
                localStorage.setItem("darkMode", "true")
            } else {
                darkModeStylesheet.setAttribute("disabled", "")
                localStorage.setItem("darkMode", "false")
            }

            updateThemeToggleText(isDarkMode)
        })
    }

    // Colorblind toggle button
    const colorblindToggle = document.getElementById("colorblind-toggle")
    if (colorblindToggle) {
        colorblindToggle.addEventListener("click", () => {
            const colorblindStylesheet = document.getElementById("colorblind-styles")
            const isColorblindMode = colorblindStylesheet.hasAttribute("disabled")

            if (isColorblindMode) {
                colorblindStylesheet.removeAttribute("disabled")
                localStorage.setItem("colorblindMode", "true")
            } else {
                colorblindStylesheet.setAttribute("disabled", "")
                localStorage.setItem("colorblindMode", "false")
            }

            updateColorblindToggleText(isColorblindMode)
        })
    }

    // Update toggle button text
    function updateThemeToggleText(isDarkMode) {
        const themeToggle = document.getElementById("theme-toggle")
        if (themeToggle) {
            if (isDarkMode) {
                themeToggle.innerHTML = '<i class="bi bi-sun me-2"></i>Modo Claro'
            } else {
                themeToggle.innerHTML = '<i class="bi bi-moon me-2"></i>Modo Oscuro'
            }
        }
    }

    function updateColorblindToggleText(isColorblindMode) {
        const colorblindToggle = document.getElementById("colorblind-toggle")
        if (colorblindToggle) {
            if (isColorblindMode) {
                colorblindToggle.innerHTML = '<i class="bi bi-eye-slash me-2"></i>Modo Normal'
            } else {
                colorblindToggle.innerHTML = '<i class="bi bi-eye me-2"></i>Modo Daltónico'
            }
        }
    }
})
