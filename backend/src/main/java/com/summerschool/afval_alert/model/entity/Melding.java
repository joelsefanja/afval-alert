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

    @OneToOne
    @JoinColumn(name = "id")
    private Image image;

    private String trashType;

    @OneToMany
    @JoinColumn(name = "statusupdate_id")
    private List<StatusUpdate> statusUpdate = new ArrayList<StatusUpdate>();

    public void setMelding(Float latitude,
                           Float longitude,
                           Image imageId,
                           String trashType) {

        this.latitude = latitude;
        this.longitude = longitude;
        this.trashType = trashType;
        this.image = imageId;
    }

    public void addStatusUpdate(StatusUpdate statusUpdate) {
        this.statusUpdate.add(statusUpdate);
    }

    public Long getId() {
        return id;
    }
}
