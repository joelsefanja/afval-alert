package com.summerschool.afval_alert.model.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
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

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "image_id")
    private Image image;

    private Boolean isFinalized = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

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

    public void setId(long id) { this.id = id; }

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

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Image getImage() {
        return image;
    }

    public void setImage(Image image) {
        this.image = image;
    }

    public long getId() {
        return id;
    }

    public Boolean getFinalized() {
        return isFinalized;
    }

    public void setFinalized(Boolean finalized) {
        isFinalized = finalized;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
