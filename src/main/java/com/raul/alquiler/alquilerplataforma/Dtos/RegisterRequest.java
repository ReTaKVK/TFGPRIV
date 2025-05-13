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
public class RegisterRequest {
    private String nombre;
    private String email;
    private String password;
    private Rol rol;
}