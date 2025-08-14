package com.summerschool.afval_alert.service;

import com.summerschool.afval_alert.model.entity.Notitie;
import com.summerschool.afval_alert.model.entity.Status;
import com.summerschool.afval_alert.model.entity.StatusUpdate;
import com.summerschool.afval_alert.repository.StatusUpdateRepository;
import org.springframework.stereotype.Service;

@Service
public class StatusUpdateService {
    private final StatusUpdateRepository statusUpdateRepository;

    public StatusUpdateService(StatusUpdateRepository statusUpdateRepository) {
        this.statusUpdateRepository = statusUpdateRepository;
    }

    public StatusUpdate saveStatusUpdate(Status update) {
        StatusUpdate statusUpdate = new StatusUpdate();
        statusUpdate.setStatusUpdate(update);

        return statusUpdateRepository.save(statusUpdate);
    }

    public StatusUpdate addNotitieStatusUpdate(StatusUpdate statusUpdate, Notitie notitie) {
        statusUpdate.addNotitie(notitie);

        return statusUpdateRepository.save(statusUpdate);
    }
}
