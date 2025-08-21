package com.summerschool.afval_alert.task;

import com.summerschool.afval_alert.service.MeldingService;
import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class MeldingCleanup {
    private final MeldingService meldingService;

    public MeldingCleanup(MeldingService meldingService) {
        this.meldingService = meldingService;
    }

    @Scheduled(fixedRate = 10 * 60 * 1000) // Elke 10 minuten
    @Transactional
    public void cleanup() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(1); // ouder dan 1 uur
        meldingService.deleteNonFinalizedMeldingen(cutoff);
    }
}
