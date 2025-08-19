package com.summerschool.afval_alert.model.entity;

import jakarta.persistence.*;

@Entity
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Vermijd @Lob voor SQLite omdat het getLob() uitvoert.
    @Column(nullable = false)
    private byte[] data;

    @OneToOne(mappedBy = "image")
    private Melding melding;

    public void setId(Long id) {
        this.id = id;
    }
    public void setData(byte[] data) {
        this.data = data;
    }

    public Long getId() {
        return id;
    }
    public byte[] getData() {
        return data;
    }

}
