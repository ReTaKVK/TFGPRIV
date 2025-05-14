package com.raul.alquiler.alquilerplataforma.Services;

import com.raul.alquiler.alquilerplataforma.Dtos.VehiculoDTO;
import com.raul.alquiler.alquilerplataforma.Entidades.Alquiler;
import com.raul.alquiler.alquilerplataforma.Entidades.Vehiculo;
import com.raul.alquiler.alquilerplataforma.Mappers.VehiculoMapper;
import com.raul.alquiler.alquilerplataforma.Repository.AlquilerRepository;
import com.raul.alquiler.alquilerplataforma.Repository.VehiculoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@Service
public class VehiculoService {
    private final VehiculoRepository repo;
    private final AlquilerRepository alquilerRepo;
    private final VehiculoMapper mapper;

    // Listar todos los vehículos
    public List<VehiculoDTO> listarTodos() {
        return repo.findAll().stream().map(mapper::toDTO).toList();
    }

    // Obtener un vehículo por ID
    public VehiculoDTO obtener(Long id) {
        Vehiculo vehiculo = repo.findById(id).orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));
        return mapper.toDTO(vehiculo);
    }

    // Crear un nuevo vehículo
    public VehiculoDTO crear(VehiculoDTO dto) {
        Vehiculo entidad = mapper.toEntidad(dto);
        return mapper.toDTO(repo.save(entidad));
    }

    // Actualizar un vehículo existente
    public VehiculoDTO actualizar(Long id, VehiculoDTO dto) {
        Vehiculo existente = repo.findById(id).orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));
        existente.setMarca(dto.getMarca());
        existente.setModelo(dto.getModelo());
        existente.setDisponible(dto.isDisponible());
        existente.setPrecio(dto.getPrecio());
        existente.setLatitud(dto.getLatitud());
        existente.setLongitud(dto.getLongitud());
        existente.setMatricula(dto.getMatricula());
        existente.setImagen(dto.getImagen());
        return mapper.toDTO(repo.save(existente));
    }

    // Eliminar un vehículo
    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    // Obtener vehículos disponibles (ahora solo verifica el flag disponible)
    public List<VehiculoDTO> disponibles() {
        return repo.findByDisponibleTrue().stream().map(mapper::toDTO).toList();
    }

    // Nuevo método: Verificar si un vehículo está disponible en un rango de fechas
    public boolean isDisponibleEnFechas(Long vehiculoId, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        Vehiculo vehiculo = repo.findById(vehiculoId)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        // Si el vehículo está marcado como no disponible, retornar false
        if (!vehiculo.isDisponible()) {
            return false;
        }

        // Buscar alquileres que se solapen con el rango de fechas solicitado
        List<Alquiler> alquileres = alquilerRepo.findByVehiculoAndFechaFinAfterAndFechaInicioBefore(
                vehiculo, fechaInicio, fechaFin);

        // Si no hay alquileres que se solapen, el vehículo está disponible
        return alquileres.isEmpty();
    }

    // Nuevo método: Obtener vehículos disponibles en un rango de fechas
    public List<VehiculoDTO> disponiblesEnFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        List<Vehiculo> vehiculos = repo.findByDisponibleTrue();

        return vehiculos.stream()
                .filter(v -> isDisponibleEnFechas(v.getId(), fechaInicio, fechaFin))
                .map(mapper::toDTO)
                .toList();
    }
}