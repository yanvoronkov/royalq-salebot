# Формирование реферальной таблицы при раскрытии дочерних подтаблиц

## Обзор процесса

Реферальная таблица формируется динамически при раскрытии узлов дерева. Процесс состоит из нескольких этапов:

## 1. Инициализация

### Загрузка данных
```javascript
async function loadReferralData() {
    // 1. Загружаем данные из API /api/referrals/tree
    const response = await fetch('/api/referrals/tree');
    const data = await response.json();
    
    // 2. Преобразуем дерево в плоский список
    referralData = flattenTree(data.data);
    
    // 3. Рендерим таблицу с корневыми элементами
    renderTable();
}
```

### Преобразование дерева в плоский список
```javascript
function flattenTree(tree, level = 0, parentId = null) {
    const result = [];
    
    tree.forEach(item => {
        // Создаем плоский элемент с уровнем вложенности
        const flatItem = {
            ...item,
            level: level,
            referer_id: parentId,
            totalReferals: item.totalReferals || 0
        };
        result.push(flatItem);
        
        // Рекурсивно добавляем детей
        if (item.children && item.children.length > 0) {
            const children = flattenTree(item.children, level + 1, item.referal_id);
            result.push(...children);
        }
    });
    
    return result;
}
```

## 2. Начальное отображение

### Рендеринг корневых элементов
```javascript
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    // Показываем только корневые элементы (level === 0)
    const rootItems = referralData.filter(item => item.level === 0);
    
    rootItems.forEach(item => {
        const rowHTML = createTableRow(item);
        const tempDiv = document.createElement('tbody');
        tempDiv.innerHTML = rowHTML;
        const row = tempDiv.firstElementChild;
        tableBody.appendChild(row);
        
        // Если корневой элемент был раскрыт, показываем его детей
        if (expandedNodes.has(item.referal_id)) {
            showDirectChildren(item.referal_id, row);
        }
    });
}
```

## 3. Раскрытие узлов

### Обработка клика по кнопке раскрытия
```javascript
function toggleNode(nodeId) {
    const parentRow = document.querySelector(`tr[data-id="${nodeId}"]`);
    const button = parentRow.querySelector('.tree-toggle');
    
    if (expandedNodes.has(nodeId)) {
        // УЗЕЛ РАСКРЫТ - скрываем детей
        expandedNodes.delete(nodeId);
        button.className = 'tree-toggle collapsed';
        hideDirectChildren(nodeId);
    } else {
        // УЗЕЛ СВЕРНУТ - показываем детей
        expandedNodes.add(nodeId);
        button.className = 'tree-toggle expanded';
        showDirectChildren(nodeId, parentRow);
    }
    
    // Обновляем соединительные линии
    setTimeout(updateTreeLines, 10);
}
```

## 4. Показ дочерних элементов

### Функция showDirectChildren
```javascript
function showDirectChildren(parentId, parentRow) {
    // 1. Находим родительский элемент в данных
    const parent = referralData.find(item => item.referal_id === parentId);
    if (!parent || !parent.children || parent.children.length === 0) return;
    
    let insertPosition = parentRow; // Позиция для вставки
    
    // 2. Проходим по всем дочерним элементам
    parent.children.forEach(child => {
        // 3. Создаем HTML строки для дочернего элемента
        const childRowHTML = createTableRow(child);
        const tempDiv = document.createElement('tbody');
        tempDiv.innerHTML = childRowHTML;
        const childRow = tempDiv.firstElementChild;
        
        // 4. Вставляем строку после родительской
        insertPosition.parentNode.insertBefore(childRow, insertPosition.nextSibling);
        insertPosition = childRow;
        
        // 5. Если дочерний узел был раскрыт, показываем его детей
        if (expandedNodes.has(child.referal_id)) {
            showDirectChildren(child.referal_id, childRow);
            
            // Находим последнюю вставленную строку для правильного позиционирования
            let lastRow = childRow;
            let nextRow = childRow.nextElementSibling;
            while (nextRow && parseInt(nextRow.getAttribute('data-level')) > parseInt(childRow.getAttribute('data-level'))) {
                lastRow = nextRow;
                nextRow = nextRow.nextElementSibling;
            }
            insertPosition = lastRow;
        }
    });
}
```

## 5. Скрытие дочерних элементов

### Функция hideDirectChildren
```javascript
function hideDirectChildren(parentId) {
    // 1. Находим все прямые дочерние строки
    const childRows = document.querySelectorAll(`tr[data-parent="${parentId}"]`);
    
    childRows.forEach(row => {
        const childId = row.getAttribute('data-id');
        
        // 2. Удаляем строку из DOM
        row.remove();
        
        // 3. Рекурсивно удаляем всех потомков
        hideAllDescendants(childId);
        
        // 4. Убираем из expandedNodes если был раскрыт
        expandedNodes.delete(childId);
    });
}
```

