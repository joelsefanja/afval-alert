package com.summerschool.afval_alert.service;

import com.summerschool.afval_alert.mapper.NotitieMapper;
import com.summerschool.afval_alert.model.dto.NotitieDTO;
import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.model.entity.Notitie;
import com.summerschool.afval_alert.repository.NotitieRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotitieService {
    private final NotitieRepository notitieRepository;
    private final NotitieMapper notitieMapper;

    public NotitieService(NotitieRepository notitieRepository, NotitieMapper notitieMapper) {
        this.notitieRepository = notitieRepository;
        this.notitieMapper = notitieMapper;
    }

    public Notitie createNotitie(Melding melding, String note) {
        Notitie notitie = new Notitie();
        notitie.setContent(note);
        notitie.setMelding(melding);
        notitie.setCreatedAt(LocalDateTime.now());
        melding.addNotitie(notitie);

        return notitieRepository.save(notitie);
    }

    public List<NotitieDTO> getNotities(long meldingId) {
        List<Notitie> notities = notitieRepository.findByMeldingId(meldingId);

        List<NotitieDTO> notitiesDTO = notities.stream().map(notitieMapper::toDto).toList();

        return notitiesDTO;
    }
}
