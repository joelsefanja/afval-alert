package com.summerschool.afval_alert.repository;

import com.summerschool.afval_alert.model.entity.StatusUpdate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusUpdateRepository extends JpaRepository<StatusUpdate, Long> {
}
