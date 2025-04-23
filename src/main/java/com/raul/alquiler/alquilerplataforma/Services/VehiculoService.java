package com.raul.alquiler.alquilerplataforma.Services;

import com.raul.alquiler.alquilerplataforma.Dtos.VehiculoDTO;
import com.raul.alquiler.alquilerplataforma.Entidades.Vehiculo;
import com.raul.alquiler.alquilerplataforma.Mappers.VehiculoMapper;
import com.raul.alquiler.alquilerplataforma.Repository.VehiculoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehiculoService {
    private final VehiculoRepository repo;
    private final VehiculoMapper mapper;

    public VehiculoService(VehiculoRepository repo, VehiculoMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    public List<VehiculoDTO> disponibles() {
        return repo.findByDisponibleTrue().stream().map(mapper::toDTO).toList();
    }
}

