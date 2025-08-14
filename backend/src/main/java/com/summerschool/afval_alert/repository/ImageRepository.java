package com.summerschool.afval_alert.repository;

import com.summerschool.afval_alert.model.entity.Image;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface ImageRepository extends JpaRepository<Image, Long> {

    @Query("SELECT i.data FROM Image i WHERE i.id = :id")
    byte[] getImageBytesById(@Param("id") Long id);

    // Verwijder alle afbeeldingen op basis van de cutoff tijd.
    //
    // Bij uitbreiden moet er waarschijnlijk gebruik worden gemaakt van een
    // processed boolean om efficient door de verwerkte afbeeldingen heen te vliegen.
    @Modifying
    @Transactional
    @Query("DELETE FROM Image i WHERE i.createdAt < :cutoff")
    int deleteOldImages(@Param("cutoff") LocalDateTime cutoff);

    @Query("SELECT i.data FROM Image i WHERE i.id = :id")
    byte[] findDataById(@Param("id") Long id);
}
