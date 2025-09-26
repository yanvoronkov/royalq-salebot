// RoyalQ Salebot - Referral Network JavaScript

// Состояние раскрытых/скрытых узлов
const expandedNodes = new Set(); // Изначально все узлы свернуты
let referralData = [];
let maxLevel = 0;
let totalReferrals = 0;

// ID пользователя из URL (если есть)
const userReferalId = document.querySelector('meta[name="user-referal-id"]')?.content || '';

// API ключ для readonly доступа из переменных окружения
const API_READONLY_KEY = document.querySelector('meta[name="api-readonly-key"]')?.content || '';

/**
 * Автоматически рассчитывает позицию горизонтальной линии на основе уровня вложенности
 * @param {number} level - Уровень вложенности (0-9)
 * @returns {number} - Позиция left в пикселях
 */
function calculateHorizontalLinePosition(level) {
	// Базовые параметры для расчета позиции
	const baseOffset = 7; // Базовое смещение для уровня 1
	const levelSpacing = 25; // Расстояние между уровнями
	const additionalOffset = -1; // Дополнительное смещение (как было в CSS)

	// Формула: базовое смещение + (уровень - 1) * расстояние между уровнями + дополнительное смещение
	return baseOffset + (level - 1) * levelSpacing + additionalOffset;
}

// Функция для форматирования даты
function formatDate(dateString) {
	if (!dateString) return '—';
	const date = new Date(dateString);
	return date.toLocaleDateString('ru-RU', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});
}

