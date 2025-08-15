package com.summerschool.afval_alert.service;

import com.summerschool.afval_alert.model.entity.Image;
import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.model.entity.StatusUpdate;
import com.summerschool.afval_alert.repository.ImageRepository;
import com.summerschool.afval_alert.repository.MeldingRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MeldingService {
    private final MeldingRepository meldingRepository;
    private final ImageRepository imageRepository;

    public MeldingService(MeldingRepository meldingRepository, ImageRepository imageRepository) {
        this.meldingRepository = meldingRepository;
        this.imageRepository = imageRepository;
    }

    public Melding createMelding(Image image) {
        Melding melding = new Melding();
        melding.setImage(image);

//        StatusUpdate statusUpdate = new StatusUpdate();
//        statusUpdate.setStatusUpdate(0);
//
//        melding.addStatusUpdate(statusUpdate);

        return meldingRepository.save(melding);
    }

    public Melding findMeldingById(Long id) {
        return meldingRepository.findById(id).orElse(null);
    }

    public Melding updateMelding(Melding melding){
        return meldingRepository.save(melding);
    }

    public void deleteNonFinalizedMeldingen(LocalDateTime cutoff) {
        List<Melding> oldDrafts = meldingRepository.findByIsFinalizedFalseAndCreatedAtBefore(cutoff);

        meldingRepository.deleteAll(oldDrafts);

        System.out.println("Deleted " + oldDrafts.size() + " old meldingen with their linked image.");
    }


    public Melding addStatusUpdate(Melding melding, StatusUpdate statusUpdate) {
        melding.addStatusUpdate(statusUpdate);

        return meldingRepository.save(melding);
    }
}
