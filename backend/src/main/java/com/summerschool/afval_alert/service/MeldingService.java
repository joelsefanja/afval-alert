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

    public Melding findMeldingById(Long id) {
        return meldingRepository.findById(id).orElse(null);
    }

    public Melding updateMelding(Melding melding){
        return meldingRepository.save(melding);
    }

    public Melding addStatusUpdate(Melding melding, StatusUpdate statusUpdate) {
        melding.addStatusUpdate(statusUpdate);

        return meldingRepository.save(melding);
    }
}
