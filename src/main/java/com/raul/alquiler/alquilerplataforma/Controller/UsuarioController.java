package com.raul.alquiler.alquilerplataforma.Controller;

import com.raul.alquiler.alquilerplataforma.Dtos.UsuarioDTO;
import com.raul.alquiler.alquilerplataforma.Services.UsuarioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {
    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping("/registrar")
    public UsuarioDTO registrar(@RequestBody UsuarioDTO dto) {
        return service.registrar(dto);
    }

    @GetMapping
    public List<UsuarioDTO> listar() {
        return service.listarTodos();
    }
}