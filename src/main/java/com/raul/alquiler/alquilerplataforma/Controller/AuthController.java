package com.raul.alquiler.alquilerplataforma.Controller;

import com.raul.alquiler.alquilerplataforma.Dtos.AuthenticationRequest;
import com.raul.alquiler.alquilerplataforma.Dtos.AuthenticationResponse;
import com.raul.alquiler.alquilerplataforma.Dtos.UsuarioDTO;
import com.raul.alquiler.alquilerplataforma.Entidades.Usuario;
import com.raul.alquiler.alquilerplataforma.Repository.UsuarioRepository;
import com.raul.alquiler.alquilerplataforma.Services.JwtService;
import com.raul.alquiler.alquilerplataforma.Services.UsuarioService;
import com.raul.alquiler.alquilerplataforma.Services.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtService jwtService;
    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());

            Usuario usuario = usuarioRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("rol", usuario.getRol().name()); // Agrega el rol como claim

            String jwtToken = jwtService.generateToken(extraClaims, userDetails);

            System.out.println("Token generado: " + jwtToken);
            System.out.println("Nombre de usuario: " + userDetails.getUsername());
            System.out.println("Rol del usuario: " + usuario.getRol().name());

            return ResponseEntity.ok(new AuthenticationResponse(jwtToken));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthenticationResponse("Credenciales inválidas"));
        }
    }

    @PostMapping("/registrar")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody UsuarioDTO request) {
        try {
            // Encriptar la contraseña antes de guardar
            request.setPassword(passwordEncoder.encode(request.getPassword()));
            UsuarioDTO registeredUserDto = usuarioService.registrar(request);

            // Obtener el UserDetails del usuario recién registrado
            UserDetails userDetails = userDetailsService.loadUserByUsername(registeredUserDto.getEmail());

            // Obtener la entidad Usuario para extraer el rol
            Usuario registeredUser = usuarioRepository.findByEmail(registeredUserDto.getEmail())
                    .orElseThrow(() -> new RuntimeException("Usuario recién registrado no encontrado"));

            // Crear claims para el token (incluyendo el rol)
            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("rol", registeredUser.getRol().name());

            // Generar el token JWT
            String jwtToken = jwtService.generateToken(extraClaims, userDetails);

            System.out.println("Nuevo usuario registrado: " + registeredUserDto.getEmail());
            System.out.println("Token generado para el nuevo usuario: " + jwtToken);
            System.out.println("Rol del nuevo usuario: " + registeredUser.getRol().name());

            // Devolver el token en la respuesta
            return new ResponseEntity<>(new AuthenticationResponse(jwtToken), HttpStatus.CREATED);

        } catch (Exception e) {
            System.err.println("Error al registrar usuario: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}