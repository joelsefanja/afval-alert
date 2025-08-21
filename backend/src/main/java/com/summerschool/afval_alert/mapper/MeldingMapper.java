package com.summerschool.afval_alert.mapper;

import com.summerschool.afval_alert.model.dto.AllMeldingenDTO;
import com.summerschool.afval_alert.model.dto.ShowMeldingDTO;
import com.summerschool.afval_alert.model.dto.WasteTypeDTO;
import com.summerschool.afval_alert.model.entity.ClassificationLabel;
import com.summerschool.afval_alert.model.entity.Melding;
import com.summerschool.afval_alert.model.entity.WasteType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Mapper(componentModel = "spring", uses = NotitieMapper.class)
public interface MeldingMapper extends BaseMapper<ShowMeldingDTO, Melding> {
    // Voor lijstweergave
    @Mapping(source = "createdAt", target = "created_at")
    @Mapping(target = "wastetypes", expression = "java(toWasteTypeDtos(melding))")
    AllMeldingenDTO toAllDto(Melding melding);

    default List<WasteTypeDTO> toWasteTypeDtos(Melding melding) {
        System.out.println("Hit:" + melding.getClassification().getClassificationLabels());

        if (melding == null || melding.getClassification() == null) {
            return List.of();
        }

        return Optional.ofNullable(melding.getClassification().getClassificationLabels())
                .orElse(List.of())
                .stream()
                .map(ClassificationLabel::getWasteType)
                .filter(Objects::nonNull)
                .map(this::mapWasteType)
                .distinct()
                .toList();
    }


    /** Zet een WasteType entity om naar een WasteTypeDTO (gegenereerd door MapStruct). */
    WasteTypeDTO mapWasteType(WasteType wasteType);

    // Voor detailweergave
    @Mapping(
            target = "imageUrl",
            expression = "java(melding.getImage() != null ? \"/api/image/\" + melding.getId() : null)"
    )
    @Mapping(target = "wastetypes", expression = "java(toWasteTypeDtos(melding))")
    ShowMeldingDTO toShowDto(Melding melding);
}
