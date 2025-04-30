package com.raul.alquiler.alquilerplataforma.Services;

import com.raul.alquiler.alquilerplataforma.Dtos.UsuarioDTO;
import com.raul.alquiler.alquilerplataforma.Entidades.Usuario;
import com.raul.alquiler.alquilerplataforma.Mappers.UsuarioMapper;
import com.raul.alquiler.alquilerplataforma.Repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class UsuarioService {
    private final UsuarioRepository repo;
    private final UsuarioMapper mapper;

    public UsuarioDTO registrar(UsuarioDTO dto) {
        Usuario entidad = mapper.toEntidad(dto);
        return mapper.toDTO(repo.save(entidad));
    }

    public List<UsuarioDTO> listarTodos() {
        return repo.findAll().stream().map(mapper::toDTO).toList();
    }

    public UsuarioDTO obtener(Long id) {
        Usuario entidad = repo.findById(id).orElseThrow();
        return mapper.toDTO(entidad);
    }

    public UsuarioDTO actualizar(Long id, UsuarioDTO dto) {
        Usuario existente = repo.findById(id).orElseThrow();
        existente.setNombre(dto.getNombre());
        existente.setEmail(dto.getEmail());
        return mapper.toDTO(repo.save(existente));
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }
}
