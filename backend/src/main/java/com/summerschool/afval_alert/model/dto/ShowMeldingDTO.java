package com.summerschool.afval_alert.model.dto;

import com.summerschool.afval_alert.model.entity.Melding;

import java.time.LocalDateTime;
import java.util.List;

public class ShowMeldingDTO {

    private Long id;
    private double lat;
    private double lon;
    private String comment;
    private String imageUrl;
    private Melding.Status status;
    private List<NotitieDTO> notities;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public double getLat() {
        return lat;
    }

    public void setLat(double lat) {
        this.lat = lat;
    }

    public double getLon() {
        return lon;
    }

    public void setLon(double lon) {
        this.lon = lon;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Melding.Status getStatus() {
        return status;
    }

    public void setStatus(Melding.Status status) {
        this.status = status;
    }

    public List<NotitieDTO> getNotities() {
        return notities;
    }

    public void setNotitie(List<NotitieDTO> notities) {
        this.notities = notities;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
