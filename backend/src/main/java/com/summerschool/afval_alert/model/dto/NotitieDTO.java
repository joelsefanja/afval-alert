package com.summerschool.afval_alert.model.dto;

import java.time.LocalDateTime;

public class NotitieDTO {
    private String content;
    private LocalDateTime createdAt;

    public void setContent(String content) {
        this.content = content;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getContent() {
        return content;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
