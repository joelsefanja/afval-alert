package com.summerschool.afval_alert.model.entity;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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

    private enum status{
        Nieuw(1),
        MeldingVerwerkt(2),
        WordtOpgehaald(3),
        Opgehaald(4);

        private final int code;

        status(int code) {
            this.code = code;
        }

        public int getCode() {
            return code;
        }

        public static status fromCode(int code) {
            for (status s : status.values()) {
                if(s.getCode() == code) {
                    return s;
                }
            }
            throw new IllegalArgumentException("Invalid code for Status: " + code);
        }
    };

    private enum trashType{
        Kleinvuil(1),
        Glas(2),
        Grofvuil(3);

        private final int code;

        trashType(int code) {
            this.code = code;
        }

        public int getCode() {
            return code;
        }

        public static trashType fromCode(int code) {
            for (trashType t : trashType.values()) {
                if (t.getCode() == code) {
                    return t;
                }
            }
            throw new IllegalArgumentException("Invalid code for TrashType: " + code);
        }
    };

    private status Status;

    private trashType TrashType;

    @OneToMany(mappedBy = "melding", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notitie> notitie = new ArrayList<Notitie>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void setMelding(Float latitude,
                           Float longitude,
                           int trashType) {

        this.latitude = latitude;
        this.longitude = longitude;
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

    public void setStatus(int status) {
        this.Status = Melding.status.fromCode(status);
    }

    public void setTrashType(int trashType) {
        this.TrashType = Melding.trashType.fromCode(trashType);
    }

    public void setNotitie(Notitie notitie) {
        notitie.setMelding(this);
        this.notitie.add(notitie);
    }
}
