package com.raul.alquiler.alquilerplataforma.Entidades;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "alquileres")
public class Alquiler {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuarios_id")
    private Usuario usuario;

    @ManyToOne(optional = false)
    @JoinColumn(name = "vehiculos_id")
    private Vehiculo vehiculo;

    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
}