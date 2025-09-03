# Документация развертывания - RoyalQ Salebot

## 🚀 Обзор развертывания

Приложение поддерживает автоматическое развертывание через GitHub Actions с использованием PM2 для управления процессами на сервере.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub        │    │   GitHub Actions│    │   Production    │
│   Repository    │───►│   CI/CD         │───►│   Server        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 GitHub Actions

### Конфигурация (.github/workflows/deploy.yml)

```yaml
name: Deploy to Server

on:
  push:
    branches:
      - main  # Отслеживаемая ветка

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'  # Версия Node.js

      - name: Install dependencies
        run: npm ci --production

      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: 22
          script: |
            cd /var/www/html/royalq-salebot/
            git pull origin main
            npm ci --production
            pm2 restart my-app
```

### Триггеры развертывания
- **Автоматический**: Push в ветку `main`
- **Ручной**: Запуск workflow через GitHub UI

### Требуемые секреты
Настройте следующие секреты в GitHub репозитории:

| Секрет | Описание | Пример |
|--------|----------|---------|
| `SERVER_IP` | IP-адрес сервера | `192.168.1.100` |
| `SERVER_USER` | Пользователь SSH | `deploy` |
| `SSH_PRIVATE_KEY` | Приватный SSH ключ | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

## 🖥️ Настройка сервера

### Требования к серверу
- **ОС**: Ubuntu 20.04+ / CentOS 8+
- **Node.js**: версия 20+
- **PM2**: для управления процессами
- **Git**: для клонирования репозитория
- **SSH**: для доступа

### Установка зависимостей

#### Ubuntu/Debian
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PM2 глобально
sudo npm install -g pm2

# Установка Git
sudo apt install git -y
```

#### CentOS/RHEL
```bash
# Установка Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Установка PM2 глобально
sudo npm install -g pm2

# Установка Git
sudo yum install git -y
```

### Настройка SSH ключей
```bash
# Генерация SSH ключей на локальной машине
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Копирование публичного ключа на сервер
ssh-copy-id -i ~/.ssh/id_rsa.pub deploy@your_server_ip

# Тестирование подключения
ssh deploy@your_server_ip
```

### Создание директории проекта
```bash
# Создание директории
sudo mkdir -p /var/www/html/royalq-salebot
sudo chown deploy:deploy /var/www/html/royalq-salebot

# Клонирование репозитория
cd /var/www/html/royalq-salebot
git clone https://github.com/your-username/royalq-salebot.git .
```

## ⚙️ Конфигурация окружения

### Переменные окружения (.env)
Создайте файл `.env` на сервере:

```bash
# База данных
MONGODB_URI=mongodb://localhost:27017/royalq-salebot

# Salebot API
SALEBOT_API_BASE_URL=https://api.salebot.pro
SALEBOT_API_KEY=your_api_key_here

# Сервер
PORT=3000
NODE_ENV=production
```

### Настройка MongoDB
```bash
# Установка MongoDB
sudo apt install mongodb -y  # Ubuntu
# или
sudo yum install mongodb-server -y  # CentOS

# Запуск MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Создание базы данных
mongo
> use royalq-salebot
> db.createUser({
    user: "royalq_user",
    pwd: "secure_password",
    roles: ["readWrite"]
  })
```

## 🔄 PM2 Конфигурация

### Создание ecosystem файла
Создайте файл `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'royalq-salebot',
    script: 'src/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### Команды PM2
```bash
# Запуск приложения
pm2 start ecosystem.config.js --env production

# Перезапуск приложения
pm2 restart royalq-salebot

# Остановка приложения
pm2 stop royalq-salebot

# Удаление приложения
pm2 delete royalq-salebot

# Просмотр статуса
pm2 status

# Просмотр логов
pm2 logs royalq-salebot

# Мониторинг
pm2 monit
```

### Автозапуск PM2
```bash
# Сохранение текущей конфигурации
pm2 save

# Настройка автозапуска
pm2 startup

# Выполните команду, которую выдаст PM2
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u deploy --hp /home/deploy
```

## 🌐 Настройка веб-сервера

### Nginx (рекомендуется)
```bash
# Установка Nginx
sudo apt install nginx -y

# Создание конфигурации
sudo nano /etc/nginx/sites-available/royalq-salebot
```

