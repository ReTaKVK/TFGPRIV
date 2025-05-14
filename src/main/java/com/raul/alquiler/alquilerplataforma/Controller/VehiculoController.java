package com.raul.alquiler.alquilerplataforma.Controller;

import com.raul.alquiler.alquilerplataforma.Dtos.VehiculoDTO;
import com.raul.alquiler.alquilerplataforma.Services.VehiculoService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/vehiculos")
@CrossOrigin(origins = "*")
public class VehiculoController {
    private final VehiculoService service;

    @GetMapping("/disponibles")
    public List<VehiculoDTO> disponibles() {
        return service.disponibles();
    }

    @GetMapping("/disponibles-en-fechas")
    public List<VehiculoDTO> disponiblesEnFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        return service.disponiblesEnFechas(fechaInicio, fechaFin);
    }

    @GetMapping("/{id}/disponibilidad")
    public boolean verificarDisponibilidad(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {
        return service.isDisponibleEnFechas(id, fechaInicio, fechaFin);
    }

    @GetMapping
    public List<VehiculoDTO> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public VehiculoDTO obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    public VehiculoDTO crear(@RequestBody VehiculoDTO dto) {
        return service.crear(dto);
    }

    @PutMapping("/{id}")
    public VehiculoDTO actualizar(@PathVariable Long id, @RequestBody VehiculoDTO dto) {
        return service.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}