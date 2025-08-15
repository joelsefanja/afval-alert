package com.summerschool.afval_alert.model.entity;

import jakarta.persistence.*;

@Entity
public class Notitie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  long id;

    private String notitie;

    @ManyToOne(optional = false)
    @JoinColumn(name = "statusUpdate_id", nullable = false)
    private StatusUpdate statusUpdate;

    public Long getId() {
        return id;
    }

    public String getNotitie() {
        return notitie;
    }

    public void setNotitie(String notitie) {
        this.notitie = notitie;
    }

    public void setStatusUpdate(StatusUpdate statusUpdate) {
        this.statusUpdate = statusUpdate;
    }
}
