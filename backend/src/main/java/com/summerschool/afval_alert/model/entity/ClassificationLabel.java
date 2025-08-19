package com.summerschool.afval_alert.model.entity;

import jakarta.persistence.*;

@Entity
public class ClassificationLabel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "classification_id", nullable = false)
    private Classification classification;

    @ManyToOne(optional = false)
    @JoinColumn(name = "waste_type_id", nullable = false)
    private WasteType wasteType;

    private Double confidence;
}
