package com.summerschool.afval_alert.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Vermijd @Lob voor SQLite omdat het getLob() uitvoert.
    @Column(nullable = false)
    private byte[] data;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public byte[] getData() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Long getId() {
        return id;
    }
}
