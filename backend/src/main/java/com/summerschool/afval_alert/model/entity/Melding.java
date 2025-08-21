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

    private double lat;
    private double lon;

    @Column(length = 500)
    private String comment;

    private String email;

    private String name;

    @OneToOne(fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @JoinColumn(name = "image_id")
    private Image image;

    private Boolean isFinalized = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private Status status;

    @OneToMany(mappedBy = "melding", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notitie> notities = new ArrayList<Notitie>();

    @OneToOne(mappedBy = "melding", cascade = CascadeType.ALL, orphanRemoval = true)
    private Classification classification;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void setId(long id) {
        this.id = id;
    }
    public void setLat(double lat) {
        this.lat = lat;
    }
    public void setLon(double lon) {
        this.lon = lon;
    }
    public void setComment(String comment) {
        this.comment = comment;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public void setName(String name) {
        this.name = name;
    }
    public void setImage(Image image) {
        this.image = image;
    }
    public void setFinalized(Boolean finalized) {
        isFinalized = finalized;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    public void setStatus(Status status) {
        this.status = status;
    }

    public void setNotities(List<Notitie> notities) {
        this.notities = notities;
    }
    public void addNotitie(Notitie notitie) {
        this.notities.add(notitie);
    }


    public long getId() {
        return id;
    }
    public double getLat() {
        return lat;
    }
    public double getLon() {
        return lon;
    }
    public String getComment() {
        return comment;
    }
    public String getEmail() {
        return email;
    }
    public String getName() {
        return name;
    }
    public Image getImage() {
        return image;
    }
    public Boolean getFinalized() {
        return isFinalized;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public Status getStatus() {
        return status;
    }

    public List<Notitie> getNotities() {
        return notities;
    }

    public Classification getClassification() {
        return classification;
    }

    public void setClassification(Classification classification) {
        this.classification = classification;
    }

    public enum Status {
        NIEUW,
        MELDINGVERWERKT,
        WORDTOPGEHAALD,
        OPGEHAALD;
    }
}
