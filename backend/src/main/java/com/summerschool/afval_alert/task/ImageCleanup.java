package com.summerschool.afval_alert.task;

import com.summerschool.afval_alert.repository.ImageRepository;
import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ImageCleanup {
    private final ImageRepository imageRepository;

    public ImageCleanup(ImageRepository imageRepository) {
        this.imageRepository = imageRepository;
    }

    @Scheduled(fixedRate = 10 * 60 * 1000) // Elke 10 minuten
    @Transactional
    public void cleanupOldImages() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(1);

        int deletedCount = imageRepository.deleteOldImages(cutoff);
        System.out.println("Deleted " + deletedCount + " old images.");
    }
}
