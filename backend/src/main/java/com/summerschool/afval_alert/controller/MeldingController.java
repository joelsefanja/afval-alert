package com.summerschool.afval_alert.controller;

import com.summerschool.afval_alert.mapper.MeldingMapper;
import com.summerschool.afval_alert.model.dto.AllMeldingenDTO;
import com.summerschool.afval_alert.model.dto.PutMeldingDTO;
import com.summerschool.afval_alert.model.dto.PutStatusMeldingDTO;
import com.summerschool.afval_alert.model.dto.ShowMeldingDTO;
import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.model.enums.Status;
import com.summerschool.afval_alert.model.enums.TrashType;
import com.summerschool.afval_alert.service.MeldingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MeldingController {
    private final MeldingService meldingService;
    private final MeldingMapper meldingMapper;

    public MeldingController(MeldingService meldingService,  MeldingMapper meldingMapper) {
        this.meldingService = meldingService;
        this.meldingMapper = meldingMapper;
    }

    @PutMapping("/melding/{id}")
    public ResponseEntity<Melding> updateMelding(
            @PathVariable Long id,
            @RequestBody PutMeldingDTO putMeldingDTO) {

        Melding melding = meldingService.findMeldingById(id);

        melding.setLat(putMeldingDTO.getLat());
        melding.setLon(putMeldingDTO.getLon());
        melding.setComment(putMeldingDTO.getComment());
        melding.setEmail(putMeldingDTO.getEmail());
        melding.setName(putMeldingDTO.getNaam());

        // Markeer als finalized om opschoning te voorkomen
        melding.setFinalized(true);

        meldingService.updateMelding(melding);

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/melding/status/{id}")
    public ResponseEntity<Melding> updateStatusMelding(
            @PathVariable Long id,
            @RequestBody PutStatusMeldingDTO putStatusMeldingDTO
    ) {

        Melding melding = meldingService.findMeldingById(id);

        melding.setStatus(putStatusMeldingDTO.getStatus());

        meldingService.updateMelding(melding);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/meldingen")
    public ResponseEntity<List<AllMeldingenDTO>> getAllMeldingen() {
        List<AllMeldingenDTO> meldingen = meldingService.getAllMeldingen();
        return ResponseEntity.ok(meldingen);
    }

    @GetMapping("/melding/{id}")
    public ResponseEntity<ShowMeldingDTO> getMelding(@PathVariable Long id) {
        Melding melding = meldingService.findMeldingById(id);
        ShowMeldingDTO dto = meldingMapper.toShowDto(melding);
        return ResponseEntity.ok(dto);
    }
}
