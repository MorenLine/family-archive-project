package org.family_tree.repository;

import org.family_tree.model.Person;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PersonRepository extends JpaRepository<Person, Long> {
    List<Person> findByParent1OrParent2(Person parent1, Person parent2);

    @Query("select p from Person p where  p.parent1 IS null  AND p.parent2 is null")
    List<Person> findRootPersons();

    @EntityGraph(attributePaths = {"parent1", "parent2"})
    List<Person> findAll();

    @EntityGraph(attributePaths = {"parent1", "parent2"})
    Optional<Person> findById(Long id);

    List<Person> findByLastNameContainingIgnoreCase(String lastName);

    List<Person> findByFirstNameContainingIgnoreCaseAndLastNameContainingIgnoreCase(String firstName, String lastName);

    @Query("SELECT p FROM Person p WHERE p NOT IN (SELECT DISTINCT p1.parent1 FROM Person p1 WHERE p1.parent1 IS NOT NULL) AND p NOT IN (SELECT DISTINCT p2.parent2 FROM Person p2 WHERE p2.parent2 IS NOT NULL)")
    List<Person> findPersonsWithoutChildren();

    @Query("SELECT p FROM Person p WHERE p.parent1 IS NULL AND p.parent2 IS NULL")
    List<Person> findOrphans();
}
