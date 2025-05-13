package com.raul.alquiler.alquilerplataforma.Controller;

import com.raul.alquiler.alquilerplataforma.Dtos.CarritoItemDTO;
import com.raul.alquiler.alquilerplataforma.Services.CarritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;


@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;

    @PostMapping("/agregar")
    public void agregarAlCarrito(@RequestBody CarritoItemDTO carritoItemDTO) {
        // Extrae los valores del DTO recibido
        Long usuarioId = carritoItemDTO.getUsuarioId();
        Long vehiculoId = carritoItemDTO.getVehiculoId();
        int dias = carritoItemDTO.getDias();
        LocalDateTime fechaInicio = carritoItemDTO.getFechaInicio();
        LocalDateTime fechaFin = carritoItemDTO.getFechaFin();

        carritoService.agregarAlCarrito(usuarioId, vehiculoId, dias, fechaInicio, fechaFin);
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
    public void confirmarAlquiler(@PathVariable Long usuarioId) {
        carritoService.confirmarAlquiler(usuarioId);
    }
}
