# Документация контроллеров - RoyalQ Salebot

## 🎯 Обзор контроллеров

Контроллеры в приложении реализуют слой представления (Presentation Layer) и отвечают за обработку HTTP запросов, валидацию входных данных и формирование ответов.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   HTTP Request  │───►│   Controller    │───►│     Service     │
│                 │    │   (Validation)  │    │ (Business Logic)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 ReferalController

### Назначение
Контроллер для управления рефералами, включая CRUD операции и веб-интерфейс.

### Основные методы

#### `createReferal(req, res, next)`
**HTTP метод**: POST  
**Endpoint**: `/api/referals`  
**Назначение**: Создание нового реферала

**Параметры**:
- `req.body` - данные реферала из тела запроса
- `res` - объект ответа Express
- `next` - функция для передачи ошибок в middleware

**Логика**:
1. Извлекает данные из `req.body`
2. Вызывает `referalService.createReferal()`
3. Возвращает JSON ответ с кодом 201 (Created)

**Ответ (201)**:
```json
{
  "message": "Referal created successfully",
  "data": { /* созданный реферал */ }
}
```

**Обработка ошибок**:
- Логирует ошибку в консоль
- Передает ошибку в централизованный обработчик через `next(error)`

#### `getReferalDashboard(req, res, next)`
**HTTP метод**: GET  
**Endpoint**: `/dashboard/:refererId`  
**Назначение**: Отображение веб-дашборда реферала

**Параметры**:
- `req.params.refererId` - ID реферера из URL
- `res` - объект ответа Express
- `next` - функция для передачи ошибок

**Логика**:
1. Получает `refererId` из параметров URL
2. Вызывает `referalService.getReferalTree()` для построения дерева
3. Вызывает `referalService.getReferalById()` для данных реферала
4. Рендерит шаблон `layout.ejs` с вложенным `referal-dashboard.ejs`

**Особенности**:
- Использует `res.renderToString()` для рендеринга вложенных шаблонов
- Передает данные в шаблоны через контекст

#### `getReferalById(req, res, next)`
**HTTP метод**: GET  
**Endpoint**: `/api/referals/:referalId`  
**Назначение**: Получение реферала по ID (тестовый режим)

**Параметры**:
- `req.params.referalId` - ID реферала из URL
- `res` - объект ответа Express
- `next` - функция для передачи ошибок

**Текущая реализация**:
- Рендерит шаблон `referal-dashboard.ejs` для тестирования
- Закомментирован JSON API endpoint

**Планируемый JSON ответ (200)**:
```json
{
  "data": { /* данные реферала */ }
}
```

**Ошибка (404)**:
```json
{
  "message": "Referal not found"
}
```

#### `updateReferal(req, res, next)`
**HTTP метод**: PUT  
**Endpoint**: `/api/referals/:referalId`  
**Назначение**: Обновление данных реферала

**Параметры**:
- `req.params.referalId` - ID реферала для обновления
- `req.body` - данные для обновления
- `res` - объект ответа Express
- `next` - функция для передачи ошибок

**Логика**:
1. Извлекает `referalId` из параметров URL
2. Извлекает `updateData` из тела запроса
3. Вызывает `referalService.updateReferal()`
4. Возвращает соответствующий HTTP код

**Ответ (200)**:
```json
{
  "message": "Referal updated successfully",
  "data": { /* обновленный реферал */ }
}
```

**Ошибка (404)**:
```json
{
  "message": "Referal not found"
}
```

#### `deleteReferal(req, res, next)`
**HTTP метод**: DELETE  
**Endpoint**: `/api/referals/:referalId`  
**Назначение**: Удаление реферала

**Параметры**:
- `req.params.referalId` - ID реферала для удаления
- `res` - объект ответа Express
- `next` - функция для передачи ошибок

**Логика**:
1. Извлекает `referalId` из параметров URL
2. Вызывает `referalService.deleteReferal()`
3. Проверяет результат операции
4. Возвращает соответствующий HTTP код

**Ответ (200)**:
```json
{
  "message": "Referal deleted successfully",
  "data": { /* удаленный реферал */ }
}
```

**Ошибка (404)**:
```json
{
  "message": "Referal not found"
}
```

## 💰 PaymentController

### Назначение
Контроллер для управления платежами с валидацией связей с рефералами.

### Основные методы

#### `createPayment(req, res, next)`
**HTTP метод**: POST  
**Endpoint**: `/api/payments`  
**Назначение**: Создание нового платежа

**Параметры**:
- `req.body` - данные платежа из тела запроса
- `res` - объект ответа Express
- `next` - функция для передачи ошибок

**Логика**:
1. Извлекает данные платежа из `req.body`
2. Вызывает `paymentService.createPayment()`
3. Возвращает JSON ответ с кодом 201 (Created)

