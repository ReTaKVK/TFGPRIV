package com.raul.alquiler.alquilerplataforma.Controller;

import com.raul.alquiler.alquilerplataforma.Dtos.AlquilerDTO;
import com.raul.alquiler.alquilerplataforma.Services.AlquilerService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alquileres")
@CrossOrigin(origins = "*")
public class AlquilerController {
    private final AlquilerService service;

    public AlquilerController(AlquilerService service) {
        this.service = service;
    }

    @PostMapping("/crear")
    public AlquilerDTO alquilar(@RequestBody AlquilerDTO dto) {
        return service.alquilar(dto);
    }
}