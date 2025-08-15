package com.summerschool.afval_alert.controller;

import com.summerschool.afval_alert.model.dto.PostMeldingDTO;
import com.summerschool.afval_alert.model.entity.Image;
import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.service.MeldingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MeldingController {

    private final MeldingService meldingService;

    public MeldingController(MeldingService meldingService) {
        this.meldingService = meldingService;
    }

    @PostMapping("/melding")
    public ResponseEntity<Melding> addMelding(@RequestBody PostMeldingDTO postMeldingDTO) {
        Melding melding = new Melding();
        melding.setLatitude(postMeldingDTO.getLat());
        melding.setLongitude(postMeldingDTO.getLon());
        melding.setEmail(postMeldingDTO.getEmail());
        melding.setName(postMeldingDTO.getNaam());
        melding.setComment(postMeldingDTO.getComment());

        return ResponseEntity.ok(melding);
    }
}
