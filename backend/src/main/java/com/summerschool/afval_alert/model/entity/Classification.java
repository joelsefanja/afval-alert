package com.summerschool.afval_alert.model.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Classification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private Melding melding;

    @OneToMany(mappedBy = "classification", cascade = CascadeType.ALL )
    private List<ClassificationLabel> classificationLabels = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    public LocalDateTime createdAt = LocalDateTime.now();

    public LocalDateTime startedAt;

    public LocalDateTime classifiedAt;

    public Melding getMelding() {
        return melding;
    }

    public void setMelding(Melding melding) {
        this.melding = melding;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {}

    public LocalDateTime getClassifiedAt() {
        return startedAt;
    }

    public void setClassifiedAt(LocalDateTime classifiedAt) {}

    public enum Status {
        PENDING,
        RUNNING,
        COMPLETED,
        FAILED
    }
}
