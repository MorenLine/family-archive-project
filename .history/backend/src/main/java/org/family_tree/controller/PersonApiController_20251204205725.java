package org.family_tree.controller;

import org.family_tree.model.Person;
import org.family_tree.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5500") // Для разработки
public class PersonApiController {

    private final PersonService personService;

    @Autowired
    public PersonApiController(PersonService personService) {
        this.personService = personService;
    }

    @GetMapping("/persons")
    public List<Person> getAllPersons() {
        return personService.findAll();
    }

    @GetMapping("/persons/{id}")
    public ResponseEntity<Person> getPerson(@PathVariable Long id) {
        Optional<Person> person = personService.findById(id);
        return person.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/persons")
    public Person createPerson(@RequestBody Person person) {
        return personService.save(person);
    }

    @PutMapping("/persons/{id}")
    public ResponseEntity<Person> updatePerson(@PathVariable Long id, @RequestBody Person personDetails) {
        Optional<Person> personOpt = personService.findById(id);
        if (personOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Person person = personOpt.get();
        // Обновляем поля
        person.setFirstName(personDetails.getFirstName());
        person.setLastName(personDetails.getLastName());
        person.setMiddleName(personDetails.getMiddleName());
        person.setGender(personDetails.getGender());
        person.setBirthDate(personDetails.getBirthDate());
        person.setDeathDate(personDetails.getDeathDate());
        person.setBiography(personDetails.getBiography());

        // Обновляем родителей если они указаны в запросе
        if (personDetails.getParent1() != null) {
            Optional<Person> parent1 = personService.findById(personDetails.getParent1().getId());
            person.setParent1(parent1.orElse(null));
        } else {
            person.setParent1(null);
        }

        if (personDetails.getParent2() != null) {
            Optional<Person> parent2 = personService.findById(personDetails.getParent2().getId());
            person.setParent2(parent2.orElse(null));
        } else {
            person.setParent2(null);
        }

        Person updatedPerson = personService.save(person);
        return ResponseEntity.ok(updatedPerson);
    }

    @DeleteMapping("/persons/{id}")
    public ResponseEntity<?> deletePerson(@PathVariable Long id) {
        personService.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/tree/{personId}")
    public ResponseEntity<?> getFamilyTree(@PathVariable Long personId) {
        // Собираем узлы и связи для дерева, включаем предков и потомков
        Optional<Person> rootOpt = personService.findById(personId);
        if (rootOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Person root = rootOpt.get();

        // Получаем предков и потомков (с ограничением глубины в сервисе)
        List<Person> ancestors = personService.getAncestors(personId);
        List<Person> descendants = personService.getDescendants(personId);

        // Собираем уникальный набор персон включающий корень
        Map<Long, Person> personsMap = new HashMap<>();
        personsMap.put(root.getId(), root);
        for (Person p : ancestors) personsMap.put(p.getId(), p);
        for (Person p : descendants) personsMap.put(p.getId(), p);

        // Подготавливаем nodes и edges
        List<Map<String, Object>> nodes = new ArrayList<>();
        List<Map<String, Object>> edges = new ArrayList<>();

        for (Person p : personsMap.values()) {
            String label = (p.getLastName() != null ? p.getLastName() + " " : "")
                    + (p.getFirstName() != null ? p.getFirstName() : "");
            if (p.getBirthDate() != null) label += " (" + p.getBirthDate().getYear() + ")";

            Map<String, Object> node = new HashMap<>();
            node.put("id", p.getId());
            node.put("label", label);
            node.put("firstName", p.getFirstName());
            node.put("lastName", p.getLastName());
            node.put("middleName", p.getMiddleName());
            node.put("birthDate", p.getBirthDate());
            node.put("deathDate", p.getDeathDate());
            nodes.add(node);
        }

        // Для связей добавляем parent -> child
        Set<String> addedEdges = new HashSet<>();
        for (Person p : personsMap.values()) {
            if (p.getParent1() != null && personsMap.containsKey(p.getParent1().getId())) {
                String key = p.getParent1().getId() + "-" + p.getId();
                if (!addedEdges.contains(key)) {
                    Map<String, Object> edge = new HashMap<>();
                    edge.put("from", p.getParent1().getId());
                    edge.put("to", p.getId());
                    edges.add(edge);
                    addedEdges.add(key);
                }
            }
            if (p.getParent2() != null && personsMap.containsKey(p.getParent2().getId())) {
                String key = p.getParent2().getId() + "-" + p.getId();
                if (!addedEdges.contains(key)) {
                    Map<String, Object> edge = new HashMap<>();
                    edge.put("from", p.getParent2().getId());
                    edge.put("to", p.getId());
                    edges.add(edge);
                    addedEdges.add(key);
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("nodes", nodes);
        result.put("edges", edges);

        return ResponseEntity.ok(result);
    }
}