package com.raul.alquiler.alquilerplataforma.Services;

import com.raul.alquiler.alquilerplataforma.Dtos.CarritoItemDTO;
import com.raul.alquiler.alquilerplataforma.Entidades.*;
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
    private final VehiculoService vehiculoService;

    // Agregar vehículo al carrito con fechas
    public void agregarAlCarrito(Long usuarioId, Long vehiculoId, int dias, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        Usuario usuario = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Vehiculo vehiculo = vehiculoRepo.findById(vehiculoId)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));

        // Verificar disponibilidad en las fechas seleccionadas
        if (!vehiculoService.isDisponibleEnFechas(vehiculoId, fechaInicio, fechaFin)) {
            throw new RuntimeException("El vehículo no está disponible en las fechas seleccionadas");
        }

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
        // Calcular fechas por defecto si no se proporcionan
        LocalDateTime fechaInicio = LocalDateTime.now();
        LocalDateTime fechaFin = fechaInicio.plusDays(dias);

        agregarAlCarrito(usuarioId, vehiculoId, dias, fechaInicio, fechaFin);
    }

    // Listar carrito como DTO
    public List<CarritoItemDTO> obtenerCarritoDTO(Long usuarioId) {
        Usuario usuario = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<CarritoItem> items = carritoRepo.findByUsuario(usuario);

        return items.stream()
                .map(carritoItemMapper::toDTO)
                .collect(Collectors.toList());
    }


    public NivelUsuario determinarNivelUsuario(int totalAlquileres) {
        if (totalAlquileres >= NivelUsuario.DIAMANTE.getDescuento()) {
            return NivelUsuario.DIAMANTE;
        } else if (totalAlquileres >= NivelUsuario.ORO.getDescuento()) {
            return NivelUsuario.ORO;
        } else if (totalAlquileres >= NivelUsuario.PLATA.getDescuento()) {
            return NivelUsuario.PLATA;
        } else {
            return NivelUsuario.BRONCE;
        }
    }
    // Calcular total del carrito
    public double calcularTotalCarrito(Long usuarioId) {
        Usuario usuario = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<CarritoItem> items = carritoRepo.findByUsuario(usuario);

        double totalSinDescuento = items.stream()
                .mapToDouble(item -> item.getVehiculo().getPrecio() * item.getDias())
                .sum();

        NivelUsuario nivel = determinarNivelUsuario(usuario.getTotalAlquileres());
        double descuento = nivel.getDescuento(); // Ej: 10%

        double totalConDescuento = totalSinDescuento * (1 - (descuento / 100.0));
        return totalConDescuento;
    }


    // Confirmar alquiler (crear alquileres y vaciar carrito)
    @Transactional
    public void confirmarAlquiler(Long usuarioId) {
        Usuario usuario = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<CarritoItem> items = carritoRepo.findByUsuario(usuario);

        for (CarritoItem item : items) {
            Vehiculo vehiculo = item.getVehiculo();

            // Usar las fechas almacenadas en el carrito
            LocalDateTime fechaInicio = item.getFechaInicio() != null ?
                    item.getFechaInicio() :
                    LocalDateTime.now();

            LocalDateTime fechaFin = item.getFechaFin() != null ?
                    item.getFechaFin() :
                    LocalDateTime.now().plusDays(item.getDias());

            // Verificar disponibilidad nuevamente antes de confirmar
            if (!vehiculoService.isDisponibleEnFechas(vehiculo.getId(), fechaInicio, fechaFin)) {
                throw new RuntimeException("El vehículo " + vehiculo.getMarca() + " " +
                        vehiculo.getModelo() + " ya no está disponible en las fechas seleccionadas");
            }

            Alquiler alquiler = Alquiler.builder()
                    .usuario(usuario)
                    .vehiculo(vehiculo)
                    .fechaInicio(fechaInicio)
                    .fechaFin(fechaFin)
                    .build();

            alquilerRepo.save(alquiler);

            // Ya no marcamos el vehículo como no disponible globalmente
            // Solo estará no disponible durante las fechas del alquiler
        }

        carritoRepo.deleteAll(items); // Vaciar el carrito
        usuario.setTotalAlquileres(usuario.getTotalAlquileres() + items.size());
        usuarioRepo.save(usuario);
    }


    // Nuevo método: Eliminar un item del carrito
    public void eliminarItem(Long itemId) {
        carritoRepo.deleteById(itemId);
    }
}