package com.summerschool.afval_alert.model.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Melding {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private Float latitude;
    private Float longitude;

    @Lob
    private byte[] imageData;

    private String trashType;

    @OneToMany
    @JoinColumn(name = "statusupdate_id")
    private List<StatusUpdate> statusUpdate = new ArrayList<StatusUpdate>();

    public void setMelding(Float latitude,
                           Float longitude,
                           byte[] imageData,
                           String trashType) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.imageData = imageData;
        this.trashType = trashType;
    }

    public void addStatusUpdate(StatusUpdate statusUpdate) {
        this.statusUpdate.add(statusUpdate);
    }
}
