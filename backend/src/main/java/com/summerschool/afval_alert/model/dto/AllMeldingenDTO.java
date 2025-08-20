package com.summerschool.afval_alert.model.dto;

import com.summerschool.afval_alert.model.entity.Melding;

import java.time.LocalDateTime;

public class AllMeldingenDTO {
    private Long id;
    private double lat;
    private double lon;
    private LocalDateTime created_at;
    private Melding.Status status;

    public void setId(Long id) { this.id = id; }
    public void setLat(double lat) { this.lat = lat; }
    public void setLon(double lon) { this.lon = lon; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }

    public Melding.Status getStatus() {
        return status;
    }

    public void setStatus(Melding.Status status) {
        this.status = status;
    }
}
