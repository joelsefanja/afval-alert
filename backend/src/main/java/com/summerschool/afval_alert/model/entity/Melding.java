package com.summerschool.afval_alert.model.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Melding {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private double latitude;
    private double longitude;

    @Column(length = 500)
    private String comment;

    private String email;

    private String name;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_id")
    private Image image;

    private Boolean isFinalized = false;

    private String trashType;

    @OneToMany
    @JoinColumn(name = "statusupdate_id")
    private List<StatusUpdate> statusUpdate = new ArrayList<StatusUpdate>();

    public void setMelding(Float latitude,
                           Float longitude,
                           String trashType) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.trashType = trashType;
    }

    public void addStatusUpdate(StatusUpdate statusUpdate) {
        this.statusUpdate.add(statusUpdate);
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public void setImage(Image image) {
        this.image = image;
    }

    public long getId() {
        return id;
    }

    public void setFinalized(Boolean finalized) {
        isFinalized = finalized;
    }
}
