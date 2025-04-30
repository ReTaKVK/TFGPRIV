package com.raul.alquiler.alquilerplataforma.Entidades;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "vehiculos")
public class Vehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String marca;
    private String modelo;
    private boolean disponible;
    @Column(name = "precio_por_dia")
    private double precio;

    // Coordenadas GPS
    private double latitud;
    private double longitud;

    // Matrícula del vehículo
    private String matricula;
    private String imagen;
}
