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
public class MarriageDTO {
    private Long id;
    private Long person1Id;
    private Long person2Id;
    private String person1Name;
    private String person2Name;
    private LocalDate marriageDate;
    private LocalDate divorceDate;
    private String description;
    private Boolean isCurrent;

    public MarriageDTO(Long person1Id, Long person2Id, LocalDate marriageDate) {
        this.person1Id = person1Id;
        this.person2Id = person2Id;
        this.marriageDate = marriageDate;
        this.isCurrent = true;
    }
}