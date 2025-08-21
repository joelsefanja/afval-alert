package com.summerschool.afval_alert.mapper;

import com.summerschool.afval_alert.model.dto.NotitieDTO;
import com.summerschool.afval_alert.model.dto.WasteTypeDTO;
import com.summerschool.afval_alert.model.entity.Notitie;
import com.summerschool.afval_alert.model.entity.WasteType;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = WasteTypeMapper.class)
public interface WasteTypeMapper extends BaseMapper<WasteTypeDTO, WasteType> {

    WasteTypeDTO toDto(WasteType entity);

    WasteType toEntity(WasteTypeDTO dto);
}