# 🏠 Настройка локальной разработки - RoyalQ Salebot

## 📋 Требования

- **Node.js** версии 20+
- **MongoDB** установленная локально
- **Git** для клонирования репозитория

## 🚀 Быстрый старт

### 1. Клонирование и установка зависимостей
```bash
git clone <your-repo-url>
cd royalq-salebot
npm install
```

### 2. Настройка переменных окружения
Создайте файл `.env` в корне проекта:
```bash
# Локальная база данных MongoDB
MONGODB_URI=mongodb://localhost:27017/royalq-salebot

# Salebot API (заглушка для будущей интеграции)
SALEBOT_API_BASE_URL=https://api.salebot.pro
SALEBOT_API_KEY=your_api_key_here

# Сервер
PORT=3000
NODE_ENV=development
```

### 3. Запуск MongoDB
Убедитесь, что MongoDB запущена локально:

**macOS (через Homebrew):**
```bash
brew services start mongodb/brew/mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo systemctl start mongodb
```

**Windows:**
Запустите MongoDB Compass или через командную строку

### 4. Инициализация базы данных
```bash
npm run init-db
```

### 5. Запуск приложения
```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

## 🗄️ Управление базой данных

### Доступные команды

| Команда | Описание |
|---------|----------|
| `npm run init-db` | Инициализация БД с тестовыми данными |
| `npm run clear-db` | Очистка всей базы данных |
| `npm run backup-db` | Создание резервной копии |
| `npm run backup-db list` | Просмотр доступных бэкапов |

### Тестовые данные

После выполнения `npm run init-db` в базе будут созданы:

**Рефералы:**
- Root User (root001) - корневой пользователь
- John Doe (user001) - реферал Root User
- Jane Smith (user002) - реферал Root User  
- Bob Wilson (user003) - реферал John Doe
- Alice Brown (user004) - реферал John Doe
- Charlie Davis (user005) - реферал Bob Wilson

**Платежи:**
- 4 тестовых платежа для разных пользователей

### Структура реферального дерева
```
Root User (root001)
├── John Doe (user001) - 2 платежа
│   ├── Bob Wilson (user003) - 1 платеж
│   │   └── Charlie Davis (user005)
│   └── Alice Brown (user004)
└── Jane Smith (user002) - 1 платеж
```

## 🌐 Тестирование приложения

### Веб-интерфейс
- **Дашборд Root User**: http://localhost:3000/dashboard/root001
- **Дашборд John Doe**: http://localhost:3000/dashboard/user001
- **Дашборд Bob Wilson**: http://localhost:3000/dashboard/user003

### API Endpoints
```bash
# Получение реферала
curl http://localhost:3000/api/referals/root001

# Создание нового реферала
curl -X POST http://localhost:3000/api/referals \
  -H "Content-Type: application/json" \
  -d '{
    "referal_id": "new_user",
    "referer_id": "root001",
    "referal_nickname": "new_user_nick",
    "referal_name": "New User"
  }'

# Получение платежей пользователя
curl http://localhost:3000/api/payments/user/user001

# Создание платежа
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user001",
    "amount": 99.99,
    "currency": "USD",
    "status": "success"
  }'
```

## 🔧 Настройка MongoDB

### Проверка подключения
```bash
# Подключение к MongoDB через командную строку
mongo
# или
mongosh

# Переключение на базу данных
use royalq-salebot

# Просмотр коллекций
show collections

# Просмотр документов
db.referals.find()
db.payments.find()
```

### Просмотр данных через MongoDB Compass
1. Откройте MongoDB Compass
2. Подключитесь к `mongodb://localhost:27017`
3. Выберите базу данных `royalq-salebot`
4. Просматривайте коллекции `referals` и `payments`

## 🚨 Troubleshooting

### MongoDB не запускается
```bash
# Проверка статуса (macOS)
brew services list | grep mongodb

# Проверка статуса (Ubuntu)
sudo systemctl status mongodb

# Запуск MongoDB (Ubuntu)
sudo systemctl start mongodb
```

### Ошибка подключения к базе данных
1. Убедитесь, что MongoDB запущена
2. Проверьте, что порт 27017 свободен
3. Проверьте файл `.env` на корректность URI

### Ошибка "Database not found"
```bash
# Создайте базу данных вручную
mongo
use royalq-salebot
db.createCollection("referals")
db.createCollection("payments")
```

### Очистка и переинициализация
```bash
# Полная очистка и переинициализация
npm run clear-db
npm run init-db
```

## 📊 Мониторинг

### Логи приложения
```bash
# Запуск с подробными логами
DEBUG=* npm run dev
```

### Мониторинг MongoDB
```bash
# Просмотр логов MongoDB (macOS)
tail -f /usr/local/var/log/mongodb/mongo.log

# Просмотр логов MongoDB (Ubuntu)
sudo tail -f /var/log/mongodb/mongod.log
```

## 🔄 Перенос данных

### Экспорт данных
```bash
# Создание бэкапа
npm run backup-db

# Экспорт через mongodump
mongodump --db royalq-salebot --out ./backup
```

### Импорт данных
```bash
# Импорт из бэкапа
mongorestore --db royalq-salebot ./backup/royalq-salebot
```

## 🎯 Следующие шаги

1. **Тестирование**: Протестируйте все функции приложения
2. **Разработка**: Внесите необходимые изменения
3. **Документация**: Обновите документацию при необходимости
4. **Деплой**: Подготовьте к развертыванию на сервере

---

*Документация локальной настройки обновлена: $(date)*
