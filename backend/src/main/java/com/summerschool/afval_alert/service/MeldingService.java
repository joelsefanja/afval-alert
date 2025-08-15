package com.summerschool.afval_alert.service;

import com.summerschool.afval_alert.model.entity.Image;
import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.model.entity.StatusUpdate;
import com.summerschool.afval_alert.repository.ImageRepository;
import com.summerschool.afval_alert.repository.MeldingRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class MeldingService {
    private final MeldingRepository meldingRepository;
    private final ImageRepository imageRepository;

    public MeldingService(MeldingRepository meldingRepository, ImageRepository imageRepository) {
        this.meldingRepository = meldingRepository;
        this.imageRepository = imageRepository;
    }

    public Melding saveMelding(Float latitude,
                               Float longitude,
                               Long imageId,
                               String trashType) throws IOException {
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found with ID " + imageId));

        Melding melding = new Melding();
        melding.setMelding(
                latitude,
                longitude,
                image,
                trashType
        );

        return meldingRepository.save(melding);
    }

    public Melding addStatusUpdate(Melding melding, StatusUpdate statusUpdate) {
        melding.addStatusUpdate(statusUpdate);

        return meldingRepository.save(melding);
    }
}
