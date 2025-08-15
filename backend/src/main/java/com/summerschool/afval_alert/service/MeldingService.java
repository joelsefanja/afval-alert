package com.summerschool.afval_alert.service;

import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.model.entity.StatusUpdate;
import com.summerschool.afval_alert.repository.MeldingRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class MeldingService {
    private final MeldingRepository meldingRepository;
    private final ImageService imageService;

    public MeldingService(MeldingRepository meldingRepository, ImageService imageService) {
        this.meldingRepository = meldingRepository;
        this.imageService = imageService;
    }

    public Melding saveMelding(Float latitude,
                               Float longitude,
                               Long imageId,
                               String trashType) throws IOException {
        Melding melding = new Melding();
        melding.setMelding(
                latitude,
                longitude,
                imageService.getImage(imageId),
                trashType
        );

        return meldingRepository.save(melding);
    }

    public Melding addStatusUpdate(Melding melding, StatusUpdate statusUpdate) {
        melding.addStatusUpdate(statusUpdate);

        return meldingRepository.save(melding);
    }
}
