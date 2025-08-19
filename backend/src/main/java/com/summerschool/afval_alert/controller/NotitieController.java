package com.summerschool.afval_alert.controller;

import com.summerschool.afval_alert.model.dto.NotitieDTO;
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

        Melding melding = meldingService.findMeldingById(id);
        notitieService.createNotitie(melding, postNotitieDTO.getNotitie());

        meldingService.updateMelding(melding);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/notities/{id}")
    public ResponseEntity<List<NotitieDTO>> getNotities(
            @PathVariable Long id
    ) {
        List<NotitieDTO> notities = notitieService.getNotities(id);

        return ResponseEntity.ok().body(notities);
    }
}
