# 🔍 Endpoint только для чтения

## Обзор

Создан отдельный endpoint для доступа только на чтение к веб-интерфейсу и API. Это позволяет ограничить доступ к данным, не предоставляя права на изменение.

## 🛡️ Защищенные endpoints

### **Веб-интерфейс только для чтения:**
- `GET /readonly` - Веб-интерфейс реферальной сети (требует API ключ)

### **API только для чтения:**
- `GET /api/readonly/referrals/tree` - Получить дерево всех рефералов
- `GET /api/readonly/referrals/activity-stats` - Получить статистику активности
- `GET /api/readonly/referrals/:id/activity-stats` - Статистика конкретного пользователя
- `GET /api/readonly/referrals/:id/tree` - Дерево конкретного пользователя

## 🔑 API ключи

### **Основной API ключ (полный доступ):**
```
06ediHycd1Vi1MY4l/DuV5FKrY5ocu8l0ru3Q1zXq5E=
```
**Использование:** Полный доступ к API (чтение + запись)

### **API ключ только для чтения:**
```
ZDd1/oQLS2BxsFhfA7f012ArXCr0fByy6jlH1JXH7bs=
```
**Использование:** Только чтение данных через `/readonly` endpoints

## 📋 Использование

### **Веб-интерфейс только для чтения:**
```bash
# Доступ к веб-интерфейсу с API ключом
curl -H "x-api-key: ZDd1/oQLS2BxsFhfA7f012ArXCr0fByy6jlH1JXH7bs=" \
     https://projects.inetskills.ru/readonly
```

### **API только для чтения:**
```bash
# Получить дерево рефералов
curl -H "x-api-key: ZDd1/oQLS2BxsFhfA7f012ArXCr0fByy6jlH1JXH7bs=" \
     https://projects.inetskills.ru/api/readonly/referrals/tree

# Получить статистику активности
curl -H "x-api-key: ZDd1/oQLS2BxsFhfA7f012ArXCr0fByy6jlH1JXH7bs=" \
     https://projects.inetskills.ru/api/readonly/referrals/activity-stats
```

## 🧪 Тестирование

### **Запуск тестов:**
```bash
# Локальное тестирование
npm run test-readonly

# На сервере
node scripts/test-readonly-endpoint.js
```

### **Ручное тестирование:**
```bash
# Тест 1: Веб-интерфейс без ключа (должен быть заблокирован)
curl https://projects.inetskills.ru/readonly

# Тест 2: Веб-интерфейс с ключом (должен работать)
curl -H "x-api-key: ZDd1/oQLS2BxsFhfA7f012ArXCr0fByy6jlH1JXH7bs=" \
     https://projects.inetskills.ru/readonly

# Тест 3: API только для чтения без ключа (должен быть заблокирован)
curl https://projects.inetskills.ru/api/readonly/referrals/tree

# Тест 4: API только для чтения с ключом (должен работать)
curl -H "x-api-key: ZDd1/oQLS2BxsFhfA7f012ArXCr0fByy6jlH1JXH7bs=" \
     https://projects.inetskills.ru/api/readonly/referrals/tree
```

## 🔒 Безопасность

### **Уровни доступа:**
1. **Публичный доступ:** `/health`, `/network` (без API ключа)
2. **Только чтение:** `/readonly`, `/api/readonly/*` (требует readonly ключ)
3. **Полный доступ:** `/api/referrals/*`, `/api/payments/*` (требует основной ключ)

### **Защита:**
- ✅ **API ключ обязателен** для всех readonly endpoints
- ✅ **Rate limiting** активен
- ✅ **Разделение прав доступа** между ключами
- ✅ **Основной API защищен** от readonly ключа

## 📊 Сравнение endpoints

| Endpoint | Доступ | API ключ | Функции |
|----------|--------|----------|---------|
| `/network` | Публичный | Не нужен | Полный веб-интерфейс |
| `/readonly` | Защищенный | Readonly | Веб-интерфейс только для чтения |
| `/api/referrals/*` | Защищенный | Основной | Полный API доступ |
| `/api/readonly/*` | Защищенный | Readonly | API только для чтения |

## 🚀 Развертывание

### **Обновление на сервере:**
```bash
# 1. Обновите код
git pull origin main

# 2. Добавьте новый ключ в .env
echo "API_READONLY_KEY=ZDd1/oQLS2BxsFhfA7f012ArXCr0fByy6jlH1JXH7bs=" >> .env

# 3. Перезапустите контейнеры
docker-compose down && docker-compose up -d

# 4. Протестируйте
npm run test-readonly
```

## ⚠️ Важные моменты

1. **Сохраните readonly ключ** в безопасном месте
2. **Используйте readonly ключ** для внешних систем, которым нужен только просмотр данных
3. **Основной ключ** используйте только для административных задач
4. **Мониторьте использование** обоих ключей

---

**🛡️ Endpoint только для чтения обеспечивает безопасный доступ к данным без риска их изменения!**
