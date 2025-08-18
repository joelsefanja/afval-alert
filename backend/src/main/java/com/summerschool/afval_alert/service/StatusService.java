package com.summerschool.afval_alert.service;

import com.summerschool.afval_alert.model.entity.Status;
import com.summerschool.afval_alert.repository.StatusRepository;
import org.springframework.stereotype.Service;

@Service
public class StatusService {
    private final StatusRepository statusRepository;

    public StatusService(StatusRepository statusRepository) {
        this.statusRepository = statusRepository;
    }

    public Status saveStatus(String state) {
        Status status = new Status();
        status.setStatus(state);

        return statusRepository.save(status);
    }
}
