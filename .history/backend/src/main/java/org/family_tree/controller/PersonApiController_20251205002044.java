package org.family_tree.controller;

import org.family_tree.model.Gender;
import org.family_tree.model.Person;
import org.family_tree.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Queue;
import java.util.Set;
import java.util.Stack;

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
        try {
            System.out.println("Получен запрос на дерево для ID: " + id + ", глубина: " + depth);

            Optional<Person> rootPersonOpt = personService.findById(id);
            if (rootPersonOpt.isEmpty()) {
                System.out.println("Персона с ID " + id + " не найдена");
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Персона не найдена"));
            }

            Person rootPerson = rootPersonOpt.get();
            System.out.println("Найдена корневая персона: " + rootPerson.getFullName());

            // Ограничиваем глубину разумными пределами
            int safeDepth = Math.max(1, Math.min(depth, 5));

            // Собираем дерево
            Map<String, Object> treeData = buildSimpleTree(rootPerson, safeDepth);

            System.out.println("Дерево построено. Узлов: " +
                    ((List<?>) treeData.get("nodes")).size() +
                    ", Связей: " + ((List<?>) treeData.get("edges")).size());

            return ResponseEntity.ok(treeData);

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Ошибка при построении дерева: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ошибка сервера: " + e.getMessage()));
        }
    }

    private Map<String, Object> buildSimpleTree(Person rootPerson, int maxDepth) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> nodes = new ArrayList<>();
        List<Map<String, Object>> edges = new ArrayList<>();

        // Используем очередь для обхода в ширину
        Queue<Object[]> queue = new LinkedList<>();
        queue.offer(new Object[] { rootPerson, 0, null }); // [person, depth, parentId]

        Set<Long> visited = new HashSet<>();

        while (!queue.isEmpty()) {
            Object[] item = queue.poll();
            Person person = (Person) item[0];
            int depth = (int) item[1];
            Long parentId = (Long) item[2];

            if (person == null || depth > maxDepth) {
                continue;
            }

            // Пропускаем уже обработанных
            if (visited.contains(person.getId())) {
                // Но все равно добавляем связь, если нужно
                if (parentId != null) {
                    addEdgeIfNotExists(edges, parentId, person.getId());
                }
                continue;
            }

            visited.add(person.getId());

            // Создаем узел
            Map<String, Object> node = createSimpleNode(person);
            nodes.add(node);

            // Добавляем связь с родителем
            if (parentId != null) {
                addEdgeIfNotExists(edges, parentId, person.getId());
            }

            // Если достигли максимальной глубины - не идем дальше
            if (depth >= maxDepth) {
                continue;
            }

            // Добавляем родителей (предки)
            if (person.getParent1() != null) {
                queue.offer(new Object[] { person.getParent1(), depth + 1, person.getId() });
            }

            if (person.getParent2() != null) {
                queue.offer(new Object[] { person.getParent2(), depth + 1, person.getId() });
            }

            // Добавляем детей (потомки)
            List<Person> children = personService.findChildren(person.getId());
            for (Person child : children) {
                queue.offer(new Object[] { child, depth + 1, person.getId() });
            }
        }

        result.put("nodes", nodes);
        result.put("edges", edges);
        return result;
    }

    private void addEdgeIfNotExists(List<Map<String, Object>> edges, Long from, Long to) {
        String edgeId = from + "-" + to;
        for (Map<String, Object> edge : edges) {
            if (edge.get("from").equals(from) && edge.get("to").equals(to)) {
                return; // Связь уже существует
            }
        }

        Map<String, Object> edge = new HashMap<>();
        edge.put("id", edgeId);
        edge.put("from", from);
        edge.put("to", to);
        edges.add(edge);
    }

    private Map<String, Object> createSimpleNode(Person person) {
        Map<String, Object> node = new HashMap<>();
        node.put("id", person.getId());

        // Метка узла
        String label = person.getFirstName() + " " + person.getLastName();
        if (person.getBirthDate() != null) {
            label += "\n" + person.getBirthDate().getYear();
        }
        node.put("label", label);

        // Всплывающая подсказка
        StringBuilder tooltip = new StringBuilder();
        tooltip.append("<div style='padding:5px;max-width:250px;text-align:left;'>");
        tooltip.append("<strong>").append(person.getFullName()).append("</strong><br/>");

        if (person.getBirthDate() != null) {
            tooltip.append("Родился: ").append(person.getBirthDate()).append("<br/>");
        }

        if (person.getDeathDate() != null) {
            tooltip.append("Умер: ").append(person.getDeathDate()).append("<br/>");
        }

        if (person.getGender() != null) {
            tooltip.append("Пол: ");
            if (person.getGender().toString().equals("MALE")) {
                tooltip.append("Мужской");
            } else {
                tooltip.append("Женский");
            }
        }

        tooltip.append("</div>");
        node.put("title", tooltip.toString());

        // Цвет в зависимости от пола
        String gender = person.getGender() != null ? person.getGender().toString() : "UNKNOWN";
        Map<String, Object> color = new HashMap<>();

        switch (gender) {
            case "MALE":
                color.put("background", "#d4edda");
                color.put("border", "#28a745");
                break;
            case "FEMALE":
                color.put("background", "#f8d7da");
                color.put("border", "#dc3545");
                break;
            default:
                color.put("background", "#e2e3e5");
                color.put("border", "#6c757d");
                break;
        }

        node.put("color", color);

        // Дополнительные данные
        Map<String, Object> data = new HashMap<>();
        data.put("firstName", person.getFirstName());
        data.put("lastName", person.getLastName());
        data.put("middleName", person.getMiddleName());
        data.put("birthDate", person.getBirthDate() != null ? person.getBirthDate().toString() : null);
        data.put("deathDate", person.getDeathDate() != null ? person.getDeathDate().toString() : null);
        data.put("gender", gender);
        data.put("fullName", person.getFullName());

        node.put("data", data);

        // Стиль узла
        node.put("shape", "box");
        node.put("margin", 8);
        node.put("widthConstraint", 140);
        node.put("heightConstraint", 60);
        node.put("borderWidth", 2);
        node.put("font", Map.of("size", 12));

        return node;
    }
}