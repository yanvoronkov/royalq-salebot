# 🚀 Серверное развертывание RoyalQ Salebot

## 📋 Обзор

Это руководство описывает безопасное развертывание RoyalQ Salebot на продакшн сервере с полной защитой от ransomware атак и других угроз безопасности.

## 🔒 Меры безопасности

### ✅ Реализованные защиты:
- **MongoDB только на localhost** - недоступен из интернета
- **Аутентификация MongoDB** - защита от несанкционированного доступа
- **Файрвол** - блокировка внешнего доступа к порту 27017
- **Автоматические бэкапы** - ежедневные резервные копии
- **Ротация логов** - автоматическая очистка старых логов
- **PM2 мониторинг** - автоматический перезапуск при сбоях
- **Health checks** - мониторинг состояния приложения

## 🛠️ Требования к серверу

### Минимальные требования:
- **OS**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **RAM**: 2GB (рекомендуется 4GB)
- **CPU**: 2 ядра
- **Диск**: 20GB свободного места
- **Node.js**: версия 20+
- **MongoDB**: версия 6.0+

### Сетевые требования:
- **Порт 22**: SSH доступ
- **Порт 80**: HTTP (для веб-интерфейса)
- **Порт 443**: HTTPS (рекомендуется)
- **Порт 27017**: ЗАБЛОКИРОВАН для внешнего доступа

## 🚀 Автоматическая установка

### Быстрая установка (рекомендуется):

```bash
# 1. Клонируйте репозиторий
git clone <your-repository-url>
cd royalq-salebot

# 2. Запустите автоматическую установку
chmod +x scripts/server-setup.sh
./scripts/server-setup.sh
```

Скрипт автоматически:
- ✅ Установит MongoDB с безопасной конфигурацией
- ✅ Настроит файрвол
- ✅ Создаст пользователей базы данных
- ✅ Установит PM2
- ✅ Настроит автоматические бэкапы
- ✅ Создаст безопасный .env файл
- ✅ Запустит приложение

## 🔧 Ручная установка

### 1. Установка MongoDB

```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# CentOS/RHEL
sudo yum install -y mongodb-org
```

### 2. Настройка MongoDB

```bash
# Копируем безопасную конфигурацию
sudo cp config/mongod-server.conf /etc/mongod.conf

# Создаем директории
sudo mkdir -p /var/lib/mongodb /var/log/mongodb /var/run/mongodb
sudo chown -R mongodb:mongodb /var/lib/mongodb /var/log/mongodb /var/run/mongodb

# Запускаем MongoDB
sudo systemctl enable mongod
sudo systemctl start mongod
```

### 3. Создание пользователей базы данных

```bash
# Создаем пользователя приложения
mongosh --eval "
use royalq_salebot;
db.createUser({
  user: 'royalq_user',
  pwd: 'STRONG_PASSWORD_HERE',
  roles: [
    { role: 'readWrite', db: 'royalq_salebot' }
  ]
});
"
```

### 4. Настройка файрвола

```bash
# Ubuntu/Debian (UFW)
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 27017/tcp

# CentOS/RHEL (firewalld)
sudo systemctl enable firewalld
sudo systemctl start firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --remove-port=27017/tcp
sudo firewall-cmd --reload
```

### 5. Установка приложения

```bash
# Установка зависимостей
npm ci --production

# Создание .env файла
cp env.server.example .env
# Отредактируйте .env файл с вашими настройками

# Инициализация базы данных
npm run init-db

# Установка PM2
npm install -g pm2

# Запуск приложения
pm2 start src/server.js --name royalq-salebot --env production
pm2 save
```

## 🔐 Настройка безопасности

### 1. Обновление .env файла

```bash
# Сгенерируйте сильные пароли
JWT_SECRET=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 64)

# Обновите .env файл
nano .env
```

### 2. Настройка автоматических бэкапов

```bash
# Добавьте в crontab
crontab -e

# Добавьте строку для ежедневных бэкапов в 2:00
0 2 * * * cd /var/www/html/royalq-salebot && npm run backup-secure >> /var/log/royalq-backup.log 2>&1
```

### 3. Настройка мониторинга

```bash
# Проверка состояния приложения
pm2 status

# Просмотр логов
pm2 logs royalq-salebot

# Мониторинг в реальном времени
npm run monitor-backend
```

## 📊 Мониторинг и обслуживание

### Ежедневные проверки:

```bash
# Проверка состояния приложения
curl http://localhost:3000/health

# Проверка MongoDB
sudo systemctl status mongod

# Проверка бэкапов
npm run backup-list

# Проверка логов
pm2 logs royalq-salebot --lines 50
```

### Еженедельные проверки:

```bash
# Полное тестирование
npm run test-backend

# Обновление зависимостей
npm audit
npm update

# Проверка места на диске
df -h
du -sh /var/backups/royalq-salebot/
```

## 🚨 Устранение неполадок

### Проблема: MongoDB не запускается

```bash
# Проверка логов
sudo journalctl -u mongod

# Проверка конфигурации
sudo mongod --config /etc/mongod.conf --configExpand rest

# Перезапуск
sudo systemctl restart mongod
```

### Проблема: Приложение не отвечает

```bash
# Проверка PM2
pm2 status
pm2 restart royalq-salebot

# Проверка портов
netstat -tulpn | grep 3000

# Проверка логов
pm2 logs royalq-salebot
```

### Проблема: Бэкапы не создаются

```bash
# Проверка прав доступа
ls -la /var/backups/royalq-salebot/

# Ручное создание бэкапа
npm run backup-secure

# Проверка cron
crontab -l
```

## 🔄 Обновление приложения

### Автоматическое обновление (через GitHub Actions):

1. Сделайте изменения в коде
2. Зафиксируйте изменения: `git commit -m "Update"`
3. Отправьте на сервер: `git push origin main`
4. GitHub Actions автоматически развернет обновления

### Ручное обновление:

```bash
# Создание бэкапа
npm run backup-secure

# Получение обновлений
git pull origin main

# Установка зависимостей
npm ci --production

# Тестирование
npm run quick-test

# Перезапуск
pm2 restart royalq-salebot
```

## 📞 Поддержка

### Полезные команды:

```bash
# Состояние системы
pm2 status
sudo systemctl status mongod
npm run quick-test

# Логи
pm2 logs royalq-salebot
sudo tail -f /var/log/mongodb/mongod.log

# Бэкапы
npm run backup-secure
npm run backup-list

# Мониторинг
npm run monitor-backend
```

### Контакты:
- **Документация**: README.md
- **API Health**: `curl http://localhost:3000/health`
- **Веб-интерфейс**: `http://your-domain.com/network`

---

**⚠️ ВАЖНО**: После установки обязательно:
1. Смените все пароли по умолчанию
2. Настройте SSL сертификаты
3. Регулярно создавайте бэкапы
4. Мониторьте логи на предмет подозрительной активности

*Документация обновлена: 25 сентября 2024*
