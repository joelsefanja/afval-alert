package com.summerschool.afval_alert.controller;

import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.service.MeldingService;
import com.summerschool.afval_alert.service.StatusUpdateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class StatusUpdateController {
    private final StatusUpdateService statusUpdateService;
    private final MeldingService meldingService;

    public StatusUpdateController(StatusUpdateService statusUpdateService, MeldingService meldingService) {
        this.statusUpdateService = statusUpdateService;
        this.meldingService = meldingService;
    }

    @PostMapping("/status_update")
    public ResponseEntity<Long> postStatusUpdate(@RequestParam("meldingId") Long meldingId,
                                                 @RequestParam("update") int update) {

        Melding melding = meldingService.addStatusUpdate(meldingId, update);

        return ResponseEntity.ok().body(melding.getId());
    }
}
