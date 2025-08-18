package com.summerschool.afval_alert.controller;

import com.summerschool.afval_alert.model.dto.PostNotitieDTO;
import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.model.entity.Notitie;
import com.summerschool.afval_alert.service.MeldingService;
import com.summerschool.afval_alert.service.NotitieService;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

    @PostMapping("/notitie/{id}")
    public ResponseEntity<Melding> postNotitie(
            @PathVariable Long id,
            @RequestBody PostNotitieDTO postNotitieDTO
    ) {

        Notitie notitie = new Notitie();
        notitie.setContent(postNotitieDTO.getNotitie());
        notitie.setCreatedAt(LocalDateTime.now());

        Melding melding = meldingService.findMeldingById(id);
        notitie.setMelding(melding);
        melding.addNotitie(notitie);

        meldingService.updateMelding(melding);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/notities")
    public ResponseEntity<List<Notitie>> getNotities(@RequestParam("meldingId") Long meldingId) {
        List<Notitie> notities = meldingService.getNotities(meldingId);

        return ResponseEntity.ok().body(notities);
    }
}
