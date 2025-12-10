package org.family_tree.controller;

import org.family_tree.model.Person;
import org.family_tree.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
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
            // Загружаем супруга если есть
            if (p.getSpouse() != null) {
                // Супруг уже загружен через LAZY, но нужно очистить его циклические ссылки
            }
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
    public ResponseEntity<Person> createPerson(@RequestBody Map<String, Object> personData) {
        Person person = new Person();
        person.setFirstName((String) personData.get("firstName"));
        person.setLastName((String) personData.get("lastName"));
        person.setMiddleName((String) personData.get("middleName"));
        person.setGender(org.family_tree.model.Gender.valueOf((String) personData.get("gender")));
        Object birthDateObj = personData.get("birthDate");
        if (birthDateObj != null && !birthDateObj.toString().trim().isEmpty()) {
            person.setBirthDate(java.time.LocalDate.parse(birthDateObj.toString()));
        }
        Object deathDateObj = personData.get("deathDate");
        if (deathDateObj != null && !deathDateObj.toString().trim().isEmpty()) {
            person.setDeathDate(java.time.LocalDate.parse(deathDateObj.toString()));
        }
        person.setBiography((String) personData.get("biography"));
        
        // Обрабатываем родителей
        if (personData.get("parent1") != null) {
            Map<String, Object> parent1Data = (Map<String, Object>) personData.get("parent1");
            Long parent1Id = ((Number) parent1Data.get("id")).longValue();
            Optional<Person> parent1 = personService.findById(parent1Id);
            person.setParent1(parent1.orElse(null));
        }
        if (personData.get("parent2") != null) {
            Map<String, Object> parent2Data = (Map<String, Object>) personData.get("parent2");
            Long parent2Id = ((Number) parent2Data.get("id")).longValue();
            Optional<Person> parent2 = personService.findById(parent2Id);
            person.setParent2(parent2.orElse(null));
        }
        
        // Обрабатываем супруга при создании
        if (personData.get("spouseId") != null) {
            Long spouseId = ((Number) personData.get("spouseId")).longValue();
            Optional<Person> spouse = personService.findById(spouseId);
            if (spouse.isPresent()) {
                person.setSpouse(spouse.get());
                // Устанавливаем обратную связь
                spouse.get().setSpouse(person);
                personService.save(spouse.get());
            }
        }
        
        Person savedPerson = personService.save(person);
        cleanCircularReferences(savedPerson);
        return ResponseEntity.ok(savedPerson);
    }

    @PutMapping("/persons/{id}")
    public ResponseEntity<Person> updatePerson(@PathVariable Long id, @RequestBody Map<String, Object> personData) {
        Optional<Person> personOpt = personService.findByIdWithParents(id);
        if (personOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Person person = personOpt.get();

        // Обновляем только простые поля
        person.setFirstName((String) personData.get("firstName"));
        person.setLastName((String) personData.get("lastName"));
        person.setMiddleName((String) personData.get("middleName"));
        person.setGender(org.family_tree.model.Gender.valueOf((String) personData.get("gender")));
        Object birthDateObj = personData.get("birthDate");
        if (birthDateObj != null && !birthDateObj.toString().trim().isEmpty()) {
            person.setBirthDate(java.time.LocalDate.parse(birthDateObj.toString()));
        } else {
            person.setBirthDate(null);
        }
        Object deathDateObj = personData.get("deathDate");
        if (deathDateObj != null && !deathDateObj.toString().trim().isEmpty()) {
            person.setDeathDate(java.time.LocalDate.parse(deathDateObj.toString()));
        } else {
            person.setDeathDate(null);
        }
        person.setBiography((String) personData.get("biography"));

        // Обновляем родителей через ID (избегаем циклических ссылок)
        if (personData.get("parent1") != null) {
            Map<String, Object> parent1Data = (Map<String, Object>) personData.get("parent1");
            Long parent1Id = ((Number) parent1Data.get("id")).longValue();
            Optional<Person> parent1 = personService.findById(parent1Id);
            person.setParent1(parent1.orElse(null));
        } else {
            person.setParent1(null);
        }

        if (personData.get("parent2") != null) {
            Map<String, Object> parent2Data = (Map<String, Object>) personData.get("parent2");
            Long parent2Id = ((Number) parent2Data.get("id")).longValue();
            Optional<Person> parent2 = personService.findById(parent2Id);
            person.setParent2(parent2.orElse(null));
        } else {
            person.setParent2(null);
        }

        // Обновляем супруга через ID
        if (personData.get("spouseId") != null) {
            Long spouseId = ((Number) personData.get("spouseId")).longValue();
            Optional<Person> spouse = personService.findById(spouseId);
            if (spouse.isPresent()) {
                // Если у текущего супруга был другой супруг, разводим их
                if (person.getSpouse() != null && !person.getSpouse().getId().equals(spouseId)) {
                    Person oldSpouse = person.getSpouse();
                    oldSpouse.setSpouse(null);
                    personService.save(oldSpouse);
                }
                person.setSpouse(spouse.get());
                // Устанавливаем обратную связь
                spouse.get().setSpouse(person);
                personService.save(spouse.get());
            }
        } else {
            // Если убираем супруга, нужно убрать обратную связь
            if (person.getSpouse() != null) {
                Person oldSpouse = person.getSpouse();
                oldSpouse.setSpouse(null);
                personService.save(oldSpouse);
            }
            person.setSpouse(null);
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

        // Очищаем супруга, но оставляем только ID для избежания рекурсии
        if (person.getSpouse() != null) {
            Person spouse = person.getSpouse();
            spouse.setSpouse(null); // Убираем обратную ссылку
            spouse.setChildrenOfParent1(null);
            spouse.setChildrenOfParent2(null);
            spouse.setPhotos(null);
            // Очищаем родителей супруга
            if (spouse.getParent1() != null) {
                spouse.getParent1().setChildrenOfParent1(null);
                spouse.getParent1().setChildrenOfParent2(null);
                spouse.getParent1().setPhotos(null);
            }
            if (spouse.getParent2() != null) {
                spouse.getParent2().setChildrenOfParent1(null);
                spouse.getParent2().setChildrenOfParent2(null);
                spouse.getParent2().setPhotos(null);
            }
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

    @PostMapping("/persons/{id}/marry/{spouseId}")
    public ResponseEntity<Person> marryPersons(@PathVariable Long id, @PathVariable Long spouseId) {
        Optional<Person> personOpt = personService.findById(id);
        Optional<Person> spouseOpt = personService.findById(spouseId);
        
        if (personOpt.isEmpty() || spouseOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Person person = personOpt.get();
        Person spouse = spouseOpt.get();
        
        // Устанавливаем взаимную связь
        person.setSpouse(spouse);
        spouse.setSpouse(person);
        
        personService.save(person);
        personService.save(spouse);
        
        cleanCircularReferences(person);
        return ResponseEntity.ok(person);
    }

    @DeleteMapping("/persons/{id}/divorce")
    public ResponseEntity<Person> divorcePerson(@PathVariable Long id) {
        Optional<Person> personOpt = personService.findById(id);
        
        if (personOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Person person = personOpt.get();
        
        if (person.getSpouse() != null) {
            Person spouse = person.getSpouse();
            person.setSpouse(null);
            spouse.setSpouse(null);
            personService.save(spouse);
        }
        
        personService.save(person);
        cleanCircularReferences(person);
        return ResponseEntity.ok(person);
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