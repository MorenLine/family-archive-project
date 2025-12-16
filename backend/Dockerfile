# Используем официальный образ Maven с Java 22
FROM maven:3.9-eclipse-temurin-22 AS build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем pom.xml и загружаем зависимости (кэшируем слой)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Копируем исходный код
COPY src ./src

# Собираем приложение
RUN mvn clean package -DskipTests

# Финальный образ
FROM eclipse-temurin:22-jre-jammy

WORKDIR /app

# Копируем собранный JAR файл из стадии сборки
COPY --from=build /app/target/*.war app.war

# Создаем директории для uploads и frontend
RUN mkdir -p /app/uploads/photos && \
    mkdir -p /app/frontend

# Открываем порт 8080
EXPOSE 8080

# Запускаем приложение
# Переменные окружения передаются через docker-compose.yml
ENTRYPOINT ["java", "-jar", "app.war"]

