package com.raul.alquiler.alquilerplataforma.Mappers;
import com.raul.alquiler.alquilerplataforma.Dtos.AlquilerDTO;
import com.raul.alquiler.alquilerplataforma.Entidades.Alquiler;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
@Mapper(componentModel = "spring", uses = {UsuarioMapper.class, VehiculoMapper.class})
public interface AlquilerMapper {

    @Mapping(source = "usuario.id", target = "usuarioId")
    @Mapping(source = "vehiculo.id", target = "vehiculoId")
    AlquilerDTO toDTO(Alquiler entidad);

    @Mapping(source = "usuarioId", target = "usuario.id")
    @Mapping(source = "vehiculoId", target = "vehiculo.id")
    Alquiler toEntidad(AlquilerDTO dto);
}