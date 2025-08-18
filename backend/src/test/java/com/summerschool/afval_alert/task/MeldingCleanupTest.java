package com.summerschool.afval_alert.task;

import com.summerschool.afval_alert.service.MeldingService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class MeldingCleanupTest {
    @Mock
    private MeldingService meldingService;

    @InjectMocks
    private MeldingCleanup meldingCleanup;

    @Test
    void cleanup_callsDeleteNonFinalizedMeldingen() {
        meldingCleanup.cleanup();

        verify(meldingService, times(1))
                .deleteNonFinalizedMeldingen(any(LocalDateTime.class));
    }
}
