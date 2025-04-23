package com.raul.alquiler.alquilerplataforma.Services;

import com.raul.alquiler.alquilerplataforma.Dtos.AlquilerDTO;
import com.raul.alquiler.alquilerplataforma.Entidades.Alquiler;
import com.raul.alquiler.alquilerplataforma.Entidades.Usuario;
import com.raul.alquiler.alquilerplataforma.Entidades.Vehiculo;
import com.raul.alquiler.alquilerplataforma.Mappers.AlquilerMapper;
import com.raul.alquiler.alquilerplataforma.Repository.AlquilerRepository;
import com.raul.alquiler.alquilerplataforma.Repository.UsuarioRepository;
import com.raul.alquiler.alquilerplataforma.Repository.VehiculoRepository;
import org.springframework.stereotype.Service;

@Service
public class AlquilerService {
    private final AlquilerRepository repo;
    private final AlquilerMapper mapper;
    private final UsuarioRepository usuarioRepo;
    private final VehiculoRepository vehiculoRepo;

    public AlquilerService(AlquilerRepository repo, AlquilerMapper mapper, UsuarioRepository usuarioRepo, VehiculoRepository vehiculoRepo) {
        this.repo = repo;
        this.mapper = mapper;
        this.usuarioRepo = usuarioRepo;
        this.vehiculoRepo = vehiculoRepo;
    }

    public AlquilerDTO alquilar(AlquilerDTO dto) {
        Usuario usuario = usuarioRepo.findById(dto.getUsuarioId()).orElseThrow();
        Vehiculo vehiculo = vehiculoRepo.findById(dto.getVehiculoId()).orElseThrow();
        vehiculo.setDisponible(false);
        vehiculoRepo.save(vehiculo);

        Alquiler entidad = new Alquiler();
        entidad.setUsuario(usuario);
        entidad.setVehiculo(vehiculo);
        entidad.setFechaInicio(dto.getFechaInicio());
        entidad.setFechaFin(dto.getFechaFin());

        return mapper.toDTO(repo.save(entidad));
    }
}