package com.summerschool.afval_alert.repository;

import com.summerschool.afval_alert.model.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusRepository extends JpaRepository<Status, Long> {
}
