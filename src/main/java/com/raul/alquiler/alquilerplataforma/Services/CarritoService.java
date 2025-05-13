package com.raul.alquiler.alquilerplataforma.Services;

import com.raul.alquiler.alquilerplataforma.Dtos.CarritoItemDTO;
import com.raul.alquiler.alquilerplataforma.Entidades.Alquiler;
import com.raul.alquiler.alquilerplataforma.Entidades.CarritoItem;
import com.raul.alquiler.alquilerplataforma.Entidades.Usuario;
import com.raul.alquiler.alquilerplataforma.Entidades.Vehiculo;
import com.raul.alquiler.alquilerplataforma.Mappers.CarritoItemMapper;
import com.raul.alquiler.alquilerplataforma.Repository.AlquilerRepository;
import com.raul.alquiler.alquilerplataforma.Repository.CarritoItemRepository;
import com.raul.alquiler.alquilerplataforma.Repository.UsuarioRepository;
import com.raul.alquiler.alquilerplataforma.Repository.VehiculoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarritoService {

    private final CarritoItemRepository carritoRepo;
    private final UsuarioRepository usuarioRepo;
    private final VehiculoRepository vehiculoRepo;
    private final AlquilerRepository alquilerRepo;
    private final CarritoItemMapper carritoItemMapper;

    // ✅ Agregar vehículo al carrito
    public void agregarAlCarrito(Long usuarioId, Long vehiculoId, int dias, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        Usuario usuario = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Vehiculo vehiculo = vehiculoRepo.findById(vehiculoId)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        CarritoItem item = CarritoItem.builder()
                .usuario(usuario)
                .vehiculo(vehiculo)
                .dias(dias)
                .fechaInicio(fechaInicio)
                .fechaFin(fechaFin)
                .build();

        carritoRepo.save(item);
    }

    // Mantener el método original para compatibilidad
    public void agregarAlCarrito(Long usuarioId, Long vehiculoId, int dias) {
        agregarAlCarrito(usuarioId, vehiculoId, dias, null, null);
    }

    // ✅ Listar carrito como DTO
    public List<CarritoItemDTO> obtenerCarritoDTO(Long usuarioId) {
        Usuario usuario = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<CarritoItem> items = carritoRepo.findByUsuario(usuario);

        return items.stream()
                .map(carritoItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ✅ Calcular total del carrito
    public double calcularTotalCarrito(Long usuarioId) {
        Usuario usuario = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<CarritoItem> items = carritoRepo.findByUsuario(usuario);

        return items.stream()
                .mapToDouble(item -> item.getVehiculo().getPrecio() * item.getDias())
                .sum();
    }

    // ✅ Confirmar alquiler (crear alquileres y vaciar carrito)
    // ✅ Confirmar alquiler (crear alquileres y vaciar carrito)
    @Transactional
    public void confirmarAlquiler(Long usuarioId) {
        Usuario usuario = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<CarritoItem> items = carritoRepo.findByUsuario(usuario);

        for (CarritoItem item : items) {
            Vehiculo vehiculo = item.getVehiculo();

            // Usar las fechas almacenadas en el carrito en lugar de LocalDateTime.now()
            LocalDateTime fechaInicio = item.getFechaInicio() != null ?
                    item.getFechaInicio() :
                    LocalDateTime.now();

            LocalDateTime fechaFin = item.getFechaFin() != null ?
                    item.getFechaFin() :
                    LocalDateTime.now().plusDays(item.getDias());

            Alquiler alquiler = Alquiler.builder()
                    .usuario(usuario)
                    .vehiculo(vehiculo)
                    .fechaInicio(fechaInicio)
                    .fechaFin(fechaFin)
                    .build();

            alquilerRepo.save(alquiler);

            // Marcar vehículo como no disponible
            vehiculo.setDisponible(false);
            vehiculoRepo.save(vehiculo);
        }

        carritoRepo.deleteAll(items); // Vaciar el carrito
    }
}
