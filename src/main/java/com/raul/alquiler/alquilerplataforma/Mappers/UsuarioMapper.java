package com.raul.alquiler.alquilerplataforma.Mappers;

import com.raul.alquiler.alquilerplataforma.Dtos.UsuarioDTO;
import com.raul.alquiler.alquilerplataforma.Entidades.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    /* Convertimos la entidad → DTO.  No exponemos la contraseña.
       MapStruct ignorará 'password' porque no hay fuente.
    */
    @Mapping(target = "password", ignore = true)
    UsuarioDTO toDTO(Usuario entidad);

    /* DTO → entidad.  "id" y "totalAlquileres" se gestionan dentro del servicio.
       Si password llega nula, no se sobreescribe.
    */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "totalAlquileres", ignore = true)
    Usuario toEntidad(UsuarioDTO dto);
}
