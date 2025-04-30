package com.raul.alquiler.alquilerplataforma.Repository;

import com.raul.alquiler.alquilerplataforma.Entidades.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehiculoRepository extends JpaRepository<Vehiculo, Long> {
    List<Vehiculo> findByDisponibleTrue();
}
