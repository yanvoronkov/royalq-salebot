# Быстрое развертывание RoyalQ Salebot

## 🚀 Развертывание на сервере

### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Установка Make
sudo apt install make -y

# Перезагрузка для применения изменений группы
sudo reboot
```

### 2. Клонирование и настройка

```bash
# Клонирование репозитория
git clone https://github.com/yanvoronkov/royalq-salebot.git
cd royalq-salebot

# Создание файла переменных окружения
cp env.production.example .env

# Редактирование переменных (ОБЯЗАТЕЛЬНО!)
nano .env
```

### 3. Настройка переменных окружения

Обязательно измените в файле `.env`:

```bash
# Безопасные пароли
MONGO_ROOT_PASSWORD=your_very_secure_password_here
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# API ключ Salebot
SALEBOT_API_KEY=your_salebot_api_key_here

# Порты (если нужно)
HTTP_PORT=80
HTTPS_PORT=443
```

### 4. Запуск приложения

```bash
# Запуск в продакшн режиме
make production

# Проверка статуса
make status

# Проверка здоровья
make health
```

### 5. Проверка работы

```bash
# Проверка доступности
curl http://localhost/health

# Просмотр логов
make logs
```

## 🔧 Основные команды

```bash
# Управление
make up          # Запуск
make down        # Остановка
make restart     # Перезапуск
make logs        # Логи

# Мониторинг
make status      # Статус контейнеров
make health      # Проверка здоровья

# Бэкапы
make backup      # Создать бэкап
make restore     # Восстановить
```

## 🔒 Безопасность

```bash
# Настройка файрвола
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## 📊 Мониторинг

- **Приложение**: http://your-server/health
- **Логи**: `make logs`
- **Статус**: `make status`

## 🆘 Устранение неполадок

```bash
# Проблемы с запуском
make logs-app

# Проблемы с базой данных
make logs-db

# Пересборка
make up-build
```

## 📝 Важные файлы

- `.env` - переменные окружения
- `docker-compose.yml` - конфигурация Docker
- `DEPLOYMENT.md` - подробное руководство
- `Makefile` - команды управления

---

**Готово!** Ваше приложение запущено и готово к работе! 🎉
