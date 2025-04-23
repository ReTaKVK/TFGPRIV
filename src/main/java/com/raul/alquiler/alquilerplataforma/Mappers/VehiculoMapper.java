package com.raul.alquiler.alquilerplataforma.Mappers;

import com.raul.alquiler.alquilerplataforma.Dtos.VehiculoDTO;
import com.raul.alquiler.alquilerplataforma.Entidades.Vehiculo;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface VehiculoMapper {
    VehiculoDTO toDTO(Vehiculo entidad);
    Vehiculo toEntidad(VehiculoDTO dto);
}
