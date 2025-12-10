package org.family_tree.command;

import org.family_tree.model.Gender;
import org.family_tree.model.Person;
import org.family_tree.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Scanner;

@Component
public class CreatePersonCommand implements ConsoleCommand {

    private final PersonService personService;
    private final Scanner scanner;

    @Autowired
    public CreatePersonCommand(PersonService personService) {
        this.personService = personService;
        this.scanner = new Scanner(System.in);
    }

    @Override
    public void execute() {
        System.out.println("\n=== СОЗДАНИЕ НОВОЙ ПЕРСОНЫ ===");

        try {
            // Ввод основных данных
            System.out.print("Введите имя: ");
            String firstName = scanner.nextLine();

            System.out.print("Введите фамилию: ");
            String lastName = scanner.nextLine();

            System.out.print("Введите отчество (если есть): ");
            String middleName = scanner.nextLine();
            if (middleName.trim().isEmpty()) middleName = null;

            // Выбор пола
            Gender gender = selectGender();

            // Ввод даты рождения
            LocalDate birthDate = inputDate("Введите дату рождения (дд.мм.гггг или Enter чтобы пропустить): ");

            // Ввод даты смерти
            LocalDate deathDate = inputDate("Введите дату смерти (дд.мм.гггг или Enter чтобы пропустить): ");

            // Ввод биографии
            System.out.print("Введите биографию (или Enter чтобы пропустить): ");
            String biography = scanner.nextLine();
            if (biography.trim().isEmpty()) biography = null;

            // Создание и сохранение персоны
            Person person = new Person();
            person.setFirstName(firstName);
            person.setLastName(lastName);
            person.setMiddleName(middleName);
            person.setGender(gender);
            person.setBirthDate(birthDate);
            person.setDeathDate(deathDate);
            person.setBiography(biography);

            Person savedPerson = personService.save(person);

            System.out.println("✅ Персона успешно создана!");
            System.out.println("ID: " + savedPerson.getId());
            System.out.println("ФИО: " + savedPerson.getFullName());
            System.out.println("Пол: " + savedPerson.getGender().getDisplayName());

            // Предложить назначить родителей
            offerToSetParents(savedPerson);

        } catch (Exception e) {
            System.out.println("❌ Ошибка при создании персоны: " + e.getMessage());
        }
    }

    private Gender selectGender() {
        while (true) {
            System.out.println("Выберите пол:");
            System.out.println("1 - Мужской");
            System.out.println("2 - Женский");
            System.out.println("3 - Не указан");
            System.out.print("Ваш выбор (1-3): ");

            String choice = scanner.nextLine();
            switch (choice) {
                case "1": return Gender.MALE;
                case "2": return Gender.FEMALE;
                case "3": return Gender.UNKNOWN;
                default:
                    System.out.println("❌ Неверный выбор. Попробуйте снова.");
            }
        }
    }

    private LocalDate inputDate(String prompt) {
        while (true) {
            System.out.print(prompt);
            String input = scanner.nextLine();

            if (input.trim().isEmpty()) {
                return null;
            }

            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
                return LocalDate.parse(input, formatter);
            } catch (Exception e) {
                System.out.println("❌ Неверный формат даты. Используйте дд.мм.гггг");
            }
        }
    }

    private void offerToSetParents(Person person) {
        System.out.print("\nХотите назначить родителей для этой персоны? (y/n): ");
        String choice = scanner.nextLine();

        if (choice.equalsIgnoreCase("y")) {
            SetParentsCommand.setParentsForPerson(personService, person, scanner);
        }
    }

    @Override
    public String getDescription() {
        return "Создать новую персону";
    }
}
