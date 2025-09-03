# API Документация - RoyalQ Salebot

## 📚 Обзор API

API построен на REST принципах и предоставляет endpoints для управления реферальной сетью и платежами.

**Base URL**: `http://localhost:3000` (разработка)  
**Content-Type**: `application/json`  
**Методы**: GET, POST, PUT, DELETE

## 🔗 Рефералы API

### Создание реферала
```http
POST /api/referals
Content-Type: application/json

{
  "referal_id": "user123",
  "referer_id": "parent456",
  "referal_nickname": "john_doe",
  "referer_nickname": "parent_user",
  "referal_name": "John Doe",
  "referral_link_url": "https://example.com/ref/user123",
  "personal_channel_link": "https://t.me/user123_channel",
  "utm": "source=telegram&campaign=referral"
}
```

**Ответ (201 Created)**:
```json
{
  "message": "Referal created successfully",
  "data": {
    "referal_id": "user123",
    "referer_id": "parent456",
    "reg_date": "2024-01-15T10:30:00.000Z",
    "referal_nickname": "john_doe",
    "referer_nickname": "parent_user",
    "referal_name": "John Doe",
    "referral_link_url": "https://example.com/ref/user123",
    "personal_channel_link": "https://t.me/user123_channel",
    "utm": "source=telegram&campaign=referral",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Получение реферала по ID
```http
GET /api/referals/user123
```

**Ответ (200 OK)**:
```json
{
  "data": {
    "referal_id": "user123",
    "referer_id": "parent456",
    "reg_date": "2024-01-15T10:30:00.000Z",
    "referal_nickname": "john_doe",
    "referer_nickname": "parent_user",
    "referal_name": "John Doe",
    "referral_link_url": "https://example.com/ref/user123",
    "personal_channel_link": "https://t.me/user123_channel",
    "utm": "source=telegram&campaign=referral",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Обновление реферала
```http
PUT /api/referals/user123
Content-Type: application/json

{
  "referal_nickname": "john_doe_updated",
  "referal_name": "John Doe Updated"
}
```

**Ответ (200 OK)**:
```json
{
  "message": "Referal updated successfully",
  "data": {
    "referal_id": "user123",
    "referer_id": "parent456",
    "reg_date": "2024-01-15T10:30:00.000Z",
    "referal_nickname": "john_doe_updated",
    "referer_nickname": "parent_user",
    "referal_name": "John Doe Updated",
    "referral_link_url": "https://example.com/ref/user123",
    "personal_channel_link": "https://t.me/user123_channel",
    "utm": "source=telegram&campaign=referral",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

### Удаление реферала
```http
DELETE /api/referals/user123
```

**Ответ (200 OK)**:
```json
{
  "message": "Referal deleted successfully",
  "data": {
    "referal_id": "user123",
    "referer_id": "parent456",
    "reg_date": "2024-01-15T10:30:00.000Z",
    "referal_nickname": "john_doe_updated",
    "referer_nickname": "parent_user",
    "referal_name": "John Doe Updated",
    "referral_link_url": "https://example.com/ref/user123",
    "personal_channel_link": "https://t.me/user123_channel",
    "utm": "source=telegram&campaign=referral",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

## 💰 Платежи API

### Создание платежа
```http
POST /api/payments
Content-Type: application/json

{
  "userId": "user123",
  "amount": 99.99,
  "currency": "USD",
  "paymentMethod": "card",
  "status": "success",
  "transactionId": "txn_123456789",
  "subscriptionId": "sub_123456789"
}
```

**Ответ (201 Created)**:
```json
{
  "message": "Payment created successfully",
  "data": {
    "userId": "user123",
    "paymentDate": "2024-01-15T12:00:00.000Z",
    "amount": 99.99,
    "currency": "USD",
    "paymentMethod": "card",
    "status": "success",
    "transactionId": "txn_123456789",
    "subscriptionId": "sub_123456789",
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### Получение платежей пользователя
```http
GET /api/payments/user/user123
```

**Ответ (200 OK)**:
```json
{
  "data": [
    {
      "userId": "user123",
      "paymentDate": "2024-01-15T12:00:00.000Z",
      "amount": 99.99,
      "currency": "USD",
      "paymentMethod": "card",
      "status": "success",
      "transactionId": "txn_123456789",
      "subscriptionId": "sub_123456789",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    },
    {
      "userId": "user123",
      "paymentDate": "2024-01-10T10:00:00.000Z",
      "amount": 49.99,
      "currency": "USD",
      "paymentMethod": "paypal",
      "status": "success",
      "transactionId": "txn_987654321",
      "subscriptionId": "sub_987654321",
      "createdAt": "2024-01-10T10:00:00.000Z",
      "updatedAt": "2024-01-10T10:00:00.000Z"
    }
  ]
}
```

## 🌐 Веб-интерфейс

### Дашборд реферала
```http
GET /dashboard/parent456
```

**Ответ**: HTML страница с реферальным деревом

**Параметры**:
- `refererId` - ID реферера для построения дерева

## ❌ Обработка ошибок

### Стандартные коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Bad Request - неверные данные запроса |
| 404 | Not Found - ресурс не найден |
| 500 | Internal Server Error - внутренняя ошибка сервера |

### Формат ошибки
```json
{
  "error": {
    "message": "Описание ошибки",
    "code": "ERROR_CODE"
  }
}
```

### Примеры ошибок

**Реферал не найден (404)**:
```json
{
  "error": {
    "message": "Referal not found",
    "code": "REFERAL_NOT_FOUND"
  }
}
```

**Реферал не найден при создании платежа (400)**:
```json
{
  "error": {
    "message": "Referal with referal_id \"user123\" not found. Payment cannot be created.",
    "code": "REFERAL_NOT_FOUND"
  }
}
```

**Внутренняя ошибка сервера (500)**:
```json
{
  "error": {
    "message": "Internal Server Error",
    "code": "INTERNAL_ERROR"
  }
}
```

## 🔍 Тестовые endpoints

### Тест маршрутов платежей
```http
GET /payments/test
```

**Ответ**:
```
Payments routes are working!
```

## 📊 Схемы данных

### Referal Schema
```javascript
{
  referal_id: { type: String, required: true, unique: true, index: true },
  referer_id: { type: String, index: true },
  reg_date: { type: Date, default: Date.now },
  referal_nickname: { type: String },
  referer_nickname: { type: String },
  referal_name: { type: String },
  referral_link_url: { type: String },
  personal_channel_link: { type: String },
  utm: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Payment Schema
```javascript
{
  userId: { type: String, ref: 'Referal', required: true, index: true },
  paymentDate: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentMethod: { type: String },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  transactionId: { type: String, unique: true, sparse: true },
  subscriptionId: { type: String, sparse: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

## 🔧 Middleware

### Логирование
- **Morgan** - логирование HTTP запросов
- **Console** - логирование ошибок и отладочной информации

### Обработка данных
- **body-parser** - парсинг JSON и URL-encoded данных
- **express.static** - обслуживание статических файлов

### Обработка ошибок
- Централизованный обработчик ошибок
- Автоматическое логирование ошибок
- Стандартизированный формат ответов

## 🚀 Примеры использования

### JavaScript (Fetch API)
```javascript
// Создание реферала
const createReferal = async (referalData) => {
  const response = await fetch('/api/referals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(referalData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create referal');
  }
  
  return response.json();
};

// Получение реферала
const getReferal = async (referalId) => {
  const response = await fetch(`/api/referals/${referalId}`);
  
  if (!response.ok) {
    throw new Error('Referal not found');
  }
  
  return response.json();
};
```

### cURL
```bash
# Создание реферала
curl -X POST http://localhost:3000/api/referals \
  -H "Content-Type: application/json" \
  -d '{
    "referal_id": "user123",
    "referer_id": "parent456",
    "referal_nickname": "john_doe",
    "referal_name": "John Doe"
  }'

# Получение реферала
curl http://localhost:3000/api/referals/user123

# Создание платежа
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "amount": 99.99,
    "currency": "USD",
    "status": "success"
  }'
```

## 📈 Производительность

### Оптимизации
- **Mongoose .lean()** - возврат простых объектов вместо Mongoose документов
- **Индексы** - на поля `referal_id`, `referer_id`, `userId`
- **Ограничение глубины** - реферальное дерево до 4 уровней

### Рекомендации
- Используйте пагинацию для больших списков
- Кэшируйте часто запрашиваемые данные
- Мониторьте время ответа API

---

*API Документация обновлена: $(date)*  
*Версия API: 1.0.0*
