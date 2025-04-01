document.addEventListener("DOMContentLoaded", function() {
    // Obtener los vehículos disponibles desde la API
    fetch("/api/vehiculos")
        .then(response => response.json())
        .then(vehiculos => {
            const vehiculosList = document.getElementById("vehiculos-list");

            // Mostrar los vehículos en la lista
            vehiculos.forEach(vehiculo => {
                const li = document.createElement("li");
                li.textContent = `${vehiculo.modelo} - ${vehiculo.estado}`;
                vehiculosList.appendChild(li);
            });
        })
        .catch(error => {
            console.error("Error al obtener los vehículos:", error);
        });
});
