package com.summerschool.afval_alert.repository;

import com.summerschool.afval_alert.model.entity.Classification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClassificationRepository extends JpaRepository<Classification, Long> {
    @Query("SELECT c FROM Classification c " +
            "JOIN FETCH c.melding m " +
            "JOIN FETCH m.image i " +
            "WHERE c.status = :status " +
            "ORDER BY c.createdAt ASC")
    List<Classification> findTop10WithImageByStatus(@Param("status") Classification.Status status);

}
