package com.raul.alquiler.alquilerplataforma.Services;

import com.raul.alquiler.alquilerplataforma.Dtos.UsuarioDTO;
import com.raul.alquiler.alquilerplataforma.Entidades.Usuario;
import com.raul.alquiler.alquilerplataforma.Mappers.UsuarioMapper;
import com.raul.alquiler.alquilerplataforma.Repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class UsuarioService {
    private final UsuarioRepository repo;
    private final UsuarioMapper mapper;
    private final PasswordEncoder passwordEncoder; // Inyecta el PasswordEncoder

    public UsuarioDTO registrar(UsuarioDTO dto) {
        System.out.println("DTO recibido en Servicio: " + dto); // Imprime el DTO en el servicio
        Usuario usuario = mapper.toEntidad(dto);
        usuario.setPassword(passwordEncoder.encode(dto.getPassword())); // Encripta la contraseña
        Usuario savedUsuario = repo.save(usuario);
        UsuarioDTO savedDto = mapper.toDTO(savedUsuario);
        System.out.println("Usuario guardado: " + savedDto);  // Imprime el usuario guardado
        return savedDto;
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
