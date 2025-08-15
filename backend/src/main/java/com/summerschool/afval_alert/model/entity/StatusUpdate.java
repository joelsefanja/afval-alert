package com.summerschool.afval_alert.model.entity;

import jakarta.persistence.*;

import java.util.List;
import java.util.ArrayList;

@Entity
public class StatusUpdate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private int status;

    @OneToMany(mappedBy = "statusUpdate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notitie> notitie = new ArrayList<Notitie>();

    @ManyToOne(optional = false)
    @JoinColumn(name = "melding_id", nullable = false)
    private Melding melding;

    public void setStatusUpdate( int status) {
        this.status = status;
    }

    public void setMelding(Melding melding) {
        this.melding = melding;
    }

    public Melding getMelding() {
        return melding;
    }

    public Long getId() {
        return id;
    }

    public void addNotitie(Notitie notitie) {
        notitie.setStatusUpdate(this);
        this.notitie.add(notitie);
    }

    public List<Notitie> getNotities() {
        return notitie;
    }
}
