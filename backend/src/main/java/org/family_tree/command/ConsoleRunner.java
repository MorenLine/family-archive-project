package org.family_tree.command;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Scanner;

@Component
public class ConsoleRunner implements CommandLineRunner {

    private final List<ConsoleCommand> commands;
    private final Scanner scanner;

    public ConsoleRunner(List<ConsoleCommand> commands) {
        this.commands = commands;
        this.scanner = new Scanner(System.in);
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🌳 Добро пожаловать в Семейный Архив! 🌳");

        while (true) {
            printMenu();
            System.out.print("\nВыберите действие: ");
            String choice = scanner.nextLine();

            if (choice.equals("0")) {
                System.out.println("До свидания!");
                break;
            }

            try {
                int commandIndex = Integer.parseInt(choice) - 1;
                if (commandIndex >= 0 && commandIndex < commands.size()) {
                    commands.get(commandIndex).execute();
                } else {
                    System.out.println("❌ Неверный выбор. Попробуйте снова.");
                }
            } catch (NumberFormatException e) {
                System.out.println("❌ Введите число от 0 до " + commands.size());
            }

            System.out.println("\n" + "=".repeat(50));
        }

        scanner.close();
    }

    private void printMenu() {
        System.out.println("\n=== ГЛАВНОЕ МЕНЮ ===");
        System.out.println("0 - Выход");

        for (int i = 0; i < commands.size(); i++) {
            System.out.printf("%d - %s%n", i + 1, commands.get(i).getDescription());
        }
    }
}