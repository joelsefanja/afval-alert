package com.summerschool.afval_alert.service;

import com.summerschool.afval_alert.model.entity.Image;
import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.repository.MeldingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MeldingServiceTest {

    @Mock
    private MeldingRepository meldingRepository;

    @InjectMocks
    private MeldingService meldingService;

    @Test
    void createMelding() {
        Image image = new Image();
        image.setId(1L);

        Melding melding = new Melding();
        melding.setId(100L);
        melding.setImage(image);

        when(meldingRepository.save(any(Melding.class))).thenReturn(melding);

        Melding result = meldingService.createMelding(image);

        assertNotNull(result);
        assertEquals(melding.getId(), result.getId());
        assertEquals(image, result.getImage());

        verify(meldingRepository, times(1)).save(any(Melding.class));
    }

    @Test
    void findMeldingById_found() {
        Melding melding = new Melding();
        melding.setId(1L);

        when(meldingRepository.findById(1L)).thenReturn(Optional.of(melding));

        Melding result =  meldingService.findMeldingById(1L);

        assertNotNull(result);
        assertEquals(melding.getId(), result.getId());
    }

    @Test
    void findMeldingById_not_found() {
        when(meldingRepository.findById(1L)).thenReturn(Optional.empty());

        Melding result = meldingService.findMeldingById(1L);

        assertNull(result);
    }

    @Test
    void updateMelding() {
        Melding existingMelding = new Melding();
        existingMelding.setId(1L);
        existingMelding.setComment("old comment");

        // Het is veiliger om bij het updaten van de melding alleen de aangepaste velden op te slaan.
        // Momenteel wordt de complete entity overschreven.
    }
}
