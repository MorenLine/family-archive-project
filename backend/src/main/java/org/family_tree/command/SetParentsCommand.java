package org.family_tree.command;

import org.family_tree.model.Person;
import org.family_tree.service.PersonService;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.Scanner;

@Component
public class SetParentsCommand implements ConsoleCommand {

    private final PersonService personService;
    private final Scanner scanner;

    public SetParentsCommand(PersonService personService) {
        this.personService = personService;
        this.scanner = new Scanner(System.in);
    }

    @Override
    public void execute() {
        System.out.println("\n=== НАЗНАЧЕНИЕ РОДИТЕЛЕЙ ===");

        try {
            // Выбор персоны для которой назначаем родителей
            System.out.print("Введите ID персоны: ");
            Long personId = Long.parseLong(scanner.nextLine());

            Optional<Person> personOpt = personService.findById(personId);
            if (personOpt.isEmpty()) {
                System.out.println("❌ Персона с ID " + personId + " не найдена");
                return;
            }

            setParentsForPerson(personService, personOpt.get(), scanner);

        } catch (NumberFormatException e) {
            System.out.println("❌ Неверный формат ID");
        } catch (Exception e) {
            System.out.println("❌ Ошибка: " + e.getMessage());
        }
    }

    public static void setParentsForPerson(PersonService personService, Person person, Scanner scanner) {
        System.out.println("\nНазначение родителей для: " + person.getFullName());

        // Поиск существующих персон для назначения родителями
        List<Person> allPersons = personService.findAll();

        // Фильтруем, исключая саму персону и её потомков
        List<Person> availableParents = allPersons.stream()
                .filter(p -> !p.getId().equals(person.getId()))
                .filter(p -> !personService.isAncestor(person.getId(), p.getId()))
                .toList();

        if (availableParents.isEmpty()) {
            System.out.println("❌ Нет доступных персон для назначения родителями");
            return;
        }

        System.out.println("\nДоступные персоны для назначения родителями:");
        for (Person p : availableParents) {
            System.out.printf("ID: %d, ФИО: %s, Пол: %s%n",
                    p.getId(), p.getFullName(), p.getGender().getDisplayName());
        }

        // Назначение первого родителя
        Long parent1Id = selectParent("первого", availableParents, scanner);
        Long parent2Id = selectParent("второго", availableParents, scanner);

        if (parent1Id != null || parent2Id != null) {
            try {
                personService.setParents(person.getId(), parent1Id, parent2Id);
                System.out.println("✅ Родители успешно назначены!");
            } catch (Exception e) {
                System.out.println("❌ Ошибка при назначении родителей: " + e.getMessage());
            }
        }
    }

    private static Long selectParent(String parentType, List<Person> availableParents, Scanner scanner) {
        System.out.printf("\nВыберите %s родителя (введите ID или 0 чтобы пропустить): ", parentType);

        try {
            Long parentId = Long.parseLong(scanner.nextLine());
            if (parentId == 0) return null;

            boolean exists = availableParents.stream()
                    .anyMatch(p -> p.getId().equals(parentId));

            if (exists) {
                return parentId;
            } else {
                System.out.println("❌ Персона с таким ID не найдена в списке доступных");
                return selectParent(parentType, availableParents, scanner);
            }
        } catch (NumberFormatException e) {
            System.out.println("❌ Неверный формат ID");
            return selectParent(parentType, availableParents, scanner);
        }
    }

    @Override
    public String getDescription() {
        return "Назначить родителей для персоны";
    }
}
