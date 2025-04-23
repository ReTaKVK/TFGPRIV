package com.raul.alquiler.alquilerplataforma.Mappers;

import com.raul.alquiler.alquilerplataforma.Dtos.AlquilerDTO;
import com.raul.alquiler.alquilerplataforma.Entidades.Alquiler;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AlquilerMapper {
    AlquilerDTO toDTO(Alquiler entidad);
    Alquiler toEntidad(AlquilerDTO dto);
}