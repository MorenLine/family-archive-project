package org.family_tree.service;

import jakarta.transaction.Transactional;
import org.family_tree.model.Gender;
import org.family_tree.model.Person;
import org.family_tree.repository.PersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PersonService {
    private final PersonRepository personRepository;

    @Autowired
    public PersonService(PersonRepository personRepository) {
        this.personRepository = personRepository;
    }

    public List<Person> findAll() {
        return personRepository.findAll();
    }

    // Backwards-compatible method expected by some controllers
    public List<Person> findAllWithRelations() {
        return personRepository.findAll();
    }

    public Optional<Person> findById(Long id) {
        return personRepository.findById(id);
    }

    public Optional<Person> findByIdWithParents(Long id) {
        return personRepository.findByIdWithParents(id);
    }

    public Person save(Person person) {
        return personRepository.save(person);
    }

    public void deleteById(Long id) {
        personRepository.deleteById(id);
    }

    public List<Person> findByLastName(String lastName) {
        return personRepository.findByLastNameContainingIgnoreCase(lastName);
    }

    public List<Person> findRootPersons() {
        return personRepository.findRootPersons();
    }

    public List<Person> findByGender(Gender gender) {
        return personRepository.findAll().stream()
                .filter(person -> person.getGender() == gender)
                .toList();
    }

    public List<Person> findChildren(Person person) {
        return personRepository.findByParent1OrParent2(person, person);
    }

    public List<Person> findChildren(Long personId) {
        Optional<Person> person = personRepository.findById(personId);
        return person.map(this::findChildren).orElse(new ArrayList<>());
    }

    public Optional<Person> getParent1(Person person) {
        return Optional.ofNullable(person.getParent1());
    }

    public Optional<Person> getParent2(Person person) {
        return Optional.ofNullable(person.getParent2());
    }

    public void setParent1(Long childId, Long parentId) {
        Person child = personRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Человек не найден с ID: " + childId));
        Person parent = personRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Родитель не найден с ID: " + parentId));

        child.setParent1(parent);
        personRepository.save(child);
    }

    public void setParent2(Long childId, Long parentId) {
        Person child = personRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Человек не найден с ID: " + childId));
        Person parent = personRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Родитель не найден с ID: " + parentId));

        child.setParent2(parent);
        personRepository.save(child);
    }

    public void setParents(Long childId, Long parent1Id, Long parent2Id) {
        Person child = personRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Человек не найден с ID: " + childId));

        Person parent1 = personRepository.findById(parent1Id)
                .orElseThrow(() -> new RuntimeException("Первый родитель не найден с ID: " + parent1Id));

        Person parent2 = personRepository.findById(parent2Id)
                .orElseThrow(() -> new RuntimeException("Второй родитель не найден с ID: " + parent2Id));

        child.setParent1(parent1);
        child.setParent2(parent2);
        personRepository.save(child);
    }

    public void removeParents(Long childId) {
        Person child = personRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Человек не найден с ID: " + childId));

        child.setParent1(null);
        child.setParent2(null);
        personRepository.save(child);
    }

    public List<Person> getAncestors(Long personId) {
        List<Person> ancestors = new ArrayList<>();
        getAncestorsRecursive(personId, ancestors, 0);
        return ancestors;
    }

    private void getAncestorsRecursive(Long personId, List<Person> ancestors, int level) {
        if (level > 10)
            return; // Защита от бесконечной рекурсии

        Optional<Person> personOpt = findById(personId);
        if (personOpt.isEmpty())
            return;

        Person person = personOpt.get();

        // Добавляем родителей
        if (person.getParent1() != null) {
            ancestors.add(person.getParent1());
            getAncestorsRecursive(person.getParent1().getId(), ancestors, level + 1);
        }

        if (person.getParent2() != null) {
            ancestors.add(person.getParent2());
            getAncestorsRecursive(person.getParent2().getId(), ancestors, level + 1);
        }
    }

    public List<Person> getDescendants(Long personId) {
        List<Person> descendants = new ArrayList<>();
        getDescendantsRecursive(personId, descendants, 0);
        return descendants;
    }

    private void getDescendantsRecursive(Long personId, List<Person> descendants, int level) {
        if (level > 10)
            return; // Защита от бесконечной рекурсии

        List<Person> children = findChildren(personId);
        descendants.addAll(children);

        for (Person child : children) {
            getDescendantsRecursive(child.getId(), descendants, level + 1);
        }
    }

    public List<Person> getFamilyTree(Long rootPersonId) {
        List<Person> tree = new ArrayList<>();
        buildFamilyTreeRecursive(rootPersonId, tree, 0);
        return tree;
    }

    private void buildFamilyTreeRecursive(Long personId, List<Person> tree, int level) {
        if (level > 5)
            return; // Ограничиваем глубину дерева

        Optional<Person> personOpt = findById(personId);
        if (personOpt.isEmpty())
            return;

        Person person = personOpt.get();
        tree.add(person);

        // Добавляем детей
        List<Person> children = findChildren(personId);
        for (Person child : children) {
            buildFamilyTreeRecursive(child.getId(), tree, level + 1);
        }
    }

    public boolean isAncestor(Long potentialAncestorId, Long personId) {
        List<Person> ancestors = getAncestors(personId);
        return ancestors.stream()
                .anyMatch(ancestor -> ancestor.getId().equals(potentialAncestorId));
    }

    public ArchiveStatistics getArchiveStatistics() {
        List<Person> allPersons = findAll();

        long totalPersons = allPersons.size();
        long males = allPersons.stream().filter(p -> p.getGender() == Gender.MALE).count();
        long females = allPersons.stream().filter(p -> p.getGender() == Gender.FEMALE).count();
        long living = allPersons.stream().filter(p -> p.getDeathDate() == null).count();
        long withPhotos = allPersons.stream().filter(p -> p.getBiography() != null && !p.getBiography().isEmpty())
                .count();

        return new ArchiveStatistics(totalPersons, males, females, living, withPhotos);
    }

    public List<Person> findByBirthDateRange(LocalDate startDate, LocalDate endDate) {
        return personRepository.findAll().stream()
                .filter(person -> person.getBirthDate() != null)
                .filter(person -> !person.getBirthDate().isBefore(startDate) &&
                        !person.getBirthDate().isAfter(endDate))
                .toList();
    }

    public static class ArchiveStatistics {
        private final long totalPersons;
        private final long males;
        private final long females;
        private final long living;
        private final long withBiography;

        public ArchiveStatistics(long totalPersons, long males, long females, long living, long withBiography) {
            this.totalPersons = totalPersons;
            this.males = males;
            this.females = females;
            this.living = living;
            this.withBiography = withBiography;
        }

        // Геттеры
        public long getTotalPersons() {
            return totalPersons;
        }

        public long getMales() {
            return males;
        }

        public long getFemales() {
            return females;
        }

        public long getLiving() {
            return living;
        }

        public long getWithBiography() {
            return withBiography;
        }
    }
}