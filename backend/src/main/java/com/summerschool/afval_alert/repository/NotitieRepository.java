package com.summerschool.afval_alert.repository;

import com.summerschool.afval_alert.model.entity.Notitie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotitieRepository extends JpaRepository<Notitie, Long> {
}
