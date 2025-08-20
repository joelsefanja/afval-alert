package com.summerschool.afval_alert.repository;

import com.summerschool.afval_alert.model.entity.WasteType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WasteTypeRepository extends JpaRepository<WasteType, Long> {
    Optional<WasteType> findByName(String name);
}
