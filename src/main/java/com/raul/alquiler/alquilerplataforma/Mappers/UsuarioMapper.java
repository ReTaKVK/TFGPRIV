package com.raul.alquiler.alquilerplataforma.Mappers;

import com.raul.alquiler.alquilerplataforma.Dtos.UsuarioDTO;
import com.raul.alquiler.alquilerplataforma.Entidades.Usuario;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {
    UsuarioDTO toDTO(Usuario entidad);
    Usuario toEntidad(UsuarioDTO dto);
}