**Ответ (201)**:
```json
{
  "message": "Payment created successfully",
  "data": { /* созданный платеж */ }
}
```

**Обработка ошибок**:
- Логирует ошибку в консоль
- Передает ошибку в централизованный обработчик

#### `getPaymentsByUserId(req, res, next)`
**HTTP метод**: GET  
**Endpoint**: `/api/payments/user/:userId`  
**Назначение**: Получение платежей пользователя

**Параметры**:
- `req.params.userId` - ID пользователя из URL
- `res` - объект ответа Express
- `next` - функция для передачи ошибок

**Логика**:
1. Извлекает `userId` из параметров URL
2. Вызывает `paymentService.getPaymentsByUserId()`
3. Возвращает JSON ответ с массивом платежей

**Ответ (200)**:
```json
{
  "data": [ /* массив платежей пользователя */ ]
}
```

## 🔧 Паттерны и принципы

### Error Handling
Все контроллеры следуют единому паттерну обработки ошибок:

```javascript
try {
  // Основная логика
  const result = await service.method(data);
  res.status(200).json({ data: result });
} catch (error) {
  console.error("Error in Controller - method:", error);
  next(error); // Передача в централизованный обработчик
}
```

### HTTP Status Codes
Контроллеры используют стандартные HTTP коды:

| Код | Описание | Использование |
|-----|----------|---------------|
| 200 | OK | Успешное получение/обновление |
| 201 | Created | Успешное создание |
| 400 | Bad Request | Неверные данные запроса |
| 404 | Not Found | Ресурс не найден |
| 500 | Internal Server Error | Внутренняя ошибка сервера |

### Response Format
Стандартизированный формат ответов:

**Успешный ответ**:
```json
{
  "message": "Описание операции",
  "data": { /* данные */ }
}
```

**Ответ с ошибкой**:
```json
{
  "error": {
    "message": "Описание ошибки",
    "code": "ERROR_CODE"
  }
}
```

### Middleware Integration
Контроллеры интегрированы с middleware:

- **Morgan** - логирование HTTP запросов
- **Body-parser** - парсинг JSON и URL-encoded данных
- **Error Handler** - централизованная обработка ошибок

## 🌐 Веб-интерфейс

### Рендеринг шаблонов
Контроллеры используют EJS для рендеринга веб-страниц:

```javascript
// Простой рендеринг
res.render('template-name', { data: templateData });

// Рендеринг с вложенными шаблонами
res.render('layout', {
  title: 'Page Title',
  body: await res.renderToString('nested-template', { data: templateData })
});
```

### Передача данных в шаблоны
Данные передаются через контекст шаблона:

```javascript
res.render('referal-dashboard', {
  referal: referalData,
  referalTree: treeData
});
```

## 📊 Валидация данных

### Текущее состояние
Валидация происходит на уровне моделей Mongoose:

```javascript
const referalSchema = new mongoose.Schema({
  referal_id: { type: String, required: true, unique: true },
  // ... другие поля с валидацией
});
```

### Планируемые улучшения
- Добавление валидации на уровне контроллеров
- Использование библиотек валидации (Joi, express-validator)
- Валидация типов данных и форматов

## 🔍 Логирование

### Текущее логирование
```javascript
console.error("Error in Controller - method:", error);
```

### Планируемые улучшения
- Структурированное логирование (Winston, Pino)
- Логирование запросов и ответов
- Метрики производительности

## 🧪 Тестирование контроллеров

### Unit тесты (планируется)
```javascript
describe('ReferalController', () => {
  describe('createReferal', () => {
    it('should create referal and return 201', async () => {
      const mockData = { referal_id: 'test123' };
      const mockService = jest.fn().mockResolvedValue(mockData);
      
      // Тест контроллера
    });
  });
});
```

### Integration тесты (планируется)
- Тестирование полного цикла запрос-ответ
- Проверка корректности HTTP кодов
- Валидация формата ответов

## 🚀 Производительность

### Оптимизации
- Асинхронная обработка запросов
- Минимальная обработка данных в контроллерах
- Делегирование бизнес-логики в сервисы

### Мониторинг
- Время обработки запросов
- Количество ошибок
- Использование памяти

## 🔮 Планы развития

### Краткосрочные улучшения
- [ ] Добавить валидацию входных данных
- [ ] Реализовать пагинацию для списков
- [ ] Добавить кэширование ответов

### Среднесрочные улучшения
- [ ] Реализовать аутентификацию и авторизацию
- [ ] Добавить rate limiting
- [ ] Реализовать API версионирование

### Долгосрочные улучшения
- [ ] GraphQL API
- [ ] WebSocket поддержка
- [ ] Микросервисная архитектура

---

*Документация контроллеров обновлена: $(date)*  
*Версия: 1.0.0*
