package com.summerschool.afval_alert.controller;

import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.model.entity.Notitie;
import com.summerschool.afval_alert.service.MeldingService;
import com.summerschool.afval_alert.service.NotitieService;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class NotitieController {
    private final NotitieService notitieService;
    private final MeldingService meldingService;

    public NotitieController(NotitieService notitieService, MeldingService meldingService) {
        this.notitieService = notitieService;
        this.meldingService = meldingService;
    }

    @PostMapping("/addNotitie")
    public ResponseEntity<String> postNotitie(@RequestParam("meldingId") Long meldingId,
                                            @RequestParam("notitie") String notitie) {

        meldingService.addNotitie(meldingId, notitie);

        return ResponseEntity.status(HttpStatusCode.valueOf(200)).body("Notitie added to melding");
    }

    @GetMapping("/notities")
    public ResponseEntity<List<Notitie>> getNotities(@RequestParam("meldingId") Long meldingId) {
        List<Notitie> notities = meldingService.getNotities(meldingId);

        return ResponseEntity.ok().body(notities);
    }
}
