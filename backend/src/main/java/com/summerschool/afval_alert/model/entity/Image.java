package com.summerschool.afval_alert.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    private byte[] data;

    private LocalDateTime createdAt;

    public void setData(byte[] data) { this.data = data; }
}
