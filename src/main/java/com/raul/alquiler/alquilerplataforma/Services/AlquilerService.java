package com.raul.alquiler.alquilerplataforma.Services;

import com.raul.alquiler.alquilerplataforma.Dtos.AlquilerDTO;
import com.raul.alquiler.alquilerplataforma.Entidades.Alquiler;
import com.raul.alquiler.alquilerplataforma.Entidades.Usuario;
import com.raul.alquiler.alquilerplataforma.Entidades.Vehiculo;
import com.raul.alquiler.alquilerplataforma.Mappers.AlquilerMapper;
import com.raul.alquiler.alquilerplataforma.Repository.AlquilerRepository;
import com.raul.alquiler.alquilerplataforma.Repository.UsuarioRepository;
import com.raul.alquiler.alquilerplataforma.Repository.VehiculoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlquilerService {

    private final AlquilerRepository alquilerRepo;
    private final UsuarioRepository usuarioRepo;
    private final VehiculoRepository vehiculoRepo;
    private final AlquilerMapper alquilerMapper;

    public AlquilerDTO alquilar(AlquilerDTO dto) {
        // Obtener Usuario y Vehículo completos usando los ID de los DTOs
        Usuario usuario = usuarioRepo.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Vehiculo vehiculo = vehiculoRepo.findById(dto.getVehiculoId())
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        // Crear una nueva entidad de Alquiler
        Alquiler alquiler = new Alquiler();
        alquiler.setUsuario(usuario);
        alquiler.setVehiculo(vehiculo);
        alquiler.setFechaInicio(dto.getFechaInicio());
        alquiler.setFechaFin(dto.getFechaFin());

        // Guardar la entidad Alquiler
        Alquiler savedAlquiler = alquilerRepo.save(alquiler);

        // Mapear la entidad Alquiler a DTO y devolverlo
        return alquilerMapper.toDTO(savedAlquiler);
    }

    public AlquilerDTO obtenerPorId(Long id) {
        Alquiler alquiler = alquilerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Alquiler no encontrado"));
        return alquilerMapper.toDTO(alquiler);
    }

    public AlquilerDTO actualizar(Long id, AlquilerDTO dto) {
        Alquiler alquilerExistente = alquilerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Alquiler no encontrado"));

        // Obtener el Usuario y Vehículo con los ID de dto
        Usuario usuario = usuarioRepo.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Vehiculo vehiculo = vehiculoRepo.findById(dto.getVehiculoId())
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        alquilerExistente.setUsuario(usuario);
        alquilerExistente.setVehiculo(vehiculo);
        alquilerExistente.setFechaInicio(dto.getFechaInicio());
        alquilerExistente.setFechaFin(dto.getFechaFin());

        Alquiler updatedAlquiler = alquilerRepo.save(alquilerExistente);

        return alquilerMapper.toDTO(updatedAlquiler);
    }

    @Transactional
    public void eliminar(Long id) {
        // Eliminar el alquiler (esto libera automáticamente el vehículo para esas fechas)
        alquilerRepo.deleteById(id);
    }

    public List<AlquilerDTO> listarTodos() {
        return alquilerRepo.findAll().stream().map(alquilerMapper::toDTO).toList();
    }

    // Nuevo método: Listar alquileres de un usuario
    public List<AlquilerDTO> listarPorUsuario(Long usuarioId) {
        return alquilerRepo.findByUsuarioId(usuarioId).stream()
                .map(alquilerMapper::toDTO)
                .toList();
    }

    // Nuevo método: Cancelar un alquiler
    @Transactional
    public void cancelarAlquiler(Long alquilerId) {
        Alquiler alquiler = alquilerRepo.findById(alquilerId)
                .orElseThrow(() -> new RuntimeException("Alquiler no encontrado"));

        // Eliminar el alquiler
        alquilerRepo.delete(alquiler);
    }

    // Nuevo método: Verificar si hay alquileres activos para un vehículo
    public boolean tieneAlquileresActivos(Long vehiculoId) {
        Vehiculo vehiculo = vehiculoRepo.findById(vehiculoId)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        // Buscar alquileres activos (donde la fecha de fin es posterior a la fecha actual)
        List<Alquiler> alquileresActivos = alquilerRepo.findByVehiculoAndFechaFinAfterAndFechaInicioBefore(
                vehiculo, LocalDateTime.now(), LocalDateTime.now());

        return !alquileresActivos.isEmpty();
    }
}