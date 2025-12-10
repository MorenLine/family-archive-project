package org.family_tree.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
@Entity
@Table(name = "marriage")
public class Marriage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "husband_id", nullable = false)
    private Person husband;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wife_id", nullable = false)
    private Person wife;

    @Column(name = "marriage_date")
    private LocalDate marriageDate;

    @Column(name = "divorce_date")
    private LocalDate divorceDate;

    @Column(length = 1000)
    private String notes;

    public Marriage() {
    }

    public Marriage(Person husband, Person wife, LocalDate marriageDate) {
        this.husband = husband;
        this.wife = wife;
        this.marriageDate = marriageDate;
    }
}