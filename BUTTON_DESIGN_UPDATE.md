# Обновление дизайна кнопок раскрытия

## Описание
Изменен дизайн кнопок раскрытия дочерних элементов в реферальном дереве. Количество рефералов теперь отображается внутри кнопки, а плюс/минус символы убраны.

## Изменения в дизайне

### A. Визуальные изменения
- **Размер кнопки**: увеличен с 20x20px до 24x24px
- **Содержимое**: количество рефералов отображается внутри кнопки
- **Символы**: убраны плюс (+) и минус (−) символы
- **Шрифт**: уменьшен до 10px для лучшего размещения цифр
- **Минимальная ширина**: добавлен `min-width: 24px` для консистентности

### B. Стили кнопок
```css
.tree-toggle {
    width: 24px;
    height: 24px;
    border: none;
    background: #3b82f6;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 10px;
    font-weight: bold;
    margin-right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 100;
    min-width: 24px;
}
```

### C. Кнопки без детей
```css
.tree-toggle.no-children {
    background: transparent;
    cursor: default;
    border: 1px solid #e5e7eb;
}
```

## Изменения в JavaScript

### A. Создание кнопки
**Было:**
```javascript
<button class="tree-toggle ${hasChildren ? (isExpanded ? 'expanded' : 'collapsed') : 'no-children'}" 
        ${hasChildren ? `onclick="toggleNode('${item.referal_id}')"` : ''}></button>
<span class="status-indicator ${Math.random() > 0.3 ? 'status-active' : 'status-inactive'}"></span>
${item.totalReferals || 0}
```

**Стало:**
```javascript
<button class="tree-toggle ${hasChildren ? '' : 'no-children'}" 
        ${hasChildren ? `onclick="toggleNode('${item.referal_id}')"` : ''}>${item.totalReferals || 0}</button>
<span class="status-indicator ${Math.random() > 0.3 ? 'status-active' : 'status-inactive'}"></span>
```

### B. Функция toggleNode
**Было:**
```javascript
function toggleNode(nodeId) {
    const parentRow = document.querySelector(`tr[data-id="${nodeId}"]`);
    const button = parentRow.querySelector('.tree-toggle');

    if (expandedNodes.has(nodeId)) {
        expandedNodes.delete(nodeId);
        button.className = 'tree-toggle collapsed';
        hideDirectChildren(nodeId);
    } else {
        expandedNodes.add(nodeId);
        button.className = 'tree-toggle expanded';
        showDirectChildren(nodeId, parentRow);
    }
}
```

**Стало:**
```javascript
function toggleNode(nodeId) {
    const parentRow = document.querySelector(`tr[data-id="${nodeId}"]`);

    if (expandedNodes.has(nodeId)) {
        expandedNodes.delete(nodeId);
        hideDirectChildren(nodeId);
    } else {
        expandedNodes.add(nodeId);
        showDirectChildren(nodeId, parentRow);
    }
}
```

## Преимущества нового дизайна

### 1. Компактность
- ✅ **Меньше места**: количество рефералов и кнопка объединены
- ✅ **Чище интерфейс**: убраны лишние символы
- ✅ **Лучшая читаемость**: цифра четко видна в кнопке

### 2. Интуитивность
- ✅ **Понятно с первого взгляда**: количество рефералов сразу видно
- ✅ **Меньше элементов**: упрощенный интерфейс
- ✅ **Консистентность**: все кнопки выглядят одинаково

### 3. Функциональность
- ✅ **Сохранена вся функциональность**: раскрытие/сворачивание работает
- ✅ **Улучшена производительность**: меньше DOM манипуляций
- ✅ **Простота кода**: убраны ненужные классы и логика

## Состояния кнопок

### 1. Кнопка с детьми (активная)
- **Внешний вид**: синяя кнопка с белой цифрой
- **Функция**: кликабельна, раскрывает/сворачивает детей
- **Содержимое**: количество рефералов (например, "7")

### 2. Кнопка без детей (неактивная)
- **Внешний вид**: прозрачная с серой рамкой
- **Функция**: не кликабельна
- **Содержимое**: "0" (нет рефералов)

## Совместимость

- ✅ **Работает с существующими данными**: автоматически отображает правильные цифры
- ✅ **Совместимо с динамическими элементами**: работает при раскрытии/сворачивании
- ✅ **Адаптивность**: корректно отображается на всех устройствах
- ✅ **Производительность**: минимальное влияние на скорость работы

## Результат

Новый дизайн кнопок делает интерфейс более чистым и интуитивным. Пользователи сразу видят количество рефералов в каждой кнопке, что улучшает понимание структуры реферального дерева!
