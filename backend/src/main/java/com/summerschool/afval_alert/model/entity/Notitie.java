package com.summerschool.afval_alert.model.entity;

import jakarta.persistence.*;

@Entity
public class Notitie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  long id;

    private String notitie;

    @ManyToOne(optional = false)
    @JoinColumn(name = "melding_id", nullable = false)
    private Melding melding;

    public Long getId() {
        return id;
    }

    public String getNotitie() {
        return notitie;
    }

    public void setNotitie(String notitie) {
        this.notitie = notitie;
    }

    public void setMelding(Melding melding) {
        this.melding = melding;
    }
}
