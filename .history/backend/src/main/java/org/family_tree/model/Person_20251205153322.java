package org.family_tree.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Lob;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "person")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Person {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstName;
    private String lastName;
    private String middleName;
    private LocalDate birthDate;
    private LocalDate deathDate;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String biography;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent1_id")
    @JsonIgnoreProperties({ "parent1", "parent2", "childrenOfParent1", "childrenOfParent2", "photos" })
    private Person parent1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent2_id")
    @JsonIgnoreProperties({ "parent1", "parent2", "childrenOfParent1", "childrenOfParent2", "photos" })
    private Person parent2;

    @OneToMany(mappedBy = "parent1", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({ "parent1", "parent2" })
    private List<Person> childrenOfParent1 = new ArrayList<>();

    @OneToMany(mappedBy = "parent2", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({ "parent1", "parent2" })
    private List<Person> childrenOfParent2 = new ArrayList<>();

    @OneToMany(mappedBy = "person", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("person")
    private List<Photo> photos = new ArrayList<>();

    public Person() {
    }

    public Person(Long id, String firstName, String lastName, String middleName, LocalDate birthDate,
            LocalDate deathDate, Gender gender, String biography) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.middleName = middleName;
        this.birthDate = birthDate;
        this.deathDate = deathDate;
        this.gender = gender;
        this.biography = biography;
    }

    public String getFullName() {
        return lastName + " " + firstName + (middleName != null ? " " + middleName : "");
    }

    public void addPhoto(Photo photo) {
        photos.add(photo);
        photo.setPerson(this);
    }

    public void removePhoto(Photo photo) {
        photos.remove(photo);
        photo.setPerson(null);
    }

    // Геттеры для родителей с проверкой на прокси
    public Person getParent1() {
        if (parent1 != null && org.hibernate.Hibernate.isInitialized(parent1)) {
            return parent1;
        }
        return null;
    }

    public Person getParent2() {
        if (parent2 != null && org.hibernate.Hibernate.isInitialized(parent2)) {
            return parent2;
        }
        return null;
    }

    // Геттеры для ID родителей (чтобы избежать рекурсии)
    public Long getParent1Id() {
        return parent1 != null ? parent1.getId() : null;
    }

    public Long getParent2Id() {
        return parent2 != null ? parent2.getId() : null;
    }
}
