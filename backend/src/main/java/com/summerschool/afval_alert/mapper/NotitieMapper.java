package com.summerschool.afval_alert.mapper;

import com.summerschool.afval_alert.model.dto.NotitieDTO;
import com.summerschool.afval_alert.model.dto.ShowMeldingDTO;
import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.model.entity.Notitie;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotitieMapper extends BaseMapper<ShowMeldingDTO, Melding>{
    NotitieDTO toDto(Notitie entity);

    Notitie toEntity(NotitieDTO dto);
}
