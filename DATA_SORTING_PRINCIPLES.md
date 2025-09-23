# Принципы сортировки данных в таблицах

## Обзор

В текущей реализации реферальной системы **НЕТ явной сортировки** данных. Данные возвращаются в том порядке, в котором они хранятся в базе данных MongoDB.

## Текущее состояние сортировки

### 1. В базе данных MongoDB

**Корневые элементы** (referer_id: null):
```javascript
// Запрос без сортировки
await Referal.find({ referer_id: null }).lean();
```

**Дочерние элементы**:
```javascript
// Запрос без сортировки
await Referal.find({ referer_id: refererId }).lean();
```

### 2. Порядок данных в базе

Данные возвращаются в порядке их создания (по `_id` или `createdAt`):

**Корневые пользователи**:
1. `root001` - root_user (reg_date: 2025-01-01)
2. `root002` - admin_user (reg_date: 2025-01-02)

**Дочерние пользователи root001**:
1. `user001` - john_doe (reg_date: 2025-01-10)
2. `user002` - jane_smith (reg_date: 2025-01-11)

## Возможные принципы сортировки

### 1. По дате регистрации (reg_date)

```javascript
// Сортировка по возрастанию даты
await Referal.find({ referer_id: null }).sort({ reg_date: 1 }).lean();

// Сортировка по убыванию даты
await Referal.find({ referer_id: null }).sort({ reg_date: -1 }).lean();
```

### 2. По дате создания (createdAt)

```javascript
// Сортировка по дате создания
await Referal.find({ referer_id: null }).sort({ createdAt: 1 }).lean();
```

### 3. По ID реферала (referal_id)

```javascript
// Сортировка по ID
await Referal.find({ referer_id: null }).sort({ referal_id: 1 }).lean();
```

### 4. По никнейму (referal_nickname)

```javascript
// Сортировка по никнейму
await Referal.find({ referer_id: null }).sort({ referal_nickname: 1 }).lean();
```

### 5. По количеству рефералов (totalReferals)

```javascript
// Сортировка по убыванию количества рефералов
await Referal.find({ referer_id: null }).sort({ totalReferals: -1 }).lean();
```

## Рекомендуемые принципы сортировки

### 1. Для корневых элементов

**По дате регистрации (по возрастанию)**:
```javascript
const rootReferrals = await Referal.find({ referer_id: null })
    .sort({ reg_date: 1 })
    .lean();
```

**Обоснование**: Показывает хронологию развития реферальной сети.

### 2. Для дочерних элементов

**По дате регистрации (по возрастанию)**:
```javascript
const referals = await Referal.find({ referer_id: refererId })
    .sort({ reg_date: 1 })
    .lean();
```

**Обоснование**: Показывает порядок привлечения рефералов.

### 3. Альтернативная сортировка

**По количеству рефералов (по убыванию)**:
```javascript
const referals = await Referal.find({ referer_id: refererId })
    .sort({ totalReferals: -1 })
    .lean();
```

**Обоснование**: Показывает наиболее активных рефералов первыми.

## Реализация сортировки

### 1. Обновление сервиса

**Файл**: `src/services/referal.service.js`

```javascript
async getReferalTree(refererId, depth = 4, currentDepth = 1) {
    if (depth < currentDepth) {
        return [];
    }

    try {
        // Добавляем сортировку по дате регистрации
        const referals = await Referal.find({ referer_id: refererId })
            .sort({ reg_date: 1 })
            .lean();

        if (referals.length === 0) {
            return [];
        }

        const tree = [];

        for (const referal of referals) {
            const children = await this.getReferalTree(referal.referal_id, depth, currentDepth + 1);
            const totalReferals = children.reduce((sum, child) => sum + (child.totalReferals || 0) + 1, children.length);

            tree.push({ ...referal, children, totalReferals });
        }

        return tree;
    } catch (error) {
        console.error("Error getting referal tree:", error);
        throw error;
    }
}

async getAllReferralsTree() {
    try {
        // Добавляем сортировку для корневых элементов
        const rootReferrals = await Referal.find({ referer_id: null })
            .sort({ reg_date: 1 })
            .lean();

        const referralTrees = [];
        for (const rootReferral of rootReferrals) {
            const tree = await this.getReferalTree(rootReferral.referal_id);
            referralTrees.push(...tree);
        }

        return referralTrees;
    } catch (error) {
        console.error("Error getting all referrals tree:", error);
        throw error;
    }
}
```

### 2. Добавление индексов

**Файл**: `src/models/referal.model.js`

```javascript
const referalSchema = new mongoose.Schema({
    referal_id: { type: String, required: true, unique: true, index: true },
    referer_id: { type: String, index: true },
    reg_date: { type: Date, default: Date.now, index: true }, // Добавляем индекс
    referal_nickname: { type: String, index: true }, // Добавляем индекс
    referer_nickname: { type: String },
    referal_name: { type: String },
    referral_link_url: { type: String },
    personal_channel_link: { type: String },
    utm: { type: String }
}, {
    timestamps: true
});

// Составной индекс для оптимизации запросов
referalSchema.index({ referer_id: 1, reg_date: 1 });
```

## Влияние сортировки на интерфейс

### 1. Порядок отображения

- **Корневые элементы**: Отображаются в порядке регистрации
- **Дочерние элементы**: Отображаются в порядке привлечения
- **Иерархия**: Сохраняется независимо от сортировки

### 2. Пользовательский опыт

- **Хронология**: Показывает развитие реферальной сети
- **Активность**: Выделяет наиболее активных рефералов
- **Логичность**: Упрощает понимание структуры

## Текущий порядок данных

### Без сортировки (текущее состояние):

```
Корневые:
1. root001 (2025-01-01)
2. root002 (2025-01-02)

Дочерние root001:
1. user001 (2025-01-10)
2. user002 (2025-01-11)

Дочерние root002:
1. user003 (2025-01-12)
```

### С сортировкой по дате регистрации:

```
Корневые:
1. root001 (2025-01-01) ← первый
2. root002 (2025-01-02) ← второй

Дочерние root001:
1. user001 (2025-01-10) ← первый привлеченный
2. user002 (2025-01-11) ← второй привлеченный
```

## Рекомендации

### 1. Добавить сортировку по дате регистрации
- Показывает хронологию развития
- Упрощает понимание структуры
- Соответствует логике реферальной системы

### 2. Добавить индексы для оптимизации
- Ускоряет запросы с сортировкой
- Улучшает производительность
- Поддерживает составные запросы

### 3. Рассмотреть альтернативные сортировки
- По активности (количество рефералов)
- По алфавиту (никнейм)
- По дате последней активности

## Заключение

В текущей реализации **сортировка отсутствует**, данные возвращаются в порядке создания. Рекомендуется добавить сортировку по дате регистрации для улучшения пользовательского опыта и логичности отображения данных.
