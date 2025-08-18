package com.summerschool.afval_alert.mapper;

import com.summerschool.afval_alert.model.dto.AllMeldingenDTO;
import com.summerschool.afval_alert.model.dto.ShowMeldingDTO;
import com.summerschool.afval_alert.model.entity.Melding;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = NotitieMapper.class)
public interface MeldingMapper extends BaseMapper<ShowMeldingDTO, Melding> {
    // Voor lijstweergave
    @Mapping(source = "createdAt", target = "created_at")
    AllMeldingenDTO toAllDto(Melding melding);

    // Voor detailweergave
    @Mapping(
            target = "imageUrl",
            expression = "java(melding.getImage() != null ? \"/api/image/\" + melding.getId() : null)"
    )
    ShowMeldingDTO toShowDto(Melding melding);
}
