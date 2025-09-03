# Документация фронтенда - RoyalQ Salebot

## 🎨 Обзор фронтенда

Фронтенд приложения построен на серверном рендеринге с использованием EJS шаблонов, CSS3 для стилизации и Vanilla JavaScript для интерактивности.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   EJS Templates │    │   CSS Styles    │    │   JavaScript    │
│   (Server-side) │    │   (Styling)     │    │   (Client-side) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📄 Шаблоны EJS

### Layout.ejs
**Назначение**: Основной макет приложения

**Структура**:
```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%- title %></title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <header>
    <nav><!-- Навигация --></nav>
  </header>
  <main>
    <%- body %> <!-- Вставка контента -->
  </main>
  <footer><!-- Подвал --></footer>
  <script src="/js/script.js"></script>
</body>
</html>
```

**Особенности**:
- Динамический заголовок через `<%- title %>`
- Вставка контента через `<%- body %>`
- Подключение статических ресурсов
- Русская локализация

### Referal-dashboard.ejs
**Назначение**: Дашборд с реферальным деревом

**Основные компоненты**:

#### Поиск
```html
<div class="search-container">
  <input type="text" id="searchInput" placeholder="Поиск по рефералам...">
</div>
```

#### Таблица рефералов
```html
<table class="referal-table">
  <thead>
    <tr>
      <th>Рефералы</th>
      <th>ID</th>
      <th>Никнейм</th>
      <th>Имя</th>
      <th>Дата регистрации</th>
      <th>Referer ID</th>
      <th>Реферальная ссылка</th>
      <th>Личный канал</th>
      <th>UTM</th>
      <th>Уровень</th>
    </tr>
  </thead>
  <tbody>
    <!-- Динамическое содержимое -->
  </tbody>
</table>
```

#### Функции EJS
**countTotalReferrals(node)**:
```javascript
<% function countTotalReferrals(node) { 
  let count = (node.children && node.children.length) || 0; 
  if (node.children) { 
    node.children.forEach(child => {
      count += countTotalReferrals(child);
    });
  }
  return count;
} %>
```

**displayReferalTree(tree, level, parentReferalId)**:
```javascript
<% function displayReferalTree(tree, level, parentReferalId) { 
  tree.forEach(referal => {
    const totalReferrals = countTotalReferrals(referal);
    // Рендеринг строки таблицы
  });
} %>
```

## 🎨 CSS Стили

### Основные стили (style.css)

#### Контейнеры
```css
.dashboard-container {
  padding: 20px;
  max-width: 100%;
}

.table-container {
  overflow-x: auto;
}
```

#### Таблица
```css
.referal-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 14px;
}

.referal-table th,
.referal-table td {
  padding: 12px 8px;
  border: 1px solid #ddd;
  text-align: left;
}

.referal-table th {
  background-color: #f2f2f2;
  position: sticky;
  top: 0;
  z-index: 1;
}
```

#### Дерево рефералов
```css
.tree-content {
  display: flex;
  align-items: center;
  padding-left: calc(var(--level, 0) * 24px);
  position: relative;
}

.tree-line {
  position: absolute;
  left: 11px;
  top: 24px;
  width: 2px;
  background-color: #ddd;
  display: none;
}

.toggle-button {
  cursor: pointer;
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  transition: background-color 0.2s;
  position: relative;
  z-index: 2;
  user-select: none;
}
```

#### Уровни дерева
```css
.level-1 { background-color: #ffffff; }
.level-2 { background-color: #fafafa; }
.level-3 { background-color: #f5f5f5; }
.level-4 { background-color: #f0f0f0; }
```

#### Состояния
```css
.collapsed {
  display: none;
}

.expanded-branch .tree-line {
  display: block;
  height: calc(100% + 1px);
}

.last-in-branch .tree-line {
  height: 50%;
}

.referal-row:hover {
  background-color: #f8f9fa;
}
```

#### Поиск
```css
.search-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-beginning;
}

#searchInput {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 300px;
  font-size: 16px;
  box-sizing: border-box;
}

#searchInput:focus {
  outline: none;
  border-color: #a0a0a0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}
```

## ⚡ JavaScript функциональность

### Основной модуль (script.js)

