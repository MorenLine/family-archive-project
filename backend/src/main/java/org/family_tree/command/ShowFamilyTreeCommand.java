package org.family_tree.command;

import org.family_tree.model.Person;
import org.family_tree.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.Scanner;

@Component
public class ShowFamilyTreeCommand implements ConsoleCommand {

    private final PersonService personService;
    private final Scanner scanner;

    @Autowired
    public ShowFamilyTreeCommand(PersonService personService) {
        this.personService = personService;
        this.scanner = new Scanner(System.in);
    }

    @Override
    public void execute() {
        System.out.println("\n=== ПОКАЗАТЬ ГЕНЕАЛОГИЧЕСКОЕ ДЕРЕВО ===");

        try {
            System.out.print("Введите ID корневой персоны: ");
            Long personId = Long.parseLong(scanner.nextLine());

            Optional<Person> personOpt = personService.findById(personId);
            if (personOpt.isEmpty()) {
                System.out.println("❌ Персона с ID " + personId + " не найдена");
                return;
            }

            List<Person> tree = personService.getFamilyTree(personId);
            printTree(tree, personOpt.get(), 0);

        } catch (NumberFormatException e) {
            System.out.println("❌ Неверный формат ID");
        }
    }

    private void printTree(List<Person> tree, Person root, int level) {
        System.out.println("  ".repeat(level) + "└─ " + root.getFullName() +
                " (" + root.getGender().getShortName() + ") ID: " + root.getId());

        List<Person> children = personService.findChildren(root);
        for (Person child : children) {
            if (tree.contains(child)) {
                printTree(tree, child, level + 1);
            }
        }
    }

    @Override
    public String getDescription() {
        return "Показать генеалогическое дерево";
    }
}