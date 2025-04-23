package com.raul.alquiler.alquilerplataforma.Dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VehiculoDTO {
    private Long id;
    private String marca;
    private String modelo;
    private boolean disponible;
    private double precio;
    private double latitud;
    private double longitud;
}