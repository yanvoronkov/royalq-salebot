# Руководство по развертыванию RoyalQ Salebot

## Быстрый старт

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

# Установка Make (если не установлен)
sudo apt install make -y
```

### 2. Клонирование репозитория

```bash
git clone https://github.com/your-username/royalq-salebot.git
cd royalq-salebot
```

### 3. Настройка переменных окружения

```bash
# Копирование файла с примерами
cp env.production.example .env

# Редактирование переменных
nano .env
```

Обязательно измените следующие переменные:
- `MONGO_ROOT_PASSWORD` - надежный пароль для MongoDB
- `SALEBOT_API_KEY` - ваш API ключ от Salebot
- `JWT_SECRET` - секретный ключ для JWT
- `SESSION_SECRET` - секретный ключ для сессий

### 4. Запуск приложения

```bash
# Запуск в продакшн режиме
make production

# Или полный деплой с бэкапом
make deploy
```

### 5. Проверка статуса

```bash
# Проверка статуса контейнеров
make status

# Проверка здоровья сервисов
make health

# Просмотр логов
make logs
```

## Управление приложением

### Основные команды

```bash
# Запуск всех сервисов
make up

# Остановка всех сервисов
make down

# Перезапуск
make restart

# Просмотр логов
make logs          # Все сервисы
make logs-app      # Только приложение
make logs-db       # Только MongoDB

# Вход в контейнеры
make shell         # Контейнер приложения
make db-shell      # MongoDB shell
```

### Бэкапы и восстановление

```bash
# Создание бэкапа
make backup

# Восстановление из бэкапа
make restore
```

### Очистка

```bash
# Остановка и удаление всех контейнеров
make clean
```

## Мониторинг

### Проверка здоровья

```bash
# Проверка статуса всех сервисов
docker-compose ps

# Проверка логов
docker-compose logs -f

# Проверка использования ресурсов
docker stats
```

### Логи

Логи сохраняются в следующих местах:
- Приложение: `./logs/` (внутри контейнера)
- Nginx: `./nginx_logs/` (volume)
- MongoDB: стандартные логи Docker

## Безопасность

### Рекомендации

1. **Измените пароли по умолчанию** в файле `.env`
2. **Настройте файрвол**:
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```
3. **Используйте SSL сертификаты** для HTTPS
4. **Регулярно создавайте бэкапы**
5. **Обновляйте систему и Docker образы**

### SSL сертификаты

Для настройки HTTPS:

1. Получите SSL сертификаты (Let's Encrypt)
2. Поместите их в директорию `./ssl/`
3. Обновите конфигурацию Nginx

## Обновление приложения

```bash
# Получение последних изменений
git pull origin main

# Пересборка и перезапуск
make up-build

# Проверка статуса
make status
```

## Устранение неполадок

### Проблемы с подключением к базе данных

```bash
# Проверка статуса MongoDB
make logs-db

# Проверка подключения
make db-shell
```

### Проблемы с приложением

```bash
# Проверка логов приложения
make logs-app

# Вход в контейнер для отладки
make shell
```

### Проблемы с Nginx

```bash
# Проверка конфигурации
docker-compose exec nginx nginx -t

# Перезапуск Nginx
docker-compose restart nginx
```

## Производительность

### Оптимизация

1. **Мониторинг ресурсов**:
   ```bash
   docker stats
   ```

2. **Настройка лимитов** в `docker-compose.yml`:
   ```yaml
   deploy:
     resources:
       limits:
         memory: 512M
         cpus: '0.5'
   ```

3. **Масштабирование**:
   ```bash
   docker-compose up --scale app=3
   ```

## Контакты

При возникновении проблем обращайтесь к документации или создавайте issue в репозитории.
