# 🐳 Docker развертывание RoyalQ Salebot

## 📋 Быстрый старт

### 1. Запуск приложения
```bash
# Запуск всех сервисов
make up-build

# Или через docker-compose
docker-compose up --build -d
```

### 2. Инициализация данных
```bash
# Создание тестовых данных
make init-data

# Или напрямую
mdr
docker-compose exec app node scripts/init-docker-data.js
```

### 3. Проверка работы
```bash
# Проверка статуса
make status

# Проверка здоровья
make health

# Открыть в браузере
open http://localhost:3000
```

## 🔧 Управление контейнерами

### Основные команды
```bash
make help          # Показать все команды
make build         # Собрать образы
make up            # Запустить сервисы
make down          # Остановить сервисы
make restart       # Перезапустить
make logs          # Показать логи
make clean         # Очистить все
```

### Логи
```bash
make logs          # Все сервисы
make logs-app      # Только приложение
make logs-db       # Только MongoDB
```

### Отладка
```bash
make shell         # Войти в контейнер приложения
make db-shell      # Войти в MongoDB shell
```

## 🌐 Доступ к сервисам

- **Приложение**: http://localhost:3000
- **Nginx**: http://localhost:80
- **MongoDB**: localhost:27017

## 📊 Структура сервисов

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   Приложение    │    │    MongoDB      │
│   (Порт 80)     │───►│   (Порт 3000)   │───►│   (Порт 27017)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔐 Переменные окружения

### Приложение (.env)
```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://admin:password123@mongodb:27017/royalq-salebot?authSource=admin
SALEBOT_API_BASE_URL=https://api.salebot.pro
SALEBOT_API_KEY=your_api_key_here
```

### MongoDB
```bash
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password123
MONGO_INITDB_DATABASE=royalq-salebot
```

## 🗄️ Данные

### Volumes
- `mongodb_data` - данные MongoDB
- `./logs` - логи приложения

### Инициализация
- `scripts/mongo-init.js` - настройка MongoDB
- `scripts/init-docker-data.js` - тестовые данные

## 🚨 Troubleshooting

### Проблемы с запуском
```bash
# Проверка логов
make logs

# Перезапуск с пересборкой
make up-build

# Полная очистка
make clean
make up-build
```

### Проблемы с базой данных
```bash
# Проверка MongoDB
make db-shell

# Пересоздание данных
make down
docker volume rm royalq-salebot_mongodb_data
make up-build
make init-data
```

### Проблемы с портами
```bash
# Проверка занятых портов
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :27017

# Остановка конфликтующих сервисов
sudo systemctl stop mongodb
sudo systemctl stop nginx
```

## 📈 Мониторинг

### Проверка ресурсов
```bash
# Использование ресурсов контейнерами
docker stats

# Логи в реальном времени
make logs
```

### Проверка здоровья
```bash
# Автоматическая проверка
make health

# Ручная проверка
curl http://localhost:3000
docker-compose exec mongodb mongo --eval "db.adminCommand('ping')"
```

## 🔄 Обновление

### Обновление кода
```bash
# Остановка сервисов
make down

# Обновление кода (git pull)
git pull origin main

# Пересборка и запуск
make up-build

# Инициализация данных (если нужно)
make init-data
```

### Обновление образов
```bash
# Обновление базовых образов
docker-compose pull

# Пересборка с обновленными образами
make up-build
```

## 🚀 Продакшн развертывание

### Настройка для продакшна
1. Измените пароли в `docker-compose.yml`
2. Настройте SSL сертификаты
3. Используйте внешнюю базу данных
4. Настройте мониторинг

### Безопасность
- Смените пароли по умолчанию
- Используйте секреты Docker
- Настройте firewall
- Регулярно обновляйте образы

---

**Готово! Теперь вы можете запустить приложение одной командой: `make up-build`**
