package org.family_tree.model.dto;

import lombok.Data;
import org.family_tree.model.Gender;

import java.time.LocalDate;

@Data
public class PersonDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String middleName;
    private LocalDate birthDate;
    private LocalDate deathDate;
    private Gender gender;
    private String biography;
    private Long parent1Id;
    private Long parent2Id;
    private Long spouseId;

    public PersonDTO() {
    }

    public PersonDTO(Long id, String firstName, String lastName, String middleName,
            LocalDate birthDate, LocalDate deathDate, Gender gender,
            String biography, Long parent1Id, Long parent2Id) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.middleName = middleName;
        this.birthDate = birthDate;
        this.deathDate = deathDate;
        this.gender = gender;
        this.biography = biography;
        this.parent1Id = parent1Id;
        this.parent2Id = parent2Id;
        this.spouseId = spouseId;
    }
}