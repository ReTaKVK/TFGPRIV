package com.raul.alquiler.alquilerplataforma.Dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlquilerDTO {
    private Long id;
    private Long usuarioId;
    private Long vehiculoId;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
}
