package com.summerschool.afval_alert.service;

import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.model.entity.Notitie;
import com.summerschool.afval_alert.repository.NotitieRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotitieService {
    private final NotitieRepository notitieRepository;

    public NotitieService(NotitieRepository notitieRepository) {
        this.notitieRepository = notitieRepository;
    }

    public Notitie createNotitie(Melding melding, String note) {
        Notitie notitie = new Notitie();
        notitie.setContent(note);
        notitie.setMelding(melding);
        notitie.setCreatedAt(LocalDateTime.now());
        melding.addNotitie(notitie);

        return notitieRepository.save(notitie);
    }
}
