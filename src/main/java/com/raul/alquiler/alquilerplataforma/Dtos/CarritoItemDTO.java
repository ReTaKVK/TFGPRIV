package com.raul.alquiler.alquilerplataforma.Dtos;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CarritoItemDTO {
    private Long id;
    private Long usuarioId;
    private Long vehiculoId;
    private String vehiculoMarca;
    private String vehiculoModelo;
    private double precioPorDia;
    private int dias;
    private double subtotal;
    // Añadimos estos campos para las fechas
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
}
