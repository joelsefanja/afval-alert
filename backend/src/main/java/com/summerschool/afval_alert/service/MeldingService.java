package com.summerschool.afval_alert.service;

import com.summerschool.afval_alert.mapper.MeldingMapper;
import com.summerschool.afval_alert.model.dto.AllMeldingenDTO;
import com.summerschool.afval_alert.model.dto.ShowMeldingDTO;
import com.summerschool.afval_alert.model.entity.Image;
import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.model.entity.Notitie;
import com.summerschool.afval_alert.model.enums.Status;
import com.summerschool.afval_alert.model.enums.TrashType;
import com.summerschool.afval_alert.repository.ImageRepository;
import com.summerschool.afval_alert.repository.MeldingRepository;
import com.summerschool.afval_alert.repository.NotitieRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MeldingService {
    private final MeldingRepository meldingRepository;
    private final ImageRepository imageRepository;
    private final NotitieRepository notitieRepository;
    private final MeldingMapper meldingMapper;

    public MeldingService(MeldingRepository meldingRepository, ImageRepository imageRepository, NotitieRepository notitieRepository, MeldingMapper meldingMapper) {
        this.meldingRepository = meldingRepository;
        this.imageRepository = imageRepository;
        this.notitieRepository = notitieRepository;
        this.meldingMapper = meldingMapper;
    }

    public Melding createMelding(Image image) {
        Melding melding = new Melding();
        melding.setImage(image);

        melding.setTrashType(TrashType.PENDING_AI);
        melding.setStatus(Status.NIEUW);

        return meldingRepository.save(melding);
    }

    public Melding findMeldingById(Long id) {
        return meldingRepository.findById(id).orElse(null);
    }

    public List<AllMeldingenDTO> getAllMeldingen() {
        return meldingRepository.findAll().stream()
                .filter(Melding::getFinalized)
                .map(meldingMapper::toAllDto)
                .toList();
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
        notitie.setContent(note);
        notitie.setCreatedAt(LocalDateTime.now());
        notitie.setMelding(melding);

        melding.getNotities().add(notitie);

        meldingRepository.save(melding);
    }
}
