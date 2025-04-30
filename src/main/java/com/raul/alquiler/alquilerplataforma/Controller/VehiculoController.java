
package com.raul.alquiler.alquilerplataforma.Controller;

import com.raul.alquiler.alquilerplataforma.Dtos.VehiculoDTO;
import com.raul.alquiler.alquilerplataforma.Services.VehiculoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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
        System.out.println("Imagen recibida: " + dto.getImagen());
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


