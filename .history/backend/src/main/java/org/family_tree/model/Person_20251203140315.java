package org.family_tree.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "person")
@JsonIgnoreProperties({ "childrenOfParent1", "childrenOfParent2", "photos" })
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

    @Column(length = 50000)
    private String biography;

    @ManyToOne
    @JoinColumn(name = "parent1_id")
    private Person parent1;

    @ManyToOne
    @JoinColumn(name = "parent2_id")
    private Person parent2;

    @OneToMany(mappedBy = "parent1")
    private List<Person> childrenOfParent1 = new ArrayList<>();

    @OneToMany(mappedBy = "parent2")
    private List<Person> childrenOfParent2 = new ArrayList<>();

    @OneToMany(mappedBy = "person", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Photo> photos = new ArrayList<>();

    public Person(Long id, String firstName, String lastName, String middleName, LocalDate birthDate,
            LocalDate deathDate, Gender gender, String biography, Person parent1_id, Person parent2_id,
            List<Person> childrenOfParent1, List<Person> childrenOfParent2) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.middleName = middleName;
        this.birthDate = birthDate;
        this.deathDate = deathDate;
        this.gender = gender;
        this.biography = biography;
        this.parent1 = parent1_id;
        this.parent2 = parent2_id;
        this.childrenOfParent1 = childrenOfParent1;
        this.childrenOfParent2 = childrenOfParent2;
    }

    public Person() {

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

}
