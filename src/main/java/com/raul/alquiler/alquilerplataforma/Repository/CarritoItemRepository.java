package com.raul.alquiler.alquilerplataforma.Repository;

import com.raul.alquiler.alquilerplataforma.Entidades.CarritoItem;
import com.raul.alquiler.alquilerplataforma.Entidades.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarritoItemRepository extends JpaRepository<CarritoItem, Long> {
    List<CarritoItem> findByUsuario(Usuario usuario);
    void deleteAllByUsuario(Usuario usuario);
}
