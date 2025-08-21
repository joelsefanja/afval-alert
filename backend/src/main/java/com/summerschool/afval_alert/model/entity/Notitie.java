package com.summerschool.afval_alert.model.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Notitie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    private LocalDateTime createdAt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "melding_id", nullable = false)
    private Melding melding;

    public void setContent(String content) {
        this.content = content;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    public void setMelding(Melding melding) {
        this.melding = melding;
    }

    public String getContent() {
        return content;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public Melding getMelding() {
        return melding;
    }

}
