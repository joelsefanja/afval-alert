package com.summerschool.afval_alert.repository;

import com.summerschool.afval_alert.model.entity.Classification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassificationRepository extends JpaRepository<Classification, Long> {
    List<Classification> findTop10ByStatusOrderByCreatedAtAsc(Classification.Status status);
}
