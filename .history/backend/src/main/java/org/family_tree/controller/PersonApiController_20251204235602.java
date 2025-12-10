package org.family_tree.controller;

import org.family_tree.model.Gender;
import org.family_tree.model.Person;
import org.family_tree.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

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
        // Возвращаем данные для построения дерева
        // В формате для vis.js: { nodes: [], edges: [] }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/persons/{id}/tree-data")
    public ResponseEntity<Map<String, Object>> getTreeData(@PathVariable Long id,
            @RequestParam(defaultValue = "3") int depth) {
        Optional<Person> rootPersonOpt = personService.findById(id);
        if (rootPersonOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Person rootPerson = rootPersonOpt.get();

        // Собираем все узлы и связи в пределах указанной глубины
        Map<String, Object> treeData = buildTreeData(rootPerson, depth);

        return ResponseEntity.ok(treeData);
    }

    private Map<String, Object> buildTreeData(Person rootPerson, int maxDepth) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> nodes = new ArrayList<>();
        List<Map<String, Object>> edges = new ArrayList<>();
        Set<Long> processedIds = new HashSet<>();

        // Рекурсивно собираем дерево
        collectTreeNodes(rootPerson, nodes, edges, processedIds, 0, maxDepth, null);

        result.put("nodes", nodes);
        result.put("edges", edges);
        return result;
    }

    private void collectTreeNodes(Person person, List<Map<String, Object>> nodes, 
                                  List<Map<String, Object>> edges, Set<Long> processedIds,
                                  int currentDepth, int maxDepth, Long parentId) {
        
        if (person == null || processedIds.contains(person.getId()) || currentDepth > maxDepth) {
            return;
        }

        processedIds.add(person.getId());

        // Создаем узел для текущей персоны
        Map<String, Object> node = new HashMap<>();
        node.put("id", person.getId());
        node.put("label", person.getFirstName() + " " + person.getLastName());
        node.put("title", getPersonTooltip(person));
        
        // Настройка внешнего вида узла
        node.put("shape", "box");
        node.put("margin", 10);
        node.put("widthConstraint", 150);
        
        // Цвет в зависимости от пола
        if (person.getGender() != null) {
            if (person.getGender().toString().equals("MALE")) {
                node.put("color", {
                    "background": "#d4edda",
                    "border": "#28a745",
                    "highlight": {
                        "background": "#c3e6cb",
                        "border": "#1e7e34"
                    }
                });
            } else {
                node.put("color", {
                    "background": "#f8d7da",
                    "border": "#dc3545",
                    "highlight": {
                        "background": "#f5c6cb",
                        "border": "#bd2130"
                    }
                });
            }
        }
        
        // Дополнительные данные для клиента
        Map<String, Object> data = new HashMap<>();
        data.put("firstName", person.getFirstName());
        data.put("lastName", person.getLastName());
        data.put("birthDate", person.getBirthDate());
        data.put("deathDate", person.getDeathDate());
        data.put("gender", person.getGender());
        data.put("fullName", person.getFullName());
        node.put("data", data);
        
        nodes.add(node);

        // Добавляем связь с родителем (если есть)
        if (parentId != null) {
            Map<String, Object> edge = new HashMap<>();
            edge.put("from", parentId);
            edge.put("to", person.getId());
            edge.put("arrows", "to");
            edges.add(edge);
        }

        // Если достигли максимальной глубины - не идем дальше
        if (currentDepth >= maxDepth) {
            return;
        }

        // Обрабатываем родителей (идем вверх по дереву)
        if (person.getParent1() != null) {
            collectTreeNodes(person.getParent1(), nodes, edges, processedIds, 
                           currentDepth + 1, maxDepth, person.getId());
        }
        
        if (person.getParent2() != null) {
            collectTreeNodes(person.getParent2(), nodes, edges, processedIds, 
                           currentDepth + 1, maxDepth, person.getId());
        }

        // Обрабатываем детей (идем вниз по дереву)
        List<Person> children = personService.findChildren(person);
        for (Person child : children) {
            collectTreeNodes(child, nodes, edges, processedIds, 
                           currentDepth + 1, maxDepth, person.getId());
        }
    }

    private String getPersonTooltip(Person person) {
        StringBuilder tooltip = new StringBuilder();
        tooltip.append("<div style='text-align:left;padding:5px'>");
        tooltip.append("<strong>").append(person.getFullName()).append("</strong><br/>");

        if (person.getBirthDate() != null) {
            tooltip.append("Родился: ").append(person.getBirthDate()).append("<br/>");
        }

        if (person.getDeathDate() != null) {
            tooltip.append("Умер: ").append(person.getDeathDate()).append("<br/>");
        }

        if (person.getGender() != null) {
            tooltip.append("Пол: ").append(person.getGender() == Gender.MALE ? "Мужской" : "Женский");
        }

        tooltip.append("</div>");
        return tooltip.toString();
    }
}