# Исправление проблемы с классами уровней

## Проблема

При раскрытии дочерних подтаблиц не присваивался правильный класс уровня (`level-0`, `level-1`, `level-2`, и т.д.), что приводило к отсутствию смещения и неправильному отображению иерархии.

## Причина

В функции `showDirectChildren()` при создании дочерних элементов использовались объекты из `parent.children`, которые не содержали правильное значение `level`. Это приводило к тому, что в HTML генерировался класс `level-undefined`.

## Исправление

### Изменения в функции `showDirectChildren()`:

```javascript
function showDirectChildren(parentId, parentRow) {
    const parent = referralData.find(item => item.referal_id === parentId);
    if (!parent || !parent.children || parent.children.length === 0) return;

    // Получаем уровень родительского элемента
    const parentLevel = parseInt(parentRow.getAttribute('data-level'));
    let insertPosition = parentRow;

    parent.children.forEach(child => {
        // Создаем объект дочернего элемента с правильным уровнем
        const childWithLevel = {
            ...child,
            level: parentLevel + 1  // Уровень дочернего элемента = уровень родителя + 1
        };
        
        const childRowHTML = createTableRow(childWithLevel);
        // ... остальной код
    });
}
```

### Ключевые изменения:

1. **Получение уровня родителя**: `const parentLevel = parseInt(parentRow.getAttribute('data-level'));`

2. **Создание объекта с правильным уровнем**:
   ```javascript
   const childWithLevel = {
       ...child,
       level: parentLevel + 1
   };
   ```

3. **Использование исправленного объекта**: `createTableRow(childWithLevel)`

## Результат

Теперь при раскрытии узлов:

- ✅ Дочерние элементы получают правильный класс уровня (`level-1`, `level-2`, и т.д.)
- ✅ Применяются правильные отступы в соответствии с уровнем вложенности
- ✅ Горизонтальные линии позиционируются корректно
- ✅ Иерархия отображается визуально правильно

## Структура классов уровней

```css
.level-0 .tree-content { margin-left: 0px; }     /* Корневые элементы */
.level-1 .tree-content { margin-left: 25px; }    /* Первый уровень */
.level-2 .tree-content { margin-left: 50px; }    /* Второй уровень */
.level-3 .tree-content { margin-left: 75px; }    /* Третий уровень */
.level-4 .tree-content { margin-left: 100px; }   /* Четвертый уровень */
```

## Позиционирование горизонтальных линий

```css
.level-0 .tree-horizontal-line { left: 21px; }
.level-1 .tree-horizontal-line { left: 9px; }
.level-2 .tree-horizontal-line { left: 34px; }
.level-3 .tree-horizontal-line { left: 59px; }
```

## Тестирование

Для проверки исправления:

1. Откройте http://localhost:3000/network
2. Раскройте любой узел с дочерними элементами
3. Убедитесь, что дочерние элементы имеют правильные отступы
4. Проверьте, что горизонтальные линии отображаются корректно
5. Раскройте дочерние узлы и убедитесь в правильности вложенности

Теперь интерфейс корректно отображает иерархическую структуру с правильными отступами и соединительными линиями.
