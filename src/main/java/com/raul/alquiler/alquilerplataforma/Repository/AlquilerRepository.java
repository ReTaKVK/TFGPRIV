package com.raul.alquiler.alquilerplataforma.Repository;

import com.raul.alquiler.alquilerplataforma.Entidades.Alquiler;
import com.raul.alquiler.alquilerplataforma.Entidades.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlquilerRepository extends JpaRepository<Alquiler, Long> {
    // Buscar alquileres por vehículo
    List<Alquiler> findByVehiculo(Vehiculo vehiculo);

    // Buscar alquileres activos para un vehículo en un rango de fechas
    // Encuentra alquileres donde:
    // - La fecha de fin es posterior a la fecha de inicio solicitada Y
    // - La fecha de inicio es anterior a la fecha de fin solicitada
    List<Alquiler> findByVehiculoAndFechaFinAfterAndFechaInicioBefore(
            Vehiculo vehiculo, LocalDateTime fechaInicio, LocalDateTime fechaFin);

    // Buscar alquileres por usuario
    List<Alquiler> findByUsuarioId(Long usuarioId);

    // Buscar alquileres activos (donde la fecha de fin es posterior a la fecha actual)
    List<Alquiler> findByFechaFinAfter(LocalDateTime fecha);
}
