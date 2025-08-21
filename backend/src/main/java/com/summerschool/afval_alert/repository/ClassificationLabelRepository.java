package com.summerschool.afval_alert.repository;

import com.summerschool.afval_alert.model.entity.ClassificationLabel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassificationLabelRepository extends JpaRepository<ClassificationLabel, Long>  {
}
