package com.summerschool.afval_alert.repository;

import com.summerschool.afval_alert.model.entity.Notitie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotitieRepository extends JpaRepository<Notitie, Long> {
    List<Notitie> findByStatusUpdateId(Long statusUpdateId);
}
