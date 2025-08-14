package com.summerschool.afval_alert.model.entity;

import jakarta.persistence.*;

@Entity
public class Notitie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  long id;

    private String notitie;

    public void setNotitie(String notitie) {
        this.notitie = notitie;
    }
}
