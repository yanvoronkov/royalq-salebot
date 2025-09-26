#!/bin/bash

# 🛡️ Тест безопасности API на сервере
# Использование: ./scripts/test-server-security.sh [SERVER_URL]

SERVER_URL=${1:-"https://projects.inetskills.ru"}
API_KEY="06ediHycd1Vi1MY4l/DuV5FKrY5ocu8l0ru3Q1zXq5E="

echo "🛡️ Тестирование безопасности API на сервере: $SERVER_URL"
echo "API Key: ${API_KEY:0:8}..."
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Счетчики тестов
PASSED=0
FAILED=0
TOTAL=0

# Функция для логирования результатов
log_test() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    TOTAL=$((TOTAL + 1))
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name: PASS${NC} $message"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ $test_name: FAIL${NC} $message"
        FAILED=$((FAILED + 1))
    fi
}

# Функция для выполнения HTTP запроса
make_request() {
    local url="$1"
    local method="${2:-GET}"
    local headers="$3"
    local data="$4"
    
    if [ -n "$data" ]; then
        curl -s -w "%{http_code}" -X "$method" -H "$headers" -d "$data" "$url"
    else
        curl -s -w "%{http_code}" -X "$method" -H "$headers" "$url"
    fi
}

echo "🏥 Тестирование health check..."
response=$(make_request "$SERVER_URL/health")
status_code="${response: -3}"
if [ "$status_code" = "200" ]; then
    log_test "Health check" "PASS" "Статус: $status_code"
else
    log_test "Health check" "FAIL" "Ожидался статус 200, получен: $status_code"
fi

echo ""
echo "🌐 Тестирование веб-интерфейса..."
response=$(make_request "$SERVER_URL/network")
status_code="${response: -3}"
if [ "$status_code" = "200" ]; then
    log_test "Веб-интерфейс доступен" "PASS" "Статус: $status_code"
else
    log_test "Веб-интерфейс доступен" "FAIL" "Ожидался статус 200, получен: $status_code"
fi

echo ""
echo "🔒 Тестирование неавторизованного доступа к API..."
response=$(make_request "$SERVER_URL/api/referrals/tree")
status_code="${response: -3}"
if [ "$status_code" = "401" ]; then
    log_test "API без ключа заблокирован" "PASS" "Статус: $status_code"
else
    log_test "API без ключа заблокирован" "FAIL" "Ожидался статус 401, получен: $status_code"
fi

echo ""
echo "🔑 Тестирование авторизованного доступа к API..."
response=$(make_request "$SERVER_URL/api/referrals/tree" "GET" "x-api-key: $API_KEY")
status_code="${response: -3}"
if [ "$status_code" = "200" ]; then
    log_test "API с ключом работает" "PASS" "Статус: $status_code"
else
    log_test "API с ключом работает" "FAIL" "Статус: $status_code"
fi

echo ""
echo "❌ Тестирование неверного API ключа..."
response=$(make_request "$SERVER_URL/api/referrals/tree" "GET" "x-api-key: wrong-key")
status_code="${response: -3}"
if [ "$status_code" = "401" ]; then
    log_test "Неверный API ключ заблокирован" "PASS" "Статус: $status_code"
else
    log_test "Неверный API ключ заблокирован" "FAIL" "Ожидался статус 401, получен: $status_code"
fi

echo ""
echo "✏️ Тестирование операций записи без ключа..."
response=$(make_request "$SERVER_URL/api/referals" "POST" "Content-Type: application/json" '{"referalId":"test123","referalName":"Test User"}')
status_code="${response: -3}"
if [ "$status_code" = "401" ]; then
    log_test "POST без ключа заблокирован" "PASS" "Статус: $status_code"
else
    log_test "POST без ключа заблокирован" "FAIL" "Ожидался статус 401, получен: $status_code"
fi

echo ""
echo "✏️ Тестирование операций записи с ключом..."
response=$(make_request "$SERVER_URL/api/referals" "POST" "x-api-key: $API_KEY" '{"referalId":"test456","referalName":"Test User 2"}')
status_code="${response: -3}"
if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
    log_test "POST с ключом работает" "PASS" "Статус: $status_code"
else
    log_test "POST с ключом работает" "FAIL" "Статус: $status_code"
fi

echo ""
echo "⏱️ Тестирование rate limiting..."
echo "Отправляем 10 запросов подряд..."
rate_limited=0
for i in {1..10}; do
    response=$(make_request "$SERVER_URL/api/referrals/tree" "GET" "x-api-key: $API_KEY")
    status_code="${response: -3}"
    if [ "$status_code" = "429" ]; then
        rate_limited=1
        break
    fi
    sleep 0.1
done

if [ "$rate_limited" = "1" ]; then
    log_test "Rate limiting сработал" "PASS" "Запросы ограничены"
else
    log_test "Rate limiting сработал" "INFO" "Лимит не достигнут (нормально)"
fi

echo ""
echo "📊 Результаты тестирования:"
echo -e "${GREEN}✅ Пройдено: $PASSED${NC}"
echo -e "${RED}❌ Провалено: $FAILED${NC}"
echo -e "${YELLOW}📈 Всего тестов: $TOTAL${NC}"

success_rate=$((PASSED * 100 / TOTAL))
echo -e "${YELLOW}🎯 Успешность: $success_rate%${NC}"

if [ "$FAILED" -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Все тесты безопасности пройдены успешно!${NC}"
    echo -e "${GREEN}🛡️ API защищен от несанкционированного доступа!${NC}"
else
    echo ""
    echo -e "${RED}⚠️ Обнаружены проблемы с безопасностью API!${NC}"
    echo -e "${YELLOW}Проверьте настройки на сервере.${NC}"
fi

echo ""
echo "🔧 Дополнительные проверки:"
echo "1. Проверьте логи сервера: docker-compose logs app"
echo "2. Проверьте переменные окружения: docker-compose exec app env | grep API"
echo "3. Проверьте статус контейнеров: docker-compose ps"
