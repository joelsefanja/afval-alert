package com.summerschool.afval_alert.task;

import com.summerschool.afval_alert.external.PythonClassificationClient;
import com.summerschool.afval_alert.model.entity.Classification;
import com.summerschool.afval_alert.model.entity.ClassificationLabel;
import com.summerschool.afval_alert.model.entity.WasteType;
import com.summerschool.afval_alert.repository.ClassificationLabelRepository;
import com.summerschool.afval_alert.repository.ClassificationRepository;
import com.summerschool.afval_alert.repository.WasteTypeRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class ClassificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(ClassificationScheduler.class);
    private final ClassificationRepository classificationRepository;
    private final TaskExecutor taskExecutor;
    private final PythonClassificationClient pythonClassificationClient;
    private final ClassificationLabelRepository classificationLabelRepository;
    private final WasteTypeRepository wasteTypeRepository;

    public ClassificationScheduler(ClassificationRepository classificationRepository, @Qualifier("classificationTaskExecutor") TaskExecutor taskExecutor, PythonClassificationClient pythonClassificationClient, ClassificationLabelRepository classificationLabelRepository, WasteTypeRepository wasteTypeRepository) {
        this.classificationRepository = classificationRepository;
        this.taskExecutor = taskExecutor;
        this.pythonClassificationClient = pythonClassificationClient;
        this.classificationLabelRepository = classificationLabelRepository;
        this.wasteTypeRepository = wasteTypeRepository;
    }

    @Scheduled(fixedDelay = 5000)
    public void processPendingClassifications() {
        List<Classification> pendingJobs = classificationRepository.findTop10WithImageByStatus(Classification.Status.PENDING);

        for (Classification job : pendingJobs) {
            // Haal de afbeelding op voor async. Anders zit de async call niet in dezelfde
            // transactie als de repository call en kan de afbeelding niet worden gevonden.
            byte[] imageData = job.getMelding().getImage().getData();

            CompletableFuture.runAsync(() -> processSingleClassification(job, imageData), taskExecutor);
        }
    }

    private void processSingleClassification(Classification job, byte[] imageData) {
        try {
            job.setStatus(Classification.Status.RUNNING);
            job.setStartedAt(LocalDateTime.now());
            classificationRepository.save(job);

            List<Map<String, Object>> labels = pythonClassificationClient.classifyImage(imageData);

            handleClassificationLabels(job, labels);

            job.setStatus(Classification.Status.COMPLETED);
            job.setClassifiedAt(LocalDateTime.now());
            classificationRepository.save(job);

        } catch (Exception e) {
            log.error("Classification processing failed", e);
            job.setStatus(Classification.Status.FAILED);
            classificationRepository.save(job);
        }
    }

    private void handleClassificationLabels(Classification classification, List<Map<String, Object>> apiResults) {
        for (Map<String, Object> result : apiResults) {
            String typeName = (String) result.get("type"); // get type from JSON
            Double confidence = (Double) result.get("confidence");

            if (typeName == null || typeName.isEmpty()) continue;

            WasteType wasteType = wasteTypeRepository.findByName(typeName)
                    .orElseGet(() -> {
                        WasteType newType = new WasteType();
                        newType.setName(typeName);
                        return wasteTypeRepository.save(newType);
                    });

            ClassificationLabel classificationLabel = new ClassificationLabel();
            classificationLabel.setClassification(classification);
            classificationLabel.setWasteType(wasteType);
            classificationLabel.setConfidence(confidence);

            classificationLabelRepository.save(classificationLabel);
        }
    }
}