### Рекурсивное скрытие потомков
```javascript
function hideAllDescendants(ancestorId) {
    const descendantRows = document.querySelectorAll(`tr[data-id]`);
    
    descendantRows.forEach(row => {
        const rowId = row.getAttribute('data-id');
        const rowData = referralData.find(item => item.referal_id === rowId);
        
        // Проверяем, является ли элемент потомком
        if (rowData && isDescendantOf(rowData, ancestorId)) {
            row.remove();
            expandedNodes.delete(rowId);
        }
    });
}
```

## 6. Создание строк таблицы

### Функция createTableRow
```javascript
function createTableRow(item) {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedNodes.has(item.referal_id);
    const structureCount = item.totalReferals || 0;
    
    return `
        <tr class="table-row" data-id="${item.referal_id}" data-level="${item.level}" data-parent="${item.referer_id || ''}" data-has-children="${hasChildren}">
            <td class="tree-cell level-${item.level}">
                <div class="tree-content">
                    <button class="tree-toggle ${hasChildren ? (isExpanded ? 'expanded' : 'collapsed') : 'no-children'}" 
                            ${hasChildren ? `onclick="toggleNode('${item.referal_id}')"` : ''}></button>
                    <span class="status-indicator ${Math.random() > 0.3 ? 'status-active' : 'status-inactive'}"></span>
                    ${structureCount}
                </div>
            </td>
            <td>${formatDate(item.reg_date)}</td>
            <td>${item.referal_id || '—'}</td>
            <td>${item.referer_id || '—'}</td>
            <td>${item.referal_nickname || '—'}</td>
            <td>${item.referer_nickname || '—'}</td>
        </tr>
    `;
}
```

## 7. Обновление соединительных линий

### Функция updateTreeLines
```javascript
function updateTreeLines() {
    // 1. Удаляем все существующие линии
    document.querySelectorAll('.tree-vertical-line, .tree-horizontal-line').forEach(line => line.remove());
    
    const rows = document.querySelectorAll('tr[data-id]');
    
    rows.forEach(row => {
        const level = parseInt(row.getAttribute('data-level'));
        const rowId = row.getAttribute('data-id');
        const hasChildren = row.getAttribute('data-has-children') === 'true';
        const isExpanded = expandedNodes.has(rowId);
        
        // 2. Добавляем горизонтальную линию для всех дочерних элементов
        if (level > 0) {
            const cell = row.querySelector('.tree-cell');
            const horizontalLine = document.createElement('div');
            horizontalLine.className = `tree-horizontal-line`;
            cell.appendChild(horizontalLine);
        }
        
        // 3. Если узел раскрыт и имеет детей, добавляем вертикальную линию
        if (hasChildren && isExpanded) {
            addVerticalLineForParent(row);
        }
    });
}
```

## 8. Структура данных

### Атрибуты строк таблицы
Каждая строка таблицы содержит следующие data-атрибуты:
- `data-id`: ID реферала
- `data-level`: Уровень вложенности (0, 1, 2, 3, 4)
- `data-parent`: ID родительского реферала
- `data-has-children`: Есть ли дочерние элементы (true/false)

### Состояние expandedNodes
```javascript
const expandedNodes = new Set(); // Хранит ID раскрытых узлов
```

## 9. Последовательность операций

### При раскрытии узла:
1. **Клик по кнопке** → `toggleNode(nodeId)`
2. **Проверка состояния** → `expandedNodes.has(nodeId)`
3. **Добавление в состояние** → `expandedNodes.add(nodeId)`
4. **Показ детей** → `showDirectChildren(nodeId, parentRow)`
5. **Создание строк** → `createTableRow(child)` для каждого ребенка
6. **Вставка в DOM** → `insertBefore(childRow, insertPosition.nextSibling)`
7. **Обновление линий** → `updateTreeLines()`

### При скрытии узла:
1. **Клик по кнопке** → `toggleNode(nodeId)`
2. **Удаление из состояния** → `expandedNodes.delete(nodeId)`
3. **Скрытие детей** → `hideDirectChildren(nodeId)`
4. **Удаление из DOM** → `row.remove()`
5. **Рекурсивное скрытие** → `hideAllDescendants(childId)`
6. **Обновление линий** → `updateTreeLines()`

## 10. Особенности реализации

### Динамическое формирование
- Таблица формируется динамически при каждом раскрытии/скрытии
- Не все данные загружаются сразу в DOM
- Строки добавляются/удаляются по мере необходимости

### Производительность
- Используется `Set` для быстрого поиска раскрытых узлов
- Рекурсивное скрытие оптимизировано
- Соединительные линии обновляются с задержкой (10ms)

### Иерархия
- Поддерживается до 4 уровней вложенности
- Каждый уровень имеет свой отступ и стиль
- Вертикальные линии соединяют родителя с последним ребенком
