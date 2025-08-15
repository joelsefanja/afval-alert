package com.summerschool.afval_alert.controller;

import ch.qos.logback.core.status.StatusUtil;
import com.summerschool.afval_alert.model.entity.Notitie;
import com.summerschool.afval_alert.model.entity.StatusUpdate;
import com.summerschool.afval_alert.service.NotitieService;
import com.summerschool.afval_alert.service.StatusUpdateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class NotitieController {
    private final NotitieService notitieService;
    private final StatusUpdateService statusUpdateService;

    public NotitieController(NotitieService notitieService, StatusUpdateService statusUpdateService) {
        this.notitieService = notitieService;
        this.statusUpdateService = statusUpdateService;
    }

    @PostMapping("/addNotitie")
    public ResponseEntity<Long> postNotitie(@RequestParam("statusUpdateId") Long statusUpdateId,
                                            @RequestParam("notitie") String notitie) {

        StatusUpdate statusUpdate = statusUpdateService.addNotitieStatusUpdate(statusUpdateId, notitie);

        return ResponseEntity.ok().body(statusUpdate.getId());
    }

    @GetMapping("/notities")
    public ResponseEntity<List<Notitie>> getNotities(@RequestParam("statusUpdateId") Long statusUpdateId) {
        List<Notitie> notities = statusUpdateService.getNotities(statusUpdateId);

        return ResponseEntity.ok().body(notities);
    }
}
