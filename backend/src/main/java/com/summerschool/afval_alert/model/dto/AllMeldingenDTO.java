package com.summerschool.afval_alert.model.dto;

import com.summerschool.afval_alert.model.enums.Status;
import com.summerschool.afval_alert.model.enums.TrashType;

import java.time.LocalDateTime;

public class AllMeldingenDTO {
    private Long id;
    private double lat;
    private double lon;
    private LocalDateTime created_at;
    private TrashType trashType;
    private Status status;

    public Long getId() { return id; }
    public double getLat() { return lat; }
    public double getLon() { return lon; }
    public LocalDateTime getCreated_at() { return created_at; }

    public void setId(Long id) { this.id = id; }
    public void setLat(double lat) { this.lat = lat; }
    public void setLon(double lon) { this.lon = lon; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }

    public TrashType getTrashType() {
        return trashType;
    }

    public void setTrashType(TrashType trashType) {
        this.trashType = trashType;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
}
