document.addEventListener('DOMContentLoaded', () => {
    cargarVehiculos();
    cargarAlquileres();  // Llamamos a la nueva función para cargar los alquileres
});

function cargarVehiculos() {
    fetch('http://localhost:8080/api/vehiculos') // Cambia la URL si tienes otra ruta
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los vehículos');
            }
            return response.json();
        })
        .then(data => {
            const container = document.getElementById('vehiculos-container');
            container.innerHTML = '';

            data.forEach(vehiculo => {
                const card = document.createElement('div');
                card.className = 'card';

                card.innerHTML = `
                    <img src="${vehiculo.imagen}" alt="Imagen de ${vehiculo.marca} ${vehiculo.modelo}" style="width:100%; max-height:200px; object-fit:cover; border-radius:8px;">
                    <h2>${vehiculo.marca} ${vehiculo.modelo}</h2>
                    <p><strong>Precio:</strong> ${vehiculo.precio} €/día</p>
                    <p><strong>Matrícula:</strong> ${vehiculo.matricula || 'No disponible'}</p>
                `;

                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function cargarAlquileres() {
    fetch('http://localhost:8080/api/alquileres')
        .then(res => res.json())
        .then(async alquileres => {
            const container = document.getElementById('alquileres-container');
            container.innerHTML = '';

            for (const alquiler of alquileres) {
                // Evita los alquileres vacíos
                if (!alquiler.usuarioId || !alquiler.vehiculoId) continue;

                // Obtener datos del usuario
                const usuarioResp = await fetch(`http://localhost:8080/api/usuarios/${alquiler.usuarioId}`);
                const usuario = await usuarioResp.json();

                // Obtener datos del vehículo
                const vehiculoResp = await fetch(`http://localhost:8080/api/vehiculos/${alquiler.vehiculoId}`);
                const vehiculo = await vehiculoResp.json();

                const card = document.createElement('div');
                card.className = 'card';

                card.innerHTML = `
                    <h2>Alquiler de vehículo ${vehiculo.marca} ${vehiculo.modelo}</h2>
                    <p><strong>Usuario:</strong> ${usuario.nombre}</p>
                    <p><strong>Fecha de inicio:</strong> ${new Date(alquiler.fechaInicio).toLocaleDateString()}</p>
                    <p><strong>Fecha de fin:</strong> ${new Date(alquiler.fechaFin).toLocaleDateString()}</p>
                `;

                container.appendChild(card);
            }
        })
        .catch(err => console.error('Error cargando alquileres:', error));
}
