package com.raul.alquiler.alquilerplataforma.Dtos;

import com.raul.alquiler.alquilerplataforma.Entidades.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioDTO {
    private Long id;
    private String nombre;
    private String email;
    private Rol rol;
}
