# Документация сервисов - RoyalQ Salebot

## 🏗️ Архитектура сервисов

Сервисы в приложении реализуют бизнес-логику и инкапсулируют работу с данными. Они следуют принципу **Single Responsibility** и обеспечивают разделение между контроллерами и моделями данных.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controllers   │───►│    Services     │───►│     Models      │
│   (HTTP Layer)  │    │ (Business Logic)│    │   (Data Layer)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 ReferalService

### Назначение
Сервис для управления рефералами, включая CRUD операции и построение реферального дерева.

### Основные методы

#### `createReferal(referalData)`
**Назначение**: Создание нового реферала в системе

**Параметры**:
- `referalData` (Object) - данные реферала для создания

**Возвращает**: `Promise<Document>` - созданный документ реферала

**Исключения**:
- `Error` - при ошибке создания реферала

**Пример использования**:
```javascript
const referalData = {
  referal_id: "user123",
  referer_id: "parent456",
  referal_nickname: "john_doe",
  referal_name: "John Doe"
};

const newReferal = await referalService.createReferal(referalData);
```

#### `getReferalById(referalId)`
**Назначение**: Получение реферала по его ID

**Параметры**:
- `referalId` (String) - идентификатор реферала

**Возвращает**: `Promise<Document|null>` - документ реферала или null

**Исключения**:
- `Error` - при ошибке поиска

**Оптимизация**: Использует `.lean()` для возврата простых объектов

#### `updateReferal(referalId, updateData)`
**Назначение**: Обновление данных реферала

**Параметры**:
- `referalId` (String) - ID реферала для обновления
- `updateData` (Object) - данные для обновления

**Возвращает**: `Promise<Document|null>` - обновленный документ

**Особенности**: Использует `findOneAndUpdate` с опцией `{ new: true }`

#### `deleteReferal(referalId)`
**Назначение**: Удаление реферала и всех связанных платежей

**Параметры**:
- `referalId` (String) - ID реферала для удаления

**Возвращает**: `Promise<Document|null>` - удаленный документ

**Бизнес-логика**:
1. Удаляет все платежи, связанные с рефералом
2. Удаляет самого реферала
3. Использует `findOneAndDelete` для атомарности операции

#### `getReferalTree(refererId, depth, currentDepth)`
**Назначение**: Построение реферального дерева с ограничением глубины

**Параметры**:
- `refererId` (String) - ID реферера для построения дерева
- `depth` (Number) - максимальная глубина (по умолчанию 4)
- `currentDepth` (Number) - текущая глубина рекурсии

**Возвращает**: `Promise<Array>` - массив объектов дерева

**Алгоритм**:
1. Рекурсивное построение дерева
2. Подсчет общего количества рефералов в структуре
3. Ограничение глубины для предотвращения бесконечной рекурсии

**Структура возвращаемых данных**:
```javascript
[
  {
    referal_id: "user123",
    referer_id: "parent456",
    // ... другие поля реферала
    children: [
      {
        referal_id: "child1",
        referer_id: "user123",
        // ... поля дочернего реферала
        children: [],
        totalReferals: 0
      }
    ],
    totalReferals: 5 // общее количество рефералов в структуре
  }
]
```

## 💰 PaymentService

### Назначение
Сервис для управления платежами с валидацией связей с рефералами.

### Основные методы

#### `createPayment(paymentData)`
**Назначение**: Создание нового платежа с проверкой существования реферала

**Параметры**:
- `paymentData` (Object) - данные платежа

**Возвращает**: `Promise<Document>` - созданный документ платежа

**Бизнес-логика**:
1. **Валидация**: Проверяет существование реферала с указанным `userId`
2. **Создание**: Создает платеж только если реферал существует
3. **Ошибка**: Выбрасывает ошибку 400 если реферал не найден

**Пример валидации**:
```javascript
const existingReferal = await Referal.findOne({ referal_id: userId }).lean();
if (!existingReferal) {
  const error = new Error(`Referal with referal_id "${userId}" not found. Payment cannot be created.`);
  error.statusCode = 400;
  throw error;
}
```