// Функция для создания строки таблицы
function createTableRow(item) {
	const hasChildren = item.children && item.children.length > 0;
	const isExpanded = expandedNodes.has(item.referal_id);

	return `
        <tr class="table-row" data-id="${item.referal_id}" data-level="${item.level}" data-parent="${item.referer_id || ''}" data-has-children="${hasChildren}">
            <td class="tree-cell level-${item.level}">
                <div class="tree-content">
                    <button class="tree-toggle ${hasChildren ? '' : 'no-children'}" 
                            ${hasChildren ? `onclick="toggleNode('${item.referal_id}')"` : ''}>
                        ${hasChildren ? (isExpanded ?
			`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M13.5126 21.4874C14.0251 22 14.8501 22 16.5 22C18.1499 22 18.9749 22 19.4874 21.4874C20 20.9749 20 20.1499 20 18.5C20 16.8501 20 16.0251 19.4874 15.5126C18.9749 15 18.1499 15 16.5 15C14.8501 15 14.0251 15 13.5126 15.5126C13 16.0251 13 16.8501 13 18.5C13 20.1499 13 20.9749 13.5126 21.4874ZM15.9167 17.9167H14.9444C14.6223 17.9167 14.3611 18.1778 14.3611 18.5C14.3611 18.8222 14.6223 19.0833 14.9444 19.0833H15.9167H17.0833H18.0556C18.3777 19.0833 18.6389 18.8222 18.6389 18.5C18.6389 18.1778 18.3777 17.9167 18.0556 17.9167H17.0833H15.9167Z" fill="#ffffff"></path> <path d="M15.6782 13.5028C15.2051 13.5085 14.7642 13.5258 14.3799 13.5774C13.737 13.6639 13.0334 13.8705 12.4519 14.4519C11.8705 15.0333 11.6639 15.737 11.5775 16.3799C11.4998 16.9576 11.4999 17.6635 11.5 18.414V18.586C11.4999 19.3365 11.4998 20.0424 11.5775 20.6201C11.6381 21.0712 11.7579 21.5522 12.0249 22C12.0166 22 12.0083 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C13.3262 13 14.577 13.1815 15.6782 13.5028Z" fill="#ffffff"></path> <circle cx="12" cy="6" r="4" fill="#ffffff"></circle> </g></svg>` :
			`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="12" cy="6" r="4" fill="#ffffff"></circle> <path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 22C14.8501 22 14.0251 22 13.5126 21.4874C13 20.9749 13 20.1499 13 18.5C13 16.8501 13 16.0251 13.5126 15.5126C14.0251 15 14.8501 15 16.5 15C18.1499 15 18.9749 15 19.4874 15.5126C20 16.0251 20 16.8501 20 18.5C20 20.1499 20 20.9749 19.4874 21.4874C18.9749 22 18.1499 22 16.5 22ZM17.0833 16.9444C17.0833 16.6223 16.8222 16.3611 16.5 16.3611C16.1778 16.3611 15.9167 16.6223 15.9167 16.9444V17.9167H14.9444C14.6223 17.9167 14.3611 18.1778 14.3611 18.5C14.3611 18.8222 14.6223 19.0833 14.9444 19.0833H15.9167V20.0556C15.9167 20.3777 16.1778 20.6389 16.5 20.6389C16.8222 20.6389 17.0833 20.3777 17.0833 20.0556V19.0833H18.0556C18.3777 19.0833 18.6389 18.8222 18.6389 18.5C18.6389 18.1778 18.3777 17.9167 18.0556 17.9167H17.0833V16.9444Z" fill="#ffffff"></path> <path d="M15.6782 13.5028C15.2051 13.5085 14.7642 13.5258 14.3799 13.5774C13.737 13.6639 13.0334 13.8705 12.4519 14.4519C11.8705 15.0333 11.6639 15.737 11.5775 16.3799C11.4998 16.9576 11.4999 17.6635 11.5 18.414V18.586C11.4999 19.3365 11.4998 20.0424 11.5775 20.6201C11.6381 21.0712 11.7579 21.5522 12.0249 22C12.0166 22 12.0083 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C13.3262 13 14.577 13.1815 15.6782 13.5028Z" fill="#ffffff"></path> </g></svg>`) :
			`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="12" cy="6" r="4" fill="#ffffff"></circle> <ellipse cx="12" cy="17" rx="7" ry="4" fill="#ffffff"></ellipse> </g></svg>`}
                        <span class="count-text">${item.totalReferals || 0}</span>
                    </button>
                    <span class="status-indicator ${Math.random() > 0.3 ? 'status-active' : 'status-inactive'}"></span>
                </div>
            </td>
            <td>${formatDate(item.reg_date)}</td>
            <td>${item.referal_nickname || '—'}</td>
            <td>${item.referal_name || '—'}</td>
            <td>${item.referer_nickname || '—'}</td>
            <td>${item.channel_activity || 'Неактивен'}</td>
        </tr>
    `;
}

function toggleNode(nodeId) {
	const parentRow = document.querySelector(`tr[data-id="${nodeId}"]`);
	const button = parentRow.querySelector('.tree-toggle');

	if (expandedNodes.has(nodeId)) {
		// Скрываем детей
		expandedNodes.delete(nodeId);
		hideDirectChildren(nodeId);
		// Обновляем иконку на закрытую
		updateButtonIcon(button, false);
	} else {
		// Показываем детей
		expandedNodes.add(nodeId);
		showDirectChildren(nodeId, parentRow);
		// Обновляем иконку на открытую
		updateButtonIcon(button, true);
	}

	// Обновляем соединительные линии
	setTimeout(updateTreeLines, 10);
}

/**
 * Обновляет иконку кнопки в зависимости от состояния раскрытия
 * @param {HTMLElement} button - Кнопка для обновления
 * @param {boolean} isExpanded - Состояние раскрытия
 */
function updateButtonIcon(button, isExpanded) {
	const svg = button.querySelector('svg');
	if (svg) {
		svg.outerHTML = isExpanded ?
			`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M13.5126 21.4874C14.0251 22 14.8501 22 16.5 22C18.1499 22 18.9749 22 19.4874 21.4874C20 20.9749 20 20.1499 20 18.5C20 16.8501 20 16.0251 19.4874 15.5126C18.9749 15 18.1499 15 16.5 15C14.8501 15 14.0251 15 13.5126 15.5126C13 16.0251 13 16.8501 13 18.5C13 20.1499 13 20.9749 13.5126 21.4874ZM15.9167 17.9167H14.9444C14.6223 17.9167 14.3611 18.1778 14.3611 18.5C14.3611 18.8222 14.6223 19.0833 14.9444 19.0833H15.9167H17.0833H18.0556C18.3777 19.0833 18.6389 18.8222 18.6389 18.5C18.6389 18.1778 18.3777 17.9167 18.0556 17.9167H17.0833H15.9167Z" fill="#ffffff"></path> <path d="M15.6782 13.5028C15.2051 13.5085 14.7642 13.5258 14.3799 13.5774C13.737 13.6639 13.0334 13.8705 12.4519 14.4519C11.8705 15.0333 11.6639 15.737 11.5775 16.3799C11.4998 16.9576 11.4999 17.6635 11.5 18.414V18.586C11.4999 19.3365 11.4998 20.0424 11.5775 20.6201C11.6381 21.0712 11.7579 21.5522 12.0249 22C12.0166 22 12.0083 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C13.3262 13 14.577 13.1815 15.6782 13.5028Z" fill="#ffffff"></path> <circle cx="12" cy="6" r="4" fill="#ffffff"></circle> </g></svg>` :
			`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="12" cy="6" r="4" fill="#ffffff"></circle> <path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 22C14.8501 22 14.0251 22 13.5126 21.4874C13 20.9749 13 20.1499 13 18.5C13 16.8501 13 16.0251 13.5126 15.5126C14.0251 15 14.8501 15 16.5 15C18.1499 15 18.9749 15 19.4874 15.5126C20 16.0251 20 16.8501 20 18.5C20 20.1499 20 20.9749 19.4874 21.4874C18.9749 22 18.1499 22 16.5 22ZM17.0833 16.9444C17.0833 16.6223 16.8222 16.3611 16.5 16.3611C16.1778 16.3611 15.9167 16.6223 15.9167 16.9444V17.9167H14.9444C14.6223 17.9167 14.3611 18.1778 14.3611 18.5C14.3611 18.8222 14.6223 19.0833 14.9444 19.0833H15.9167V20.0556C15.9167 20.3777 16.1778 20.6389 16.5 20.6389C16.8222 20.6389 17.0833 20.3777 17.0833 20.0556V19.0833H18.0556C18.3777 19.0833 18.6389 18.8222 18.6389 18.5C18.6389 18.1778 18.3777 17.9167 18.0556 17.9167H17.0833V16.9444Z" fill="#ffffff"></path> <path d="M15.6782 13.5028C15.2051 13.5085 14.7642 13.5258 14.3799 13.5774C13.737 13.6639 13.0334 13.8705 12.4519 14.4519C11.8705 15.0333 11.6639 15.737 11.5775 16.3799C11.4998 16.9576 11.4999 17.6635 11.5 18.414V18.586C11.4999 19.3365 11.4998 20.0424 11.5775 20.6201C11.6381 21.0712 11.7579 21.5522 12.0249 22C12.0166 22 12.0083 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C13.3262 13 14.577 13.1815 15.6782 13.5028Z" fill="#ffffff"></path> </g></svg>`;
	}
}

