package com.summerschool.afval_alert.model.dto;

public class PutMeldingDTO {
    private double lat;
    private double lon;
    private String email;
    private String naam;
    private String comment;
    private Long imageId;

    public double getLat() {
        return lat;
    }

    public double getLon() {
        return lon;
    }

    public String getEmail() {
        return email;
    }

    public String getNaam() {
        return naam;
    }

    public String getComment() {
        return comment;
    }

    public Long getImageId() {
        return imageId;
    }
}
