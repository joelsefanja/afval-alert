package com.summerschool.afval_alert.repository;

import com.summerschool.afval_alert.model.entity.Image;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface ImageRepository extends JpaRepository<Image, Long> {

}
