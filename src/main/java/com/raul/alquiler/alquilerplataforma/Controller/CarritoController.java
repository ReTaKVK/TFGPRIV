package com.raul.alquiler.alquilerplataforma.Controller;

import com.raul.alquiler.alquilerplataforma.Dtos.CarritoItemDTO;
import com.raul.alquiler.alquilerplataforma.Services.CarritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;


@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;

    @PostMapping("/agregar")
    public ResponseEntity<String> agregarAlCarrito(@RequestBody CarritoItemDTO carritoItemDTO) {
        try {
            // Extrae los valores del DTO recibido
            Long usuarioId = carritoItemDTO.getUsuarioId();
            Long vehiculoId = carritoItemDTO.getVehiculoId();
            int dias = carritoItemDTO.getDias();
            LocalDateTime fechaInicio = carritoItemDTO.getFechaInicio();
            LocalDateTime fechaFin = carritoItemDTO.getFechaFin();

            carritoService.agregarAlCarrito(usuarioId, vehiculoId, dias, fechaInicio, fechaFin);
            return ResponseEntity.ok("Vehículo agregado al carrito correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{usuarioId}")
    public List<CarritoItemDTO> obtenerCarrito(@PathVariable Long usuarioId) {
        return carritoService.obtenerCarritoDTO(usuarioId);
    }

    @GetMapping("/{usuarioId}/total")
    public double obtenerTotalCarrito(@PathVariable Long usuarioId) {
        return carritoService.calcularTotalCarrito(usuarioId);
    }

    @PostMapping("/confirmar/{usuarioId}")
    public ResponseEntity<String> confirmarAlquiler(@PathVariable Long usuarioId) {
        try {
            double totalConDescuento = carritoService.confirmarAlquiler(usuarioId);
            return ResponseEntity.ok("Alquiler confirmado correctamente. Total con descuento aplicado: " + totalConDescuento + " €");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<String> eliminarItem(@PathVariable Long itemId) {
        try {
            carritoService.eliminarItem(itemId);
            return ResponseEntity.ok("Item eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}