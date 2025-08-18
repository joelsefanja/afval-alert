package com.summerschool.afval_alert.repository;

import com.summerschool.afval_alert.model.entity.Melding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface MeldingRepository extends JpaRepository<Melding, Long> {
    List<Melding> findByIsFinalizedFalseAndCreatedAtBefore(LocalDateTime cutoff);
}
