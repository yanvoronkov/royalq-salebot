# Makefile для управления Docker контейнерами

.PHONY: help build up down restart logs clean init-data

# Показать справку
help:
	@echo "Доступные команды:"
	@echo "  build      - Собрать Docker образы"
	@echo "  up         - Запустить все сервисы"
	@echo "  down       - Остановить все сервисы"
	@echo "  restart    - Перезапустить все сервисы"
	@echo "  logs       - Показать логи всех сервисов"
	@echo "  logs-app   - Показать логи приложения"
	@echo "  logs-db    - Показать логи MongoDB"
	@echo "  clean      - Очистить все контейнеры и образы"
	@echo "  init-data  - Инициализировать тестовые данные"
	@echo "  shell      - Войти в контейнер приложения"
	@echo "  db-shell   - Войти в MongoDB shell"

# Сборка образов
build:
	docker-compose build

# Запуск всех сервисов
up:
	docker-compose up -d

# Запуск с пересборкой
up-build:
	docker-compose up --build -d

# Остановка всех сервисов
down:
	docker-compose down

# Перезапуск
restart:
	docker-compose restart

# Логи всех сервисов
logs:
	docker-compose logs -f

# Логи приложения
logs-app:
	docker-compose logs -f app

# Логи MongoDB
logs-db:
	docker-compose logs -f mongodb

# Очистка
clean:
	docker-compose down --rmi all --volumes --remove-orphans
	docker system prune -f

# Инициализация данных
init-data:
	docker-compose exec app node scripts/init-docker-data.js

# Вход в контейнер приложения
shell:
	docker-compose exec app sh

# Вход в MongoDB shell
db-shell:
	docker-compose exec mongodb mongo

# Проверка статуса
status:
	docker-compose ps

# Проверка здоровья
health:
	@echo "Проверка приложения..."
	@curl -f http://localhost:3000 || echo "Приложение недоступно"
	@echo "Проверка MongoDB..."
	@docker-compose exec mongodb mongo --eval "db.adminCommand('ping')" || echo "MongoDB недоступен"
