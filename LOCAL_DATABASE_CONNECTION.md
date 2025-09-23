# Подключение к локальной тестовой базе MongoDB

## Обзор

Приложение теперь подключено к существующей локальной тестовой базе данных MongoDB вместо создания тестовых данных в функции.

## Изменения

### 1. Обновление конфигурации базы данных

**Файл**: `src/config/database.config.js`

**Изменение**:
```javascript
// Было:
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/royalq-salebot';

// Стало:
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/royalq_salebot_db';
```

### 2. Подключение к существующей базе данных

**База данных**: `royalq_salebot_db`
**Коллекции**:
- `referals` - 13 записей
- `payments` - записи о платежах

## Структура данных в базе

### Коллекция `referals` содержит:

```javascript
{
  _id: ObjectId('...'),
  referal_id: 'root001',           // Уникальный ID реферала
  referer_id: null,                // ID пригласившего (null для корневых)
  reg_date: ISODate('2025-01-01T00:00:00.000Z'),
  referal_nickname: 'root_user',   // Никнейм реферала
  referer_nickname: null,          // Никнейм пригласившего
  referal_name: 'Root User',       // Имя реферала
  referral_link_url: 'https://example.com/ref/root001',
  personal_channel_link: 'https://t.me/root_channel',
  utm: 'source=direct&campaign=main',
  __v: 0,
  createdAt: ISODate('2025-09-20T08:14:15.199Z'),
  updatedAt: ISODate('2025-09-20T08:14:15.199Z')
}
```

## Иерархия данных

### Корневые пользователи (referer_id: null):
- `root001` - root_user
- `root002` - admin_user

### Пользователи первого уровня:
- `user001` - john_doe (приглашен root001)
- `user002` - jane_smith (приглашен root001)
- `user003` - bob_wilson (приглашен root002)

### Пользователи второго уровня:
- `user004` - alice_brown (приглашен user001)
- `user005` - charlie_davis (приглашен user001)
- `user006` - diana_prince (приглашен user002)

### Пользователи третьего уровня:
- `user007` - eve_adams (приглашен user004)
- `user008` - frank_miller (приглашен user005)
- `user009` - grace_hopper (приглашен user006)

### Пользователи четвертого уровня:
- `user010` - henry_ford (приглашен user007)
- `user011` - iris_west (приглашен user008)

## API Endpoints

### GET /api/referrals/tree
Возвращает древовидную структуру всех рефералов из локальной базы данных.

**Ответ**:
```json
{
  "status": true,
  "data": [
    {
      "referal_id": "user001",
      "referal_nickname": "john_doe",
      "totalReferals": 12,
      "children": [
        {
          "referal_id": "user004",
          "referal_nickname": "alice_brown",
          "totalReferals": 4,
          "children": [...]
        }
      ]
    }
  ]
}
```

## Преимущества

### 1. Реальные данные
- Используются существующие данные из локальной базы
- Нет необходимости создавать тестовые данные
- Данные сохраняются между перезапусками

### 2. Производительность
- Быстрое подключение к локальной базе
- Оптимизированные запросы
- Кэширование данных

### 3. Разработка
- Легко тестировать с реальными данными
- Возможность модификации данных через MongoDB
- Отладка с реальной структурой

## Проверка подключения

### 1. Проверка MongoDB:
```bash
mongosh --eval "db.adminCommand('ping')"
```

### 2. Проверка базы данных:
```bash
mongosh royalq_salebot_db --eval "db.referals.countDocuments()"
```

### 3. Проверка API:
```bash
curl http://localhost:3000/api/referrals/tree
```

### 4. Проверка веб-интерфейса:
```bash
curl http://localhost:3000/network
```

## Результат

✅ Приложение подключено к локальной тестовой базе MongoDB
✅ Используются реальные данные из коллекции `referals`
✅ API возвращает древовидную структуру из базы данных
✅ Веб-интерфейс отображает данные из локальной базы
✅ Нет необходимости в создании тестовых данных

Теперь интерфейс работает с реальными данными из вашей локальной базы MongoDB!
