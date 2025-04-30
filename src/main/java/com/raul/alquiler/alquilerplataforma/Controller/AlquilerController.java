package com.raul.alquiler.alquilerplataforma.Controller;

import com.raul.alquiler.alquilerplataforma.Dtos.AlquilerDTO;
import com.raul.alquiler.alquilerplataforma.Services.AlquilerService;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/alquileres")
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

    @GetMapping("/{id}")
    public AlquilerDTO obtenerPorId(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @PutMapping("/{id}")
    public AlquilerDTO actualizar(@PathVariable Long id, @RequestBody AlquilerDTO dto) {
        return service.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}