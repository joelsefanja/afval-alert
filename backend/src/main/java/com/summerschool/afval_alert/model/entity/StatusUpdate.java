package com.summerschool.afval_alert.model.entity;

import jakarta.persistence.*;

import java.util.List;
import java.util.ArrayList;

@Entity
public class StatusUpdate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "status_id")
    private Status status;

    @OneToMany()
    @JoinColumn(name = "notitie_id")
    private List<Notitie> notitie = new ArrayList<Notitie>();

    public void setStatusUpdate(Status status) {
        this.status = status;
    }

    public void addNotitie(Notitie notitie) {
        this.notitie.add(notitie);
    }
}
