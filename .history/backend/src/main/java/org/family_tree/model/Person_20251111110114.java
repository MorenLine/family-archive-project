package org.family_tree.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "person")
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

    public Person(Long id, String firstName, String lastName, String middleName, LocalDate birthDate, LocalDate deathDate, Gender gender, String biography, Person parent1_id, Person parent2_id, List<Person> childrenOfParent1, List<Person> childrenOfParent2) {
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getMiddleName() {
        return middleName;
    }

    public void setMiddleName(String middleName) {
        this.middleName = middleName;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public LocalDate getDeathDate() {
        return deathDate;
    }

    public void setDeathDate(LocalDate deathDate) {
        this.deathDate = deathDate;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public String getBiography() {
        return biography;
    }

    public void setBiography(String biography) {
        this.biography = biography;
    }

    public Person getParent1() {
        return parent1;
    }

    public void setParent1(Person parent1) {
        this.parent1 = parent1;
    }

    public Person getParent2() {
        return parent2;
    }

    public void setParent2(Person parent2) {
        this.parent2 = parent2;
    }

    public List<Person> getChildrenOfParent1() {
        return childrenOfParent1;
    }

    public void setChildrenOfParent1(List<Person> childrenOfParent1) {
        this.childrenOfParent1 = childrenOfParent1;
    }

    public List<Person> getChildrenOfParent2() {
        return childrenOfParent2;
    }

    public void setChildrenOfParent2(List<Person> childrenOfParent2) {
        this.childrenOfParent2 = childrenOfParent2;
    }


    public String getFullName() {
        return lastName + " " + firstName + (middleName != null ? " " + middleName : "");
    }

}
