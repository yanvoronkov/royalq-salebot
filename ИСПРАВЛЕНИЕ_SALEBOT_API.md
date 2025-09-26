# Исправление проблемы с Salebot API

## 🚨 Проблема
Salebot получает ошибку:
```json
{"error":{"message":"referal_id is required","code":"INTERNAL_ERROR"}}
```

## 🔍 Диагностика
Проблема в том, что **Salebot отправляет пустое тело запроса** или некорректный JSON.

## ✅ Решение

### 1. Проверьте настройки Salebot

**URL запроса:** `https://projects.inetskills.ru/api/referals/`

**Заголовки:**
```json
{
  "x-api-key": "#{API_SECRET_KEY}",
  "Content-Type": "application/json"
}
```

**JSON параметры:**
```json
{
  "referal_id": "1234",
  "referer_id": "214879489", 
  "referal_nickname": "#{tg_username}",
  "referer_nickname": "#{getUserNameReferer}",
  "referal_name": "#{full_name}",
  "referral_link_url": "#{reflink}",
  "personal_channel_link": "",
  "utm": ""
}
```

### 2. Возможные причины проблемы

#### ❌ **Неправильный Content-Type**
- **Проблема:** Salebot отправляет `text/plain` вместо `application/json`
- **Решение:** Убедитесь, что в настройках Salebot установлен `Content-Type: application/json`

#### ❌ **Переменные не подставляются**
- **Проблема:** Переменные типа `#{tg_username}` не заменяются на реальные значения
- **Решение:** Проверьте, что переменные существуют в контексте Salebot

#### ❌ **Некорректный JSON**
- **Проблема:** JSON содержит синтаксические ошибки
- **Решение:** Проверьте JSON в валидаторе (например, jsonlint.com)

#### ❌ **Пустое тело запроса**
- **Проблема:** Salebot отправляет пустой запрос
- **Решение:** Проверьте настройки триггера в Salebot

### 3. Пошаговая настройка Salebot

1. **Откройте настройки API запроса в Salebot**

2. **Проверьте URL:**
   ```
   https://projects.inetskills.ru/api/referals/
   ```

3. **Установите заголовки:**
   ```
   x-api-key: #{API_SECRET_KEY}
   Content-Type: application/json
   ```

4. **Проверьте JSON тело:**
   ```json
   {
     "referal_id": "#{user_id}",
     "referer_id": "#{referer_id}",
     "referal_nickname": "#{tg_username}",
     "referer_nickname": "#{referer_nickname}",
     "referal_name": "#{full_name}",
     "referral_link_url": "#{reflink}",
     "personal_channel_link": "",
     "utm": ""
   }
   ```

5. **Убедитесь, что переменные существуют:**
   - `#{user_id}` - ID пользователя
   - `#{referer_id}` - ID пригласившего
   - `#{tg_username}` - Никнейм пользователя
   - `#{referer_nickname}` - Никнейм пригласившего
   - `#{full_name}` - Полное имя пользователя
   - `#{reflink}` - Реферальная ссылка

### 4. Тестирование

После настройки протестируйте запрос:

1. **В Salebot:** Используйте функцию "Тест запроса"
2. **В Postman:** Отправьте аналогичный запрос
3. **Проверьте логи сервера** для детальной диагностики

### 5. Логирование

Сервер теперь логирует все запросы от Salebot:

```
🔍 Salebot API Request Debug:
  Headers: {...}
  Body: {...}
  Content-Type: application/json
  User-Agent: Salebot/...
  IP: ...
  Timestamp: ...
```

### 6. Альтернативный endpoint

Если проблема продолжается, используйте endpoint для upsert:

**URL:** `https://projects.inetskills.ru/api/referals/upsert`

Этот endpoint более безопасен и не требует строгой проверки на дублирование.

## 🧪 Тестирование

Запустите диагностический скрипт:
```bash
node scripts/debug-salebot-api.js
```

## 📞 Поддержка

Если проблема не решается:
1. Проверьте логи сервера
2. Убедитесь, что все переменные Salebot существуют
3. Проверьте настройки API ключа
4. Используйте endpoint `/api/referals/upsert` вместо `/api/referals/`
