package com.summerschool.afval_alert.model.dto;

import com.summerschool.afval_alert.model.entity.Melding;

public class PutStatusMeldingDTO {
    private Melding.Status status;

    public Melding.Status getStatus() {
        return status;
    }
}
