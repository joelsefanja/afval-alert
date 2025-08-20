package com.summerschool.afval_alert.task;

import com.summerschool.afval_alert.external.PythonClassificationClient;
import com.summerschool.afval_alert.model.entity.Classification;
import com.summerschool.afval_alert.model.entity.ClassificationLabel;
import com.summerschool.afval_alert.repository.ClassificationRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Component
public class ClassificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(ClassificationScheduler.class);
    private final ClassificationRepository classificationRepository;
    private final TaskExecutor taskExecutor;
    private final PythonClassificationClient pythonClassificationClient;

    public ClassificationScheduler(ClassificationRepository classificationRepository, @Qualifier("classificationTaskExecutor") TaskExecutor taskExecutor, PythonClassificationClient pythonClassificationClient) {
        this.classificationRepository = classificationRepository;
        this.taskExecutor = taskExecutor;
        this.pythonClassificationClient = pythonClassificationClient;
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void processPendingClassifications() {
        List<Classification> pendingJobs = classificationRepository.findTop10ByStatusOrderByCreatedAtAsc(Classification.Status.PENDING);

        for (Classification job : pendingJobs) {
            CompletableFuture.runAsync(() -> processSingleClassification(job), taskExecutor);
        }
    }

    private void processSingleClassification(Classification job) {
        try {
            job.setStatus(Classification.Status.RUNNING);
            job.setStartedAt(LocalDateTime.now());
            classificationRepository.save(job);

            List<ClassificationLabel> labels = pythonClassificationClient.classifyImage(job.getMelding().getImage().getData());
            // TODO: Do something with the labels
            // labels.forEach(job::addLabel);

            job.setStatus(Classification.Status.COMPLETED);
            job.setClassifiedAt(LocalDateTime.now());
            classificationRepository.save(job);

        } catch (Exception e) {
            log.error("Classification processing failed", e);
            job.setStatus(Classification.Status.FAILED);
            classificationRepository.save(job);
        }
    }
}
