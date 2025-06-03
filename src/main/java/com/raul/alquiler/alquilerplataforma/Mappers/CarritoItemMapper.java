package com.raul.alquiler.alquilerplataforma.Mappers;

import com.raul.alquiler.alquilerplataforma.Dtos.CarritoItemDTO;
import com.raul.alquiler.alquilerplataforma.Entidades.CarritoItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface CarritoItemMapper {

    @Mappings({
            @Mapping(source = "id", target = "id"),
            @Mapping(source = "usuario.id", target = "usuarioId"),
            @Mapping(source = "vehiculo.id", target = "vehiculoId"),
            @Mapping(source = "vehiculo.marca", target = "vehiculoMarca"),
            @Mapping(source = "vehiculo.modelo", target = "vehiculoModelo"),
            @Mapping(source = "vehiculo.matricula", target = "vehiculoMatricula"),
            @Mapping(source = "vehiculo.imagen", target = "vehiculoImagen"),
            @Mapping(source = "vehiculo.precio", target = "precioPorDia"),
            @Mapping(source = "dias", target = "dias"),
            @Mapping(expression = "java(item.getDias() * item.getVehiculo().getPrecio())", target = "subtotal"),
            @Mapping(source = "fechaInicio", target = "fechaInicio"),
            @Mapping(source = "fechaFin", target = "fechaFin")
    })
    CarritoItemDTO toDTO(CarritoItem item);
}