**Конфигурация Nginx**:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Статические файлы
    location /css/ {
        alias /var/www/html/royalq-salebot/public/css/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /js/ {
        alias /var/www/html/royalq-salebot/public/js/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Активация сайта
sudo ln -s /etc/nginx/sites-available/royalq-salebot /etc/nginx/sites-enabled/

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

### Apache (альтернатива)
```bash
# Установка Apache
sudo apt install apache2 -y

# Включение модулей
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite

# Создание конфигурации
sudo nano /etc/apache2/sites-available/royalq-salebot.conf
```

**Конфигурация Apache**:
```apache
<VirtualHost *:80>
    ServerName your_domain.com
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # Статические файлы
    Alias /css /var/www/html/royalq-salebot/public/css
    Alias /js /var/www/html/royalq-salebot/public/js
    
    <Directory /var/www/html/royalq-salebot/public>
        Options -Indexes
        AllowOverride None
        Require all granted
    </Directory>
</VirtualHost>
```

## 🔒 SSL сертификат

### Let's Encrypt (бесплатный)
```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение сертификата
sudo certbot --nginx -d your_domain.com

# Автообновление
sudo crontab -e
# Добавьте строку:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Мониторинг

### Логирование
```bash
# Логи PM2
pm2 logs royalq-salebot

# Логи Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Логи системы
sudo journalctl -u nginx -f
```

### Мониторинг производительности
```bash
# Установка htop
sudo apt install htop -y

# Мониторинг ресурсов
htop

# Мониторинг дисков
df -h

# Мониторинг памяти
free -h
```

### PM2 мониторинг
```bash
# Веб-интерфейс PM2
pm2 web

# Доступ: http://your_server_ip:9615
```

## 🔧 Обслуживание

### Обновление приложения
```bash
# Ручное обновление
cd /var/www/html/royalq-salebot
git pull origin main
npm ci --production
pm2 restart royalq-salebot
```

### Резервное копирование
```bash
# Создание скрипта бэкапа
sudo nano /usr/local/bin/backup-royalq.sh
```

**Скрипт бэкапа**:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/royalq-salebot"
PROJECT_DIR="/var/www/html/royalq-salebot"

# Создание директории бэкапа
mkdir -p $BACKUP_DIR

# Бэкап кода
tar -czf $BACKUP_DIR/code_$DATE.tar.gz -C $PROJECT_DIR .

# Бэкап базы данных
mongodump --db royalq-salebot --out $BACKUP_DIR/db_$DATE

# Удаление старых бэкапов (старше 30 дней)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "db_*" -mtime +30 -exec rm -rf {} \;
```

```bash
# Сделать скрипт исполняемым
sudo chmod +x /usr/local/bin/backup-royalq.sh

# Добавить в crontab
sudo crontab -e
# Добавьте строку:
0 2 * * * /usr/local/bin/backup-royalq.sh
```

## 🚨 Troubleshooting

### Частые проблемы

#### Приложение не запускается
```bash
# Проверка логов
pm2 logs royalq-salebot

# Проверка порта
sudo netstat -tlnp | grep :3000

# Проверка переменных окружения
pm2 env 0
```

#### Ошибки базы данных
```bash
# Проверка статуса MongoDB
sudo systemctl status mongodb

# Проверка подключения
mongo royalq-salebot

# Проверка логов MongoDB
sudo tail -f /var/log/mongodb/mongod.log
```

#### Проблемы с Nginx
```bash
# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx

# Проверка статуса
sudo systemctl status nginx
```

### Команды диагностики
```bash
# Проверка использования ресурсов
pm2 monit

# Проверка процессов
ps aux | grep node

# Проверка сетевых подключений
sudo netstat -tlnp

# Проверка дискового пространства
df -h
```

## 🔮 Планы развития

### Краткосрочные улучшения
- [ ] Docker контейнеризация
- [ ] Автоматическое тестирование в CI/CD
- [ ] Мониторинг с Prometheus/Grafana

### Среднесрочные улучшения
- [ ] Kubernetes развертывание
- [ ] Blue-green деплой
- [ ] Автоматическое масштабирование

### Долгосрочные улучшения
- [ ] Multi-region развертывание
- [ ] Disaster recovery
- [ ] Infrastructure as Code (Terraform)

---

*Документация развертывания обновлена: $(date)*  
*Версия: 1.0.0*
