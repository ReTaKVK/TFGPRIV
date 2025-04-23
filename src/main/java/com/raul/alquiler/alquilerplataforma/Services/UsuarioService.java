package com.raul.alquiler.alquilerplataforma.Services;

import com.raul.alquiler.alquilerplataforma.Dtos.UsuarioDTO;
import com.raul.alquiler.alquilerplataforma.Entidades.Usuario;
import com.raul.alquiler.alquilerplataforma.Mappers.UsuarioMapper;
import com.raul.alquiler.alquilerplataforma.Repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {
    private final UsuarioRepository repo;
    private final UsuarioMapper mapper;

    public UsuarioService(UsuarioRepository repo, UsuarioMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    public UsuarioDTO registrar(UsuarioDTO dto) {
        Usuario entidad = mapper.toEntidad(dto);
        return mapper.toDTO(repo.save(entidad));
    }

    public List<UsuarioDTO> listarTodos() {
        return repo.findAll().stream().map(mapper::toDTO).toList();
    }
}