function hideDirectChildren(parentId) {
	const childRows = document.querySelectorAll(`tr[data-parent="${parentId}"]`);
	childRows.forEach(row => {
		const childId = row.getAttribute('data-id');
		row.remove();

		// Рекурсивно удаляем всех потомков
		hideAllDescendants(childId);

		// Убираем из expandedNodes если был раскрыт
		expandedNodes.delete(childId);
	});
}

function hideAllDescendants(ancestorId) {
	const descendantRows = document.querySelectorAll(`tr[data-id]`);
	descendantRows.forEach(row => {
		const rowId = row.getAttribute('data-id');
		const rowData = referralData.find(item => item.referal_id === rowId);
		if (rowData && isDescendantOf(rowData, ancestorId)) {
			row.remove();
			expandedNodes.delete(rowId);
		}
	});
}

function isDescendantOf(item, ancestorId) {
	if (!item.referer_id) return false;
	if (item.referer_id === ancestorId) return true;

	const parent = referralData.find(p => p.referal_id === item.referer_id);
	return parent ? isDescendantOf(parent, ancestorId) : false;
}

function showDirectChildren(parentId, parentRow) {
	const parent = referralData.find(item => item.referal_id === parentId);
	if (!parent || !parent.children || parent.children.length === 0) return;

	const parentLevel = parseInt(parentRow.getAttribute('data-level'));
	let insertPosition = parentRow;

	parent.children.forEach(child => {
		// Создаем объект дочернего элемента с правильным уровнем
		const childWithLevel = {
			...child,
			level: parentLevel + 1
		};

		const childRowHTML = createTableRow(childWithLevel);
		const tempDiv = document.createElement('tbody');
		tempDiv.innerHTML = childRowHTML;
		const childRow = tempDiv.firstElementChild;

		// Вставляем строку после текущей позиции
		insertPosition.parentNode.insertBefore(childRow, insertPosition.nextSibling);
		insertPosition = childRow;

		// Если дочерний узел был раскрыт, показываем его детей
		if (expandedNodes.has(child.referal_id)) {
			showDirectChildren(child.referal_id, childRow);
			// Находим последнюю вставленную строку
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

function updateTreeLines() {
	// Удаляем все существующие линии
	document.querySelectorAll('.tree-vertical-line, .tree-horizontal-line').forEach(line => line.remove());

	const rows = document.querySelectorAll('tr[data-id]');

	rows.forEach(row => {
		const level = parseInt(row.getAttribute('data-level'));
		const rowId = row.getAttribute('data-id');
		const hasChildren = row.getAttribute('data-has-children') === 'true';
		const isExpanded = expandedNodes.has(rowId);

		if (level > 0) {
			const cell = row.querySelector('.tree-cell');

			// Добавляем горизонтальную линию с номером уровня для всех дочерних элементов
			const horizontalLine = document.createElement('div');
			horizontalLine.className = `tree-horizontal-line`;
			horizontalLine.textContent = level; // Отображаем номер уровня в кружке

			// Автоматически рассчитываем позицию на основе уровня
			const leftPosition = calculateHorizontalLinePosition(level);
			horizontalLine.style.left = `${leftPosition}px`;

			cell.appendChild(horizontalLine);
		}

		// Если узел раскрыт и имеет детей, добавляем вертикальную линию
		if (hasChildren && isExpanded) {
			addVerticalLineForParent(row);
		}
	});
}

function addVerticalLineForParent(parentRow) {
	const parentId = parentRow.getAttribute('data-id');
	const parentLevel = parseInt(parentRow.getAttribute('data-level'));
	const parentCell = parentRow.querySelector('.tree-cell');

	// Находим всех прямых детей этого родителя
	const childRows = [];
	let nextRow = parentRow.nextElementSibling;

	while (nextRow && nextRow.tagName === 'TR') {
		const nextLevel = parseInt(nextRow.getAttribute('data-level'));
		const nextParent = nextRow.getAttribute('data-parent');

		// Если уровень меньше или равен родительскому, прерываем
		if (nextLevel <= parentLevel) {
			break;
		}

		// Если это прямой ребенок
		if (nextLevel === parentLevel + 1 && nextParent === parentId) {
			childRows.push(nextRow);
		}

		nextRow = nextRow.nextElementSibling;
	}

	if (childRows.length > 0) {
		// Вычисляем позицию и размер вертикальной линии
		const firstChild = childRows[0];
		const lastChild = childRows[childRows.length - 1];

		const parentRect = parentRow.getBoundingClientRect();
		const firstChildRect = firstChild.getBoundingClientRect();
		const lastChildRect = lastChild.getBoundingClientRect();

		const verticalLine = document.createElement('div');
		verticalLine.className = 'tree-vertical-line';

		// Позиционируем линию от центра кнопки родителя
		const buttonLeftOffset = 13 + (parentLevel * 25); // 21px - центр кнопки, 25px - отступ на уровень
		verticalLine.style.left = buttonLeftOffset + 'px';

		// Линия идет от середины родительской строки до середины последней дочерней
		const startY = parentRect.height / 2;
		const endY = (lastChildRect.bottom - firstChildRect.top) + (firstChildRect.height / 2);

		verticalLine.style.top = startY + 'px';
		verticalLine.style.height = (endY - startY) + 'px';

		parentCell.appendChild(verticalLine);
	}
}

// Функция для построения плоского списка из дерева
function flattenTree(tree, level = 0, parentId = null) {
	const result = [];

	tree.forEach(item => {
		// Подсчитываем общее количество рефералов в структуре
		const totalReferals = item.totalReferals || 0;

		const flatItem = {
			...item,
			level: level,
			referer_id: parentId,
			totalReferals: totalReferals
		};
		result.push(flatItem);

		if (item.children && item.children.length > 0) {
			const children = flattenTree(item.children, level + 1, item.referal_id);
			result.push(...children);
		}
	});

	return result;
}

// Функция для рендеринга таблицы
function renderTable(data = null) {
	const tableBody = document.getElementById('tableBody');
	tableBody.innerHTML = '';

	// Используем переданные данные или все данные
	const dataToRender = data || referralData;

	if (dataToRender.length === 0) {
		tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="error">
                    Нет данных для отображения
                </td>
            </tr>
        `;
		return;
	}

	// Если это результаты поиска, показываем все найденные элементы
	if (data) {
		dataToRender.forEach(item => {
			const rowHTML = createTableRow(item);
			const tempDiv = document.createElement('tbody');
			tempDiv.innerHTML = rowHTML;
			const row = tempDiv.firstElementChild;
			tableBody.appendChild(row);
		});
	} else {
		// Обычный режим - показываем только корневые элементы
		const rootItems = dataToRender.filter(item => item.level === 0);

		rootItems.forEach(item => {
			const rowHTML = createTableRow(item);
			const tempDiv = document.createElement('tbody');
			tempDiv.innerHTML = rowHTML;
			const row = tempDiv.firstElementChild;
			tableBody.appendChild(row);

			// Если корневой элемент раскрыт, показываем его детей
			if (expandedNodes.has(item.referal_id)) {
				showDirectChildren(item.referal_id, row);
			}
		});
	}

	// Обновляем соединительные линии после рендеринга
	setTimeout(updateTreeLines, 10);
}

// Функция для обновления статистики
async function updateStats() {
	const totalReferralsCount = referralData.length;
	const maxLevelsCount = Math.max(...referralData.map(item => item.level)) + 1;

	// Находим последнюю дату регистрации
	const lastRegDate = referralData
		.filter(item => item.reg_date)
		.sort((a, b) => new Date(b.reg_date) - new Date(a.reg_date))[0];

	// Загружаем статистику активности с сервера
	try {
		// Определяем URL для загрузки статистики активности (используем readonly API)
		const statsApiUrl = userReferalId ? `/api/readonly/referrals/${userReferalId}/activity-stats` : '/api/readonly/referrals/activity-stats';

		// Добавляем API ключ для readonly доступа
		const headers = {
			'x-api-key': API_READONLY_KEY,
			'Content-Type': 'application/json'
		};

		const response = await fetch(statsApiUrl, { headers });
		const result = await response.json();

		if (result.status && result.data) {
			document.getElementById('activeReferrals').textContent = result.data.active;
			document.getElementById('inactiveReferrals').textContent = result.data.inactive;
		} else {
			// Fallback: считаем активными тех, у кого есть никнейм
			const activeReferralsCount = referralData.filter(item => item.referal_nickname).length;
			document.getElementById('activeReferrals').textContent = activeReferralsCount;
			document.getElementById('inactiveReferrals').textContent = totalReferralsCount - activeReferralsCount;
		}
	} catch (error) {
		console.error('Ошибка загрузки статистики активности:', error);
		// Fallback: считаем активными тех, у кого есть никнейм
		const activeReferralsCount = referralData.filter(item => item.referal_nickname).length;
		document.getElementById('activeReferrals').textContent = activeReferralsCount;
		document.getElementById('inactiveReferrals').textContent = totalReferralsCount - activeReferralsCount;
	}

	document.getElementById('totalReferrals').textContent = totalReferralsCount;
	document.getElementById('maxLevels').textContent = maxLevelsCount;
	document.getElementById('lastRegistration').textContent = lastRegDate ? formatDate(lastRegDate.reg_date) : '—';

	document.getElementById('statsBar').style.display = 'flex';
}

// Функции поиска
function searchReferrals(searchTerm) {
	if (!referralData || referralData.length === 0) {
		return;
	}

	if (!searchTerm || searchTerm.trim() === '') {
		// Если поиск пустой, показываем все данные
		renderTable();
		return;
	}

	const term = searchTerm.toLowerCase().trim();

	const filteredData = referralData.filter(item => {
		// Поиск по всем полям
		const fields = [
			item.referal_id,
			item.referer_id,
			item.referal_nickname,
			item.referer_nickname,
			item.referal_name,
			item.channel_activity,
			formatDate(item.reg_date)
		];

		return fields.some(field =>
			field && field.toString().toLowerCase().includes(term)
		);
	});

	renderTable(filteredData);
}

function clearSearch() {
	const searchInput = document.getElementById('searchInput');
	const clearButton = document.getElementById('clearSearch');

	searchInput.value = '';
	clearButton.disabled = true;
	renderTable();
}

function setupSearch() {
	const searchInput = document.getElementById('searchInput');
	const clearButton = document.getElementById('clearSearch');

	if (!searchInput || !clearButton) {
		return;
	}

	// Поиск при вводе
	searchInput.addEventListener('input', (e) => {
		const searchTerm = e.target.value;
		clearButton.disabled = searchTerm.trim() === '';
		searchReferrals(searchTerm);
	});

	// Очистка поиска
	clearButton.addEventListener('click', () => {
		clearSearch();
	});

	// Поиск по Enter
	searchInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') {
			searchReferrals(e.target.value);
		}
	});
}

// Функция управления раскрытием
function toggleExpandAll() {
	if (!referralData || referralData.length === 0) {
		return;
	}

	const toggleBtn = document.getElementById('toggleExpand');
	const isExpanded = expandedNodes.size > 0;

	if (isExpanded) {
		// Сворачиваем все
		expandedNodes.clear();
		toggleBtn.textContent = 'Раскрыть все';
		toggleBtn.classList.remove('collapsed');
	} else {
		// Раскрываем все
		const itemsWithChildren = referralData.filter(item =>
			item.children && item.children.length > 0
		);

		itemsWithChildren.forEach(item => {
			expandedNodes.add(item.referal_id);
		});

		toggleBtn.textContent = 'Свернуть все';
		toggleBtn.classList.add('collapsed');
	}

	// Перерисовываем таблицу
	renderTable();
}

function setupExpandControls() {
	const toggleBtn = document.getElementById('toggleExpand');

	if (!toggleBtn) {
		return;
	}

	toggleBtn.addEventListener('click', toggleExpandAll);
}

// Функция для загрузки данных
async function loadReferralData() {
	try {
		// Определяем URL для загрузки данных (используем readonly API)
		const apiUrl = userReferalId ? `/api/readonly/referrals/${userReferalId}/tree` : '/api/readonly/referrals/tree';

		// Добавляем API ключ для readonly доступа
		const headers = {
			'x-api-key': API_READONLY_KEY,
			'Content-Type': 'application/json'
		};

		const response = await fetch(apiUrl, { headers });
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();

		if (data.status && data.data && data.data.length > 0) {
			// Преобразуем дерево в плоский список с уровнями
			referralData = flattenTree(data.data);

			// Рендерим таблицу
			renderTable();

			// Обновляем статистику
			await updateStats();
		} else {
			document.getElementById('tableBody').innerHTML = `
                <tr>
                    <td colspan="6" class="error">
                        Нет данных для отображения
                    </td>
                </tr>
            `;
		}
	} catch (error) {
		console.error('Ошибка загрузки данных:', error);
		document.getElementById('tableBody').innerHTML = `
            <tr>
                <td colspan="6" class="error">
                    Ошибка загрузки данных: ${error.message}
                </td>
            </tr>
        `;
	}
}

// Функция обновления таблицы
async function refreshTable() {
	const refreshBtn = document.getElementById('refreshBtn');

	if (!refreshBtn) return;

	// Показываем состояние загрузки
	refreshBtn.classList.add('loading');
	refreshBtn.disabled = true;

	try {
		// Очищаем текущие данные
		referralData = [];
		expandedNodes.clear();

		// Показываем индикатор загрузки
		document.getElementById('tableBody').innerHTML = `
			<tr>
				<td colspan="6" class="loading">
					<div class="loading-spinner"></div>
					Обновление данных...
				</td>
			</tr>
		`;

		// Загружаем новые данные
		await loadReferralData();

	} catch (error) {
		console.error('Ошибка обновления данных:', error);
		document.getElementById('tableBody').innerHTML = `
			<tr>
				<td colspan="6" class="error">
					Ошибка обновления данных: ${error.message}
				</td>
			</tr>
		`;
	} finally {
		// Убираем состояние загрузки
		refreshBtn.classList.remove('loading');
		refreshBtn.disabled = false;
	}
}

function setupRefreshButton() {
	const refreshBtn = document.getElementById('refreshBtn');

	if (!refreshBtn) {
		return;
	}

	refreshBtn.addEventListener('click', refreshTable);
}

// Инициализация
document.addEventListener('DOMContentLoaded', function () {
	loadReferralData();
	setupSearch();
	setupExpandControls();
	setupRefreshButton();
});
