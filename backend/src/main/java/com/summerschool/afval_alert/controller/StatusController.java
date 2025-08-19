package com.summerschool.afval_alert.controller;

import com.summerschool.afval_alert.model.enums.Status;
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

    @GetMapping("/statusen")
    public ResponseEntity<List<String>> getStatusen() {
        List<String> statusen = Arrays.stream(Status.values())
                .map(Enum::name)
                .collect(Collectors.toList());

        return ResponseEntity.ok().body(statusen);
    }
}
