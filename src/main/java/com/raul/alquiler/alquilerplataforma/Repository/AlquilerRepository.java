package com.raul.alquiler.alquilerplataforma.Repository;

import com.raul.alquiler.alquilerplataforma.Entidades.Alquiler;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlquilerRepository extends JpaRepository<Alquiler, Long> {}


