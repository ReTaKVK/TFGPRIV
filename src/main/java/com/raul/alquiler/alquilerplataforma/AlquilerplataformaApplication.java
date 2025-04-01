package com.raul.alquiler.alquilerplataforma;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class AlquilerplataformaApplication implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public static void main(String[] args) {
        SpringApplication.run(AlquilerplataformaApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        // Verificar conexión a la base de datos
        try {
            jdbcTemplate.execute("SELECT 1");
            System.out.println("La conexión a la base de datos fue exitosa.");
        } catch (Exception e) {
            System.out.println("Error al conectar con la base de datos: " + e.getMessage());
        }
    }
}
