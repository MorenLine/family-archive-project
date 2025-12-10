package org.family_tree.model.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PhotoDto {
    private Long id;
    private String fileName;
    private String originalFileName;
    private String description;
    private LocalDate photoDate;
    private Integer sortOrder;
    private Long personId;
}
