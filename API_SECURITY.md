# 🛡️ Безопасность API

## Обзор защиты

Наше приложение теперь защищено многоуровневой системой безопасности:

### 🔐 Уровни защиты:

1. **API Key Authentication** - Все API endpoints требуют секретный ключ
2. **Rate Limiting** - Ограничение количества запросов с одного IP
3. **Write Protection** - Операции записи требуют дополнительной аутентификации
4. **IP Whitelisting** - Возможность ограничения доступа по IP адресам

## 🔑 API Key Authentication

### Получение API ключа:
```bash
# API ключ генерируется автоматически при развертывании
# Находится в переменной окружения API_SECRET_KEY
echo $API_SECRET_KEY
```

### Использование API ключа:

#### В заголовке запроса:
```bash
curl -H "x-api-key: YOUR_API_KEY" \
     http://localhost:3000/api/referrals/tree
```

#### В query параметре:
```bash
curl "http://localhost:3000/api/referrals/tree?api_key=YOUR_API_KEY"
```

## 📊 Rate Limiting

### Лимиты по умолчанию:
- **Веб-интерфейс**: 200 запросов за 15 минут
- **API endpoints**: 50 запросов за 15 минут
- **Запросы на запись**: 50 запросов за 15 минут

### Заголовки ответа:
```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 2024-01-01T12:00:00.000Z
```

## 🚫 Защищенные endpoints

### Полностью защищенные (требуют API ключ):
- `GET /api/referrals/tree` - Получить дерево рефералов
- `GET /api/referrals/activity-stats` - Статистика активности
- `GET /api/referrals/:id/tree` - Дерево конкретного пользователя
- `GET /api/referrals/:id/activity-stats` - Статистика пользователя
- `GET /api/referals/search` - Поиск рефералов
- `GET /api/referals/filter` - Фильтрация рефералов

### Защищенные операции записи (требуют API ключ):
- `POST /api/referals` - Создать реферала
- `POST /api/referals/upsert` - Создать/обновить реферала
- `PUT /api/referals/:id` - Обновить реферала
- `DELETE /api/referals/:id` - Удалить реферала
- `POST /api/payments` - Создать платеж
- `GET /api/payments/user/:userId` - Получить платежи пользователя

### Открытые endpoints (не требуют API ключ):
- `GET /network` - Веб-интерфейс реферальной сети
- `GET /network/:id` - Веб-интерфейс пользователя
- `GET /health` - Health check
- `GET /payments/test` - Тестовый endpoint

## 🧪 Тестирование безопасности

### Запуск тестов:
```bash
npm run test-api-security
```

### Тесты включают:
- ✅ Проверка неавторизованного доступа
- ✅ Проверка авторизованного доступа
- ✅ Проверка операций записи
- ✅ Проверка rate limiting
- ✅ Проверка веб-интерфейса

## 🔧 Настройка безопасности

### Переменные окружения:
```bash
# API Security
API_SECRET_KEY=your-secret-api-key-here
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
API_RATE_LIMIT_MAX_REQUESTS=50

# Security Headers
TRUST_PROXY=true
```

### Генерация новых ключей:
```bash
# Генерация API ключа
openssl rand -base64 32

# Генерация JWT секрета
openssl rand -base64 64
```

## 🚨 Ответы на ошибки

### 401 Unauthorized:
```json
{
  "error": "Unauthorized",
  "message": "API key required",
  "hint": "Add x-api-key header or api_key query parameter"
}
```

### 429 Too Many Requests:
```json
{
  "error": "Too Many Requests",
  "message": "API rate limit exceeded",
  "retryAfter": 900
}
```

### 403 Forbidden (IP whitelist):
```json
{
  "error": "Forbidden",
  "message": "Access denied from this IP address"
}
```

## 🔒 Рекомендации по безопасности

### 1. Хранение API ключей:
- ✅ Используйте переменные окружения
- ✅ Никогда не коммитьте ключи в git
- ✅ Регулярно ротируйте ключи

### 2. Мониторинг:
- ✅ Логируйте все API запросы
- ✅ Мониторьте подозрительную активность
- ✅ Настройте алерты на превышение лимитов

### 3. Дополнительная защита:
- ✅ Используйте HTTPS в продакшене
- ✅ Настройте firewall
- ✅ Регулярно обновляйте зависимости

## 📝 Примеры использования

### JavaScript/Node.js:
```javascript
const API_KEY = process.env.API_SECRET_KEY;
const response = await fetch('/api/referrals/tree', {
    headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
    }
});
```

### Python:
```python
import requests

API_KEY = os.getenv('API_SECRET_KEY')
headers = {'x-api-key': API_KEY}
response = requests.get('/api/referrals/tree', headers=headers)
```

### cURL:
```bash
curl -H "x-api-key: $API_SECRET_KEY" \
     -H "Content-Type: application/json" \
     http://localhost:3000/api/referrals/tree
```

## 🆘 Устранение неполадок

### Проблема: API ключ не принимается
**Решение**: Проверьте переменную окружения `API_SECRET_KEY`

### Проблема: Rate limit срабатывает слишком часто
**Решение**: Увеличьте лимиты в переменных окружения

### Проблема: Веб-интерфейс не работает
**Решение**: Убедитесь, что веб-маршруты не защищены API ключом

---

**⚠️ Важно**: Всегда тестируйте изменения безопасности в тестовой среде перед развертыванием в продакшене!
