package com.summerschool.afval_alert.service;

import com.summerschool.afval_alert.model.entity.Image;
import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.model.entity.Notitie;
import com.summerschool.afval_alert.repository.ImageRepository;
import com.summerschool.afval_alert.repository.MeldingRepository;
import com.summerschool.afval_alert.repository.NotitieRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MeldingService {
    private final MeldingRepository meldingRepository;
    private final ImageRepository imageRepository;
    private final NotitieRepository notitieRepository;

    public MeldingService(MeldingRepository meldingRepository, ImageRepository imageRepository, NotitieRepository notitieRepository) {
        this.meldingRepository = meldingRepository;
        this.imageRepository = imageRepository;
        this.notitieRepository = notitieRepository;
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

    public void deleteNonFinalizedMeldingen(LocalDateTime cutoff) {
        List<Melding> oldDrafts = meldingRepository.findByIsFinalizedFalseAndCreatedAtBefore(cutoff);

        meldingRepository.deleteAll(oldDrafts);

        System.out.println("Deleted " + oldDrafts.size() + " old meldingen with their linked image.");
    }

    public void addNotitie(long meldingId, String note) {
        Melding melding = meldingRepository.findById(meldingId)
                .orElseThrow(() -> new RuntimeException("Melding not found with ID: " + meldingId));

        Notitie notitie = new Notitie();
        notitie.setNotitie(note);

        melding.setNotitie(notitie);

        meldingRepository.save(melding);

        return;
    }

    public List<Notitie> getNotities(long meldingId) {
        Melding melding = meldingRepository.findById(meldingId)
                .orElseThrow(() -> new RuntimeException("Melding not found with ID: " + meldingId));

        List<Notitie> notities = notitieRepository.findByMeldingId(meldingId);

        return notities;
    }
}
