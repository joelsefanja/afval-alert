package com.summerschool.afval_alert.controller;

import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.model.entity.StatusUpdate;
import com.summerschool.afval_alert.repository.MeldingRepository;
import com.summerschool.afval_alert.service.MeldingService;
import com.summerschool.afval_alert.service.StatusUpdateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class StatusUpdateController {
    private final StatusUpdateService statusUpdateService;
    private final MeldingService meldingService;
    private final MeldingRepository meldingRepository;

    public StatusUpdateController(StatusUpdateService statusUpdateService, MeldingService meldingService, MeldingRepository meldingRepository) {
        this.statusUpdateService = statusUpdateService;
        this.meldingService = meldingService;
        this.meldingRepository = meldingRepository;
    }

    @PostMapping("/status_update")
    public ResponseEntity<Long> postStatusUpdate(@RequestParam("meldingId") Long meldingId,
                                                 @RequestParam("update") int update) {

        Melding melding = meldingRepository.findById(meldingId)
                .orElseThrow(() -> new RuntimeException("Melding not found with ID: " + meldingId));

        StatusUpdate statusUpdate = new StatusUpdate();
        statusUpdate.setStatusUpdate(update);

        melding.addStatusUpdate(statusUpdate);

        return ResponseEntity.ok().body(melding.getId());
    }
}
