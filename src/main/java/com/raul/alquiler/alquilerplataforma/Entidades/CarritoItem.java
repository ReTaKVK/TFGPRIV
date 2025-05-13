package com.raul.alquiler.alquilerplataforma.Entidades;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "carrito_items")
public class CarritoItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "vehiculo_id")
    private Vehiculo vehiculo;

    private int dias;

    // Añadimos estos campos para almacenar las fechas seleccionadas
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
}
