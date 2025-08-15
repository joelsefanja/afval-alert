package com.summerschool.afval_alert.service;

import com.summerschool.afval_alert.model.entity.Image;
import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.model.entity.StatusUpdate;
import com.summerschool.afval_alert.repository.MeldingRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class MeldingService {
    private final MeldingRepository meldingRepository;

    public MeldingService(MeldingRepository meldingRepository) {
        this.meldingRepository = meldingRepository;
    }

    public Melding createMelding(Image image) {
        Melding melding = new Melding();
        melding.setImage(image);
        return meldingRepository.save(melding);
    }

    public Melding updateMelding(Float latitude,
                                 Float longitude,
                                 String trashType) throws IOException {
        Melding melding = new Melding();
        melding.setMelding(
                latitude,
                longitude,
                trashType
        );

        return meldingRepository.save(melding);
    }

    public Melding addStatusUpdate(Melding melding, StatusUpdate statusUpdate) {
        melding.addStatusUpdate(statusUpdate);

        return meldingRepository.save(melding);
    }
}
