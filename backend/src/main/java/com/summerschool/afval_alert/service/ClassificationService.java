package com.summerschool.afval_alert.service;

import com.summerschool.afval_alert.model.entity.Classification;
import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.repository.ClassificationRepository;
import com.summerschool.afval_alert.repository.MeldingRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class ClassificationService {
    private final ClassificationRepository classificationRepository;
    private final MeldingRepository meldingRepository;

    public ClassificationService(ClassificationRepository classificationRepository, MeldingRepository meldingRepository) {
        this.classificationRepository = classificationRepository;
        this.meldingRepository = meldingRepository;
    }

    @Transactional
    public void createClassification(Long meldingId) {
        Melding melding = meldingRepository.findById(meldingId)
                .orElseThrow(() -> new IllegalArgumentException("No melding with id " + meldingId));

        Classification classification = new Classification();
        classification.setMelding(melding);
        classification.setStatus(Classification.Status.PENDING);

        classificationRepository.save(classification);
    }
}
