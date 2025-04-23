
package com.raul.alquiler.alquilerplataforma.Controller;

import com.raul.alquiler.alquilerplataforma.Dtos.VehiculoDTO;
import com.raul.alquiler.alquilerplataforma.Entidades.Vehiculo;
import com.raul.alquiler.alquilerplataforma.Services.VehiculoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehiculos")
@CrossOrigin(origins = "*")
public class VehiculoController {
    private final VehiculoService service;

    public VehiculoController(VehiculoService service) {
        this.service = service;
    }

    @GetMapping("/disponibles")
    public List<VehiculoDTO> disponibles() {
        return service.disponibles();
    }
}


