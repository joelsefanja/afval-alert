package com.summerschool.afval_alert.service;

import com.summerschool.afval_alert.model.entity.Notitie;
import com.summerschool.afval_alert.repository.NotitieRepository;
import org.springframework.stereotype.Service;

@Service
public class NotitieService {
    private final NotitieRepository notitieRepository;

    public NotitieService(NotitieRepository notitieRepository) {
        this.notitieRepository = notitieRepository;
    }

    public Notitie saveNotitie(String note) {
        Notitie notitie = new Notitie();
        notitie.setContent(note);

        return notitieRepository.save(notitie);
    }
}
