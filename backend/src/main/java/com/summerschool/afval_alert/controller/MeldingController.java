package com.summerschool.afval_alert.controller;

import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.service.MeldingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api")
public class MeldingController {
    private final MeldingService meldingService;

    public MeldingController(MeldingService meldingService) {
        this.meldingService = meldingService;
    }

    @PostMapping("/melding")
    public ResponseEntity<Long> addMelding(@RequestParam("latitude") Float latitude,
                                           @RequestParam("longitude") Float longitude,
                                           @RequestParam("imageId") Long imageId,
                                           @RequestParam("trashType") String trashType) throws IOException{

        Melding melding = meldingService.saveMelding(latitude, longitude, imageId, trashType);

        return ResponseEntity.ok().body(melding.getId());
    }
}
