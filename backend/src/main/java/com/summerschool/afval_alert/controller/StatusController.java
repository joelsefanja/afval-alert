package com.summerschool.afval_alert.controller;

import com.summerschool.afval_alert.model.enums.Status;
import com.summerschool.afval_alert.service.StatusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class StatusController {
    private final StatusService statusService;

    public StatusController(StatusService statusService) {
        this.statusService = statusService;
    }

    @GetMapping("/statusen")
    public ResponseEntity<List<String>> getStatusen() {
        return ResponseEntity.ok().body(statusService.getStatusen());
    }
}