#### Инициализация
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const table = document.querySelector('.referal-table');
  // Инициализация функциональности
});
```

#### Управление деревом

**updateParentLines(row)**:
```javascript
function updateParentLines(row) {
  let currentRow = row;
  while (currentRow) {
    const refererId = currentRow.dataset.refererId;
    if (!refererId) break;

    const parentRow = table.querySelector(`tr[data-referal-id="${refererId}"]`);
    if (parentRow) {
      updateTreeLines(parentRow, true);
    }
    currentRow = parentRow;
  }
}
```

**updateTreeLines(row, isExpanding)**:
```javascript
function updateTreeLines(row, isExpanding) {
  const referalId = row.dataset.referalId;

  function getAllVisibleChildren(parentId) {
    const directChildren = Array.from(table.querySelectorAll(`tr[data-referer-id="${parentId}"]`));
    let allChildren = [...directChildren];

    directChildren.forEach(child => {
      if (!child.classList.contains('collapsed') && 
          child.querySelector('.toggle-button')?.textContent === '-') {
        allChildren = allChildren.concat(getAllVisibleChildren(child.dataset.referalId));
      }
    });

    return allChildren;
  }

  const visibleChildren = getAllVisibleChildren(referalId);
  // Логика обновления линий
}
```

#### Обработка кликов
```javascript
table.addEventListener('click', (e) => {
  const toggleButton = e.target.closest('.toggle-button');
  if (!toggleButton) return;

  const row = toggleButton.closest('tr');
  const referalId = row.dataset.referalId;
  const isExpanding = toggleButton.textContent === '+';

  const children = table.querySelectorAll(`tr[data-referer-id="${referalId}"]`);

  if (isExpanding) {
    // Разворачивание ветки
    children.forEach(child => {
      child.classList.remove('collapsed');
    });
    toggleButton.textContent = '-';
    updateTreeLines(row, true);
    updateParentLines(row);
  } else {
    // Сворачивание ветки
    const hideChildren = (parentId) => {
      const childRows = table.querySelectorAll(`tr[data-referer-id="${parentId}"]`);
      childRows.forEach(child => {
        child.classList.add('collapsed');
        child.classList.remove('expanded-branch', 'last-in-branch');
        const childButton = child.querySelector('.toggle-button');
        if (childButton) {
          childButton.textContent = '+';
          hideChildren(child.dataset.referalId);
        }
      });
    };
    hideChildren(referalId);
    toggleButton.textContent = '+';
    row.classList.remove('expanded-branch');
    updateParentLines(row);
  }
});
```

#### Поиск
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const tableRows = document.querySelectorAll('.referal-row');

  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();

    tableRows.forEach(row => {
      const rowText = row.textContent.toLowerCase();
      if (rowText.includes(searchTerm)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });
});
```

## 🎯 Интерактивные элементы

### Кнопки разворачивания
- **Визуальное состояние**: `+` (свернуто) / `-` (развернуто)
- **Функциональность**: Переключение видимости дочерних элементов
- **Стили**: Круглые кнопки с границами

### Линии дерева
- **Вертикальные линии**: Соединяют родительские и дочерние элементы
- **Горизонтальные линии**: Соединяют кнопки с вертикальными линиями
- **Динамическое обновление**: Высота линий изменяется при разворачивании/сворачивании

### Счетчики рефералов
- **Отображение**: Количество рефералов в каждой ветке
- **Стили**: Синие бейджи с закругленными углами
- **Обновление**: Автоматический пересчет при изменениях

## 📱 Адаптивность

### Мобильные устройства
```css
@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }
  
  .referal-table {
    font-size: 12px;
  }
  
  .referal-table th,
  .referal-table td {
    padding: 8px 4px;
  }
}
```

### Горизонтальная прокрутка
```css
.table-container {
  overflow-x: auto;
}
```

## 🎨 Дизайн-система

### Цветовая палитра
- **Основной**: #ffffff (белый)
- **Вторичный**: #f8f9fa (светло-серый)
- **Акцент**: #1976d2 (синий)
- **Границы**: #ddd (серый)
- **Текст**: #333 (темно-серый)

### Типографика
- **Основной шрифт**: Системный шрифт
- **Размеры**: 14px (таблица), 16px (поиск)
- **Высота строк**: 1.4

### Отступы и размеры
- **Контейнер**: padding: 20px
- **Ячейки таблицы**: padding: 12px 8px
- **Кнопки**: 24x24px
- **Отступы дерева**: 24px на уровень

## 🚀 Производительность

### Оптимизации
- **Минимальные DOM манипуляции**: Группировка изменений
- **Эффективные селекторы**: Использование data-атрибутов
- **Кэширование элементов**: Сохранение ссылок на DOM элементы

### Обработка событий
- **Event delegation**: Обработка кликов на уровне таблицы
- **Debouncing**: Для поиска (планируется)
- **Lazy loading**: Для больших деревьев (планируется)

## 🧪 Тестирование

### Ручное тестирование
- Проверка разворачивания/сворачивания веток
- Тестирование поиска
- Проверка адаптивности

### Планируемые автоматические тесты
```javascript
describe('Referal Tree', () => {
  it('should expand branch when clicking + button', () => {
    // Тест разворачивания
  });

  it('should collapse branch when clicking - button', () => {
    // Тест сворачивания
  });

  it('should filter rows when searching', () => {
    // Тест поиска
  });
});
```

## 🔮 Планы развития

### Краткосрочные улучшения
- [ ] Добавить анимации для разворачивания/сворачивания
- [ ] Реализовать экспорт данных в CSV/Excel
- [ ] Добавить фильтры по уровням

### Среднесрочные улучшения
- [ ] Реализовать виртуализацию для больших деревьев
- [ ] Добавить drag & drop для изменения структуры
- [ ] Реализовать темную тему

### Долгосрочные улучшения
- [ ] Переход на современный фронтенд фреймворк (React/Vue)
- [ ] Реализовать PWA функциональность
- [ ] Добавить офлайн поддержку

---

*Документация фронтенда обновлена: $(date)*  
*Версия: 1.0.0*
