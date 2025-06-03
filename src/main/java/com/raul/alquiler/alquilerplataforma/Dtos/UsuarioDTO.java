package com.raul.alquiler.alquilerplataforma.Dtos;

import com.raul.alquiler.alquilerplataforma.Entidades.NivelUsuario;
import com.raul.alquiler.alquilerplataforma.Entidades.Rol;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioDTO {
    private Long id;
    private String nombre;
    private String email;
    private String password; // Solo se usa para alta; el mapper la ignora al devolver DTO
    private Rol rol;
    private Integer totalAlquileres;
    private NivelUsuario nivelUsuario;

}