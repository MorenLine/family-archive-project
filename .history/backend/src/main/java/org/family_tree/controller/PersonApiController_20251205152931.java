package org.family_tree.controller;

import org.family_tree.model.Person;
import org.family_tree.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5500")
public class PersonApiController {

    private final PersonService personService;

    @Autowired
    public PersonApiController(PersonService personService) {
        this.personService = personService;
    }

    @GetMapping("/persons")
    public ResponseEntity<List<Person>> getAllPersons() {
        List<Person> persons = personService.findAllWithRelations();
        // Очищаем циклические ссылки
        persons.forEach(this::cleanCircularReferences);
        return ResponseEntity.ok(persons);
    }

    @GetMapping("/persons/{id}")
    public ResponseEntity<Person> getPerson(@PathVariable Long id) {
        Optional<Person> person = personService.findByIdWithParents(id);
        return person.map(p -> {
            cleanCircularReferences(p);
            return ResponseEntity.ok(p);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/persons/{id}/children")
    public ResponseEntity<List<Person>> getChildren(@PathVariable Long id) {
        List<Person> children = personService.findChildren(id);
        children.forEach(this::cleanCircularReferences);
        return ResponseEntity.ok(children);
    }

    @PostMapping("/persons")
    public ResponseEntity<Person> createPerson(@RequestBody Person person) {
        Person savedPerson = personService.save(person);
        cleanCircularReferences(savedPerson);
        return ResponseEntity.ok(savedPerson);
    }

    @PutMapping("/persons/{id}")
    public ResponseEntity<Person> updatePerson(@PathVariable Long id, @RequestBody Person personDetails) {
        Optional<Person> personOpt = personService.findByIdWithParents(id);
        if (personOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Person person = personOpt.get();

        // Обновляем только простые поля
        person.setFirstName(personDetails.getFirstName());
        person.setLastName(personDetails.getLastName());
        person.setMiddleName(personDetails.getMiddleName());
        person.setGender(personDetails.getGender());
        person.setBirthDate(personDetails.getBirthDate());
        person.setDeathDate(personDetails.getDeathDate());
        person.setBiography(personDetails.getBiography());

        // Обновляем родителей через ID (избегаем циклических ссылок)
        if (personDetails.getParent1Id() != null) {
            Optional<Person> parent1 = personService.findById(personDetails.getParent1Id());
            person.setParent1(parent1.orElse(null));
        } else {
            person.setParent1(null);
        }

        if (personDetails.getParent2Id() != null) {
            Optional<Person> parent2 = personService.findById(personDetails.getParent2Id());
            person.setParent2(parent2.orElse(null));
        } else {
            person.setParent2(null);
        }

        Person updatedPerson = personService.save(person);
        cleanCircularReferences(updatedPerson);
        return ResponseEntity.ok(updatedPerson);
    }

    @DeleteMapping("/persons/{id}")
    public ResponseEntity<?> deletePerson(@PathVariable Long id) {
        personService.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Вспомогательный метод для очистки циклических ссылок
    private void cleanCircularReferences(Person person) {
        if (person == null)
            return;

        // Очищаем ссылки на детей, чтобы избежать рекурсии
        person.setChildrenOfParent1(null);
        person.setChildrenOfParent2(null);

        // Очищаем фото
        person.setPhotos(null);

        // Если родители есть, очищаем у них ссылки на детей
        if (person.getParent1() != null) {
            Person parent1 = person.getParent1();
            parent1.setChildrenOfParent1(null);
            parent1.setChildrenOfParent2(null);
            parent1.setPhotos(null);
        }

        if (person.getParent2() != null) {
            Person parent2 = person.getParent2();
            parent2.setChildrenOfParent1(null);
            parent2.setChildrenOfParent2(null);
            parent2.setPhotos(null);
        }
    }

    // Создаем DTO для передачи данных о родителях без рекурсии
    @GetMapping("/persons/{id}/parents")
    public ResponseEntity<PersonParentsDTO> getParents(@PathVariable Long id) {
        Optional<Person> personOpt = personService.findByIdWithParents(id);
        if (personOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Person person = personOpt.get();
        PersonParentsDTO dto = new PersonParentsDTO(
                person.getId(),
                person.getParent1Id(),
                person.getParent2Id());

        return ResponseEntity.ok(dto);
    }

    // DTO для родителей
    public static class PersonParentsDTO {
        private Long personId;
        private Long parent1Id;
        private Long parent2Id;

        public PersonParentsDTO(Long personId, Long parent1Id, Long parent2Id) {
            this.personId = personId;
            this.parent1Id = parent1Id;
            this.parent2Id = parent2Id;
        }

        // геттеры и сеттеры
        public Long getPersonId() {
            return personId;
        }

        public void setPersonId(Long personId) {
            this.personId = personId;
        }

        public Long getParent1Id() {
            return parent1Id;
        }

        public void setParent1Id(Long parent1Id) {
            this.parent1Id = parent1Id;
        }

        public Long getParent2Id() {
            return parent2Id;
        }

        public void setParent2Id(Long parent2Id) {
            this.parent2Id = parent2Id;
        }
    }
}