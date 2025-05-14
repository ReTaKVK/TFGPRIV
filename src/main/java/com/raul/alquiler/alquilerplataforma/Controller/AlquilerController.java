package com.raul.alquiler.alquilerplataforma.Controller;

import com.raul.alquiler.alquilerplataforma.Dtos.AlquilerDTO;
import com.raul.alquiler.alquilerplataforma.Services.AlquilerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alquileres")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AlquilerController {
    private final AlquilerService service;

    @PostMapping("/crear")
    public AlquilerDTO alquilar(@RequestBody AlquilerDTO dto) {
        return service.alquilar(dto);
    }

    @GetMapping
    public List<AlquilerDTO> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<AlquilerDTO> listarPorUsuario(@PathVariable Long usuarioId) {
        return service.listarPorUsuario(usuarioId);
    }

    @GetMapping("/{id}")
    public AlquilerDTO obtenerPorId(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @PutMapping("/{id}")
    public AlquilerDTO actualizar(@PathVariable Long id, @RequestBody AlquilerDTO dto) {
        return service.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminar(@PathVariable Long id) {
        try {
            service.eliminar(id);
            return ResponseEntity.ok("Alquiler cancelado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<String> cancelar(@PathVariable Long id) {
        try {
            service.cancelarAlquiler(id);
            return ResponseEntity.ok("Alquiler cancelado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}