package com.summerschool.afval_alert.repository;

import com.summerschool.afval_alert.model.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImageRepository extends JpaRepository<Image, Long> {
}
