package com.summerschool.afval_alert.service;

import com.summerschool.afval_alert.model.entity.Melding;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StatusService {
    public List<String> getStatusen() {
        List<String> statusen = Arrays.stream(Melding.Status.values())
                .map(Enum::name)
                .collect(Collectors.toList());
      
      return statusen;
    }
}
