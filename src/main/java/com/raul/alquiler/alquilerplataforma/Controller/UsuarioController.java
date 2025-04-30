package com.raul.alquiler.alquilerplataforma.Controller;

import com.raul.alquiler.alquilerplataforma.Dtos.UsuarioDTO;
import com.raul.alquiler.alquilerplataforma.Services.UsuarioService;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {
    private final UsuarioService service;

    @PostMapping("/registrar")
    public UsuarioDTO registrar(@RequestBody UsuarioDTO dto) {
        return service.registrar(dto);
    }

    @GetMapping
    public List<UsuarioDTO> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public UsuarioDTO obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PutMapping("/{id}")
    public UsuarioDTO actualizar(@PathVariable Long id, @RequestBody UsuarioDTO dto) {
        return service.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}