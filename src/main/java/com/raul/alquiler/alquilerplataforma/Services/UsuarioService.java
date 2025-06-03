package com.raul.alquiler.alquilerplataforma.Services;

import com.raul.alquiler.alquilerplataforma.Dtos.UsuarioDTO;
import com.raul.alquiler.alquilerplataforma.Entidades.NivelUsuario;
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
    private final PasswordEncoder passwordEncoder;

    public UsuarioDTO registrar(UsuarioDTO dto) {
        repo.findByEmail(dto.getEmail())
                .ifPresent(u -> { throw new RuntimeException("El email ya está registrado"); });

        Usuario entidad = mapper.toEntidad(dto);
        entidad.setPassword(passwordEncoder.encode(dto.getPassword()));
        Usuario saved = repo.save(entidad);
        return toDTO(saved);
    }

    public List<UsuarioDTO> listarTodos() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    public UsuarioDTO obtener(Long id) {
        return toDTO(
                repo.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
        );
    }

    public UsuarioDTO actualizar(Long id, UsuarioDTO dto) {
        Usuario existente = repo.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        existente.setNombre(dto.getNombre());
        existente.setEmail(dto.getEmail());
        return toDTO(repo.save(existente));
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    public NivelUsuario determinarNivelUsuario(int totalAlquileres) {
        if (totalAlquileres >= NivelUsuario.DIAMANTE.getDescuento()) {
            return NivelUsuario.DIAMANTE;
        } else if (totalAlquileres >= NivelUsuario.ORO.getDescuento()) {
            return NivelUsuario.ORO;
        } else if (totalAlquileres >= NivelUsuario.PLATA.getDescuento()) {
            return NivelUsuario.PLATA;
        } else {
            return NivelUsuario.BRONCE;
        }
    }

    public UsuarioDTO toDTO(Usuario usuario) {
        UsuarioDTO dto = mapper.toDTO(usuario);
        dto.setNivelUsuario(determinarNivelUsuario(usuario.getTotalAlquileres()));
        return dto;
    }
}
