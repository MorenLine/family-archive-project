package org.family_tree.command;

import org.family_tree.model.Person;
import org.family_tree.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ListPersonsCommand implements ConsoleCommand {

    private final PersonService personService;

    @Autowired
    public ListPersonsCommand(PersonService personService) {
        this.personService = personService;
    }

    @Override
    public void execute() {
        System.out.println("\n=== СПИСОК ВСЕХ ПЕРСОН ===");

        List<Person> persons = personService.findAll();

        if (persons.isEmpty()) {
            System.out.println("Нет созданных персон");
            return;
        }

        for (Person person : persons) {
            System.out.printf("ID: %d | ФИО: %s | Пол: %s | Родители: %s%n",
                    person.getId(),
                    person.getFullName(),
                    person.getGender().getDisplayName(),
                    getParentsInfo(person));
        }

        System.out.println("\nВсего персон: " + persons.size());
    }

    private String getParentsInfo(Person person) {
        String parent1 = person.getParent1() != null ?
                person.getParent1().getFirstName() : "нет";
        String parent2 = person.getParent2() != null ?
                person.getParent2().getFirstName() : "нет";

        return parent1 + ", " + parent2;
    }

    @Override
    public String getDescription() {
        return "Показать список всех персон";
    }
}