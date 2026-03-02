# Docker Setup для Family Archive Project

## Требования

- Docker Desktop (Windows/Mac) или Docker Engine + Docker Compose (Linux)
- Минимум 4GB свободной оперативной памяти

## Быстрый старт

1. Клонируйте репозиторий или убедитесь, что все файлы на месте

2. Запустите приложение:
```bash
docker-compose up -d
```

3. Приложение будет доступно по адресу: http://localhost:8080

4. Для просмотра логов:
```bash
docker-compose logs -f backend
```

## Остановка приложения

```bash
docker-compose down
```

## Остановка с удалением данных БД

```bash
docker-compose down -v
```

## Пересборка образа

Если внесли изменения в код:

```bash
docker-compose build --no-cache backend
docker-compose up -d
```

## Структура

- **MySQL**: порт 3306
  - База данных: `family_archive`
  - Пользователь: `root` / `rootpassword`
  - Данные хранятся в volume `mysql_data`

- **Backend (Spring Boot)**: порт 8080
  - Использует Java 22
  - Подключается к MySQL контейнеру
  - Статические файлы из папки `frontend` монтируются как volume

## Переменные окружения

Можно изменить через файл `.env` или напрямую в `docker-compose.yml`:

- `SPRING_DATASOURCE_URL` - URL подключения к БД
- `SPRING_DATASOURCE_USERNAME` - имя пользователя БД
- `SPRING_DATASOURCE_PASSWORD` - пароль БД
- `JWT_SECRET` - секретный ключ для JWT токенов
- `JWT_EXPIRATION` - время жизни токена (в миллисекундах)

## Постоянное хранение данных

- Данные MySQL сохраняются в Docker volume `mysql_data`
- Загруженные фотографии сохраняются в `backend/uploads/photos/`

## Устранение проблем

### Приложение не запускается

1. Проверьте логи: `docker-compose logs backend`
2. Убедитесь, что порты 3306 и 8080 свободны
3. Проверьте, что MySQL контейнер запущен: `docker-compose ps`

### Ошибка подключения к БД

1. Дождитесь полной инициализации MySQL (может занять 30-60 секунд)
2. Проверьте healthcheck MySQL: `docker-compose ps mysql`
3. Проверьте логи MySQL: `docker-compose logs mysql`

### Пересборка с нуля

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

