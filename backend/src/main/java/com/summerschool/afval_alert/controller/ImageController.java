package com.summerschool.afval_alert.controller;

import com.summerschool.afval_alert.model.entity.Image;
import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.service.ImageService;
import com.summerschool.afval_alert.service.MeldingService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api")
public class ImageController {

    private final ImageService imageService;
    private final MeldingService meldingService;

    public ImageController(ImageService imageService, MeldingService meldingService) {
        this.imageService = imageService;
        this.meldingService = meldingService;
    }

    @PostMapping("/image")
    public ResponseEntity<Long> addImage(@RequestParam("file") MultipartFile file) throws IOException {
        Image savedImage = imageService.saveImage(file);
        Melding draft = meldingService.createMelding(savedImage);
        return ResponseEntity.ok(draft.getId());
    }

    @GetMapping("/image/{id}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
        Image image = imageService.getImage(id);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(image.getData());
    }
}
