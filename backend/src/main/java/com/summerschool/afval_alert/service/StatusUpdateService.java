package com.summerschool.afval_alert.service;

import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.model.entity.Notitie;
import com.summerschool.afval_alert.model.entity.Status;
import com.summerschool.afval_alert.model.entity.StatusUpdate;
import com.summerschool.afval_alert.repository.MeldingRepository;
import com.summerschool.afval_alert.repository.NotitieRepository;
import com.summerschool.afval_alert.repository.StatusUpdateRepository;
import org.aspectj.weaver.ast.Not;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StatusUpdateService {
    private final StatusUpdateRepository statusUpdateRepository;
    private final MeldingRepository meldingRepository;
    private final NotitieRepository notitieRepository;

    public StatusUpdateService(StatusUpdateRepository statusUpdateRepository, MeldingRepository meldingRepository, NotitieRepository notitieRepository) {
        this.statusUpdateRepository = statusUpdateRepository;
        this.meldingRepository = meldingRepository;
        this.notitieRepository = notitieRepository;
    }

    public StatusUpdate saveStatusUpdate(int update) {
        StatusUpdate statusUpdate = new StatusUpdate();

        return statusUpdateRepository.save(statusUpdate);
    }

    public StatusUpdate addNotitieStatusUpdate(Long statusUpdateId, String note) {
        StatusUpdate statusUpdate = statusUpdateRepository.findById(statusUpdateId)
                        .orElseThrow(() -> new RuntimeException("StatusUpdate not found with ID: " + statusUpdateId));

        Notitie notitie = new Notitie();
        notitie.setNotitie(note);

        statusUpdate.addNotitie(notitie);

        return statusUpdateRepository.save(statusUpdate);
    }

    public List<Notitie> getNotities(Long statusUpdateId) {
        StatusUpdate statusUpdate = statusUpdateRepository.findById(statusUpdateId)
                .orElseThrow(() -> new RuntimeException("StatusUpdate not found with ID: " + statusUpdateId));

        List<Notitie> notities = notitieRepository.findByStatusUpdateId(statusUpdateId);
//        List<Notitie> notities = statusUpdate.getNotities();

        return notities;
    }

}