#### `getPaymentsByUserId(userId)`
**Назначение**: Получение всех платежей пользователя

**Параметры**:
- `userId` (String) - ID пользователя (referal_id)

**Возвращает**: `Promise<Document[]>` - массив платежей

**Оптимизация**: Использует `.lean()` для быстрого чтения

## 🤖 SalebotService

### Назначение
Сервис для интеграции с внешним API Salebot (заглушка для будущей реализации).

### Текущая реализация
```javascript
class SalebotService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: salebotConfig.baseUrl,
    });
  }

  async getReferalData(referalId) {
    // Заглушка для получения данных реферала из Salebot API
  }

  async getPaymentData(transactionId) {
    // Заглушка для получения данных платежа из Salebot API
  }
}
```

### Планируемые методы
- `getReferalData(referalId)` - получение данных реферала
- `getPaymentData(transactionId)` - получение данных платежа
- `syncReferals()` - синхронизация рефералов
- `processWebhook(data)` - обработка webhook'ов

## 🔄 Паттерны и принципы

### Dependency Injection
Сервисы используют прямые импорты моделей:
```javascript
import Referal from '../models/referal.model.js';
import Payment from '../models/payment.model.js';
```

### Error Handling
Все сервисы следуют единому паттерну обработки ошибок:
```javascript
try {
  // Бизнес-логика
  return result;
} catch (error) {
  console.error("Error description:", error);
  throw error; // Проброс для обработки в контроллере
}
```

### Async/Await
Все методы сервисов асинхронные и используют async/await для работы с базой данных.

### Lean Queries
Для оптимизации производительности используется `.lean()`:
```javascript
return await Referal.findOne({ referal_id: referalId }).lean();
```

## 📊 Производительность

### Оптимизации
1. **Lean Queries** - возврат простых объектов вместо Mongoose документов
2. **Индексы** - на часто используемые поля (`referal_id`, `referer_id`, `userId`)
3. **Ограничение глубины** - предотвращение бесконечной рекурсии в дереве
4. **Batch Operations** - группировка операций с базой данных

### Мониторинг
- Логирование времени выполнения операций
- Отслеживание количества запросов к БД
- Мониторинг использования памяти

## 🧪 Тестирование сервисов

### Unit тесты (планируется)
```javascript
describe('ReferalService', () => {
  describe('createReferal', () => {
    it('should create referal with valid data', async () => {
      const referalData = { referal_id: 'test123' };
      const result = await referalService.createReferal(referalData);
      expect(result.referal_id).toBe('test123');
    });

    it('should throw error for duplicate referal_id', async () => {
      // Тест дублирования
    });
  });
});
```

### Integration тесты (планируется)
- Тестирование взаимодействия с базой данных
- Проверка корректности построения дерева
- Валидация связей между рефералами и платежами

## 🔧 Конфигурация

### Переменные окружения
```bash
# Salebot API
SALEBOT_API_BASE_URL=https://api.salebot.pro
SALEBOT_API_KEY=your_api_key_here

# База данных
MONGODB_URI=mongodb://localhost:27017/royalq-salebot
```

### Настройки Mongoose
- Автоматическое создание индексов
- Валидация схем на уровне модели
- Middleware для каскадного удаления

## 🚀 Масштабирование

### Горизонтальное масштабирование
- Разделение сервисов по доменам
- Использование очередей для асинхронных операций
- Кэширование часто запрашиваемых данных

### Вертикальное масштабирование
- Оптимизация запросов к базе данных
- Использование connection pooling
- Мониторинг производительности

## 🔮 Планы развития

### Краткосрочные улучшения
- [ ] Добавить валидацию входных данных
- [ ] Реализовать кэширование для часто запрашиваемых данных
- [ ] Добавить метрики производительности

### Среднесрочные улучшения
- [ ] Реализовать полную интеграцию с Salebot API
- [ ] Добавить систему уведомлений
- [ ] Реализовать аудит изменений

### Долгосрочные улучшения
- [ ] Микросервисная архитектура
- [ ] Event-driven архитектура
- [ ] Машинное обучение для аналитики

---

*Документация сервисов обновлена: $(date)*  
*Версия: 1.0.0*
