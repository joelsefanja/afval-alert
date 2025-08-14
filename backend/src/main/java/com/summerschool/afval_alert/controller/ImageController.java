package com.summerschool.afval_alert.controller;

import com.summerschool.afval_alert.model.entity.Image;
import com.summerschool.afval_alert.service.ImageService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api")
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @PostMapping("/image")
    public ResponseEntity<Long> addImage(@RequestParam("file") MultipartFile file) throws IOException {
        Image savedImage = imageService.saveImage(file);
        return ResponseEntity.ok(savedImage.getId());
    }

    @GetMapping("/image/{id}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
        Image image = imageService.getImage(id);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(image.getData());
    }
}
