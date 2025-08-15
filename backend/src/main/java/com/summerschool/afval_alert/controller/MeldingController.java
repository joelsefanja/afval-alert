package com.summerschool.afval_alert.controller;

import com.summerschool.afval_alert.model.dto.PutMeldingDTO;
import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.service.MeldingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class MeldingController {

    private final MeldingService meldingService;

    public MeldingController(MeldingService meldingService) {
        this.meldingService = meldingService;
    }

    @PutMapping("/melding/{id}")
    public ResponseEntity<Melding> updateMelding(
            @PathVariable Long id,
            @RequestBody PutMeldingDTO putMeldingDTO) {

        Melding melding = meldingService.findMeldingById(id);

        melding.setLatitude(putMeldingDTO.getLat());
        melding.setLongitude(putMeldingDTO.getLon());
        melding.setComment(putMeldingDTO.getComment());
        melding.setEmail(putMeldingDTO.getEmail());
        melding.setName(putMeldingDTO.getNaam());

        // Markeer als finalized om opschoning te voorkomen
        melding.setFinalized(true);

        Melding updatedMelding = meldingService.updateMelding(melding);

        // Waarschijnlijk beter om gebruik te maken van een melding feedback DTO
        return ResponseEntity.ok(updatedMelding);
    }
}
