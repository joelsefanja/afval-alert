package com.summerschool.afval_alert.repository;

import com.summerschool.afval_alert.model.entity.Melding;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeldingRepository extends JpaRepository<Melding, Long> {
}
