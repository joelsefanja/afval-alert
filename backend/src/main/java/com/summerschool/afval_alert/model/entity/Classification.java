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

    @OneToMany(mappedBy = "classification", cascade = CascadeType.ALL )
    private List<ClassificationLabel> classificationLabels = new ArrayList<ClassificationLabel>();

    public LocalDateTime classifiedAt;
}
