#!/bin/bash

# 🚨 СРОЧНОЕ ОБНОВЛЕНИЕ БЕЗОПАСНОСТИ НА СЕРВЕРЕ
# Использование: ./scripts/update-server-security.sh

echo "🚨 СРОЧНОЕ ОБНОВЛЕНИЕ БЕЗОПАСНОСТИ API"
echo "=================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверяем, что мы в правильной директории
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Ошибка: docker-compose.yml не найден!${NC}"
    echo "Убедитесь, что вы находитесь в директории проекта."
    exit 1
fi

echo -e "${YELLOW}📋 Шаг 1: Остановка контейнеров...${NC}"
docker-compose down

echo -e "${YELLOW}📋 Шаг 2: Обновление кода из git...${NC}"
git pull origin main

echo -e "${YELLOW}📋 Шаг 3: Проверка .env файла...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env файл не найден!${NC}"
    echo "Создайте .env файл на основе env.production.example"
    exit 1
fi

# Проверяем наличие API_SECRET_KEY в .env
if ! grep -q "API_SECRET_KEY" .env; then
    echo -e "${YELLOW}⚠️ API_SECRET_KEY не найден в .env файле${NC}"
    echo "Добавляем переменные безопасности..."
    
    cat >> .env << EOF

# API Security
API_SECRET_KEY=06ediHycd1Vi1MY4l/DuV5FKrY5ocu8l0ru3Q1zXq5E=
JWT_SECRET=90klUvfhR+0h7DI5sB0pF96ruLqN12d4rjPNC0zh8cKbEiNeJGJrBoE24qfm+NPZlBAiBZFC0G2KBNiZBmQU0w==
SESSION_SECRET=06ediHycd1Vi1MY4l/DuV5FKrY5ocu8l0ru3Q1zXq5E=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
API_RATE_LIMIT_MAX_REQUESTS=50

# Security Headers
TRUST_PROXY=true
EOF
    
    echo -e "${GREEN}✅ Переменные безопасности добавлены в .env${NC}"
else
    echo -e "${GREEN}✅ API_SECRET_KEY уже присутствует в .env${NC}"
fi

echo -e "${YELLOW}📋 Шаг 4: Пересборка контейнеров...${NC}"
docker-compose build --no-cache

echo -e "${YELLOW}📋 Шаг 5: Запуск контейнеров...${NC}"
docker-compose up -d

echo -e "${YELLOW}📋 Шаг 6: Ожидание запуска...${NC}"
sleep 10

echo -e "${YELLOW}📋 Шаг 7: Проверка статуса контейнеров...${NC}"
docker-compose ps

echo -e "${YELLOW}📋 Шаг 8: Проверка переменных окружения...${NC}"
docker-compose exec app env | grep API_SECRET_KEY || echo -e "${RED}❌ API_SECRET_KEY не найден в контейнере!${NC}"

echo ""
echo -e "${GREEN}🎉 Обновление завершено!${NC}"
echo ""
echo -e "${YELLOW}🧪 Тестирование защиты:${NC}"

# Тест 1: API без ключа
echo -e "${YELLOW}Тест 1: API без ключа...${NC}"
response=$(curl -s -w "%{http_code}" http://localhost:3000/api/referrals/tree)
status_code="${response: -3}"
if [ "$status_code" = "401" ]; then
    echo -e "${GREEN}✅ API заблокирован без ключа (статус: $status_code)${NC}"
else
    echo -e "${RED}❌ API НЕ заблокирован без ключа (статус: $status_code)${NC}"
fi

# Тест 2: API с ключом
echo -e "${YELLOW}Тест 2: API с ключом...${NC}"
response=$(curl -s -w "%{http_code}" -H "x-api-key: 06ediHycd1Vi1MY4l/DuV5FKrY5ocu8l0ru3Q1zXq5E=" http://localhost:3000/api/referrals/tree)
status_code="${response: -3}"
if [ "$status_code" = "200" ]; then
    echo -e "${GREEN}✅ API работает с ключом (статус: $status_code)${NC}"
else
    echo -e "${RED}❌ API НЕ работает с ключом (статус: $status_code)${NC}"
fi

# Тест 3: Веб-интерфейс
echo -e "${YELLOW}Тест 3: Веб-интерфейс...${NC}"
response=$(curl -s -w "%{http_code}" http://localhost:3000/network)
status_code="${response: -3}"
if [ "$status_code" = "200" ]; then
    echo -e "${GREEN}✅ Веб-интерфейс работает (статус: $status_code)${NC}"
else
    echo -e "${RED}❌ Веб-интерфейс НЕ работает (статус: $status_code)${NC}"
fi

echo ""
echo -e "${GREEN}🛡️ Защита API активирована!${NC}"
echo ""
echo -e "${YELLOW}📋 Следующие шаги:${NC}"
echo "1. Проверьте внешний доступ: curl https://projects.inetskills.ru/api/referrals/tree"
echo "2. Запустите полный тест: ./scripts/test-server-security.sh"
echo "3. Мониторьте логи: docker-compose logs -f app"
echo ""
echo -e "${RED}⚠️ ВАЖНО: Сохраните API ключ в безопасном месте!${NC}"
echo "API Key: 06ediHycd1Vi1MY4l/DuV5FKrY5ocu8l0ru3Q1zXq5E="
