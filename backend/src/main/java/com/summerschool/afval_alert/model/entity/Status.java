package com.summerschool.afval_alert.model.entity;

import jakarta.persistence.*;

@Entity
public class Status {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String status;

    public void setStatus(String status) {
        this.status = status;
    }
}
