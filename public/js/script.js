document.addEventListener('DOMContentLoaded', () => {
	const table = document.querySelector('.referal-table');

	// Функция для обновления высоты линий всех родительских элементов
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

	// Обновленная функция для расчета высоты линий
	function updateTreeLines(row, isExpanding) {
		const referalId = row.dataset.referalId;

		// Рекурсивная функция для получения всех видимых потомков
		function getAllVisibleChildren(parentId) {
			const directChildren = Array.from(table.querySelectorAll(`tr[data-referer-id="${parentId}"]`));
			let allChildren = [...directChildren];

			directChildren.forEach(child => {
				if (!child.classList.contains('collapsed') && child.querySelector('.toggle-button')?.textContent === '-') {
					allChildren = allChildren.concat(getAllVisibleChildren(child.dataset.referalId));
				}
			});

			return allChildren;
		}

		const visibleChildren = getAllVisibleChildren(referalId);

		if (visibleChildren.length === 0) return;

		if (isExpanding) {
			row.classList.add('expanded-branch');

			// Находим последнего видимого потомка
			const lastChild = visibleChildren[visibleChildren.length - 1];

			// Обновляем классы для правильного отображения линий
			visibleChildren.forEach(child => child.classList.remove('last-in-branch'));
			lastChild.classList.add('last-in-branch');

			// Устанавливаем высоту линии
			const treeLineElement = row.querySelector('.tree-line');
			if (treeLineElement) {
				const totalHeight = visibleChildren
					.filter(child => !child.classList.contains('collapsed'))
					.reduce((height, child) => height + child.offsetHeight, 0);
				treeLineElement.style.height = `${totalHeight}px`;
			}
		} else {
			row.classList.remove('expanded-branch');
			visibleChildren.forEach(child => {
				child.classList.remove('expanded-branch', 'last-in-branch');
			});
		}
	}

	table.addEventListener('click', (e) => {
		const toggleButton = e.target.closest('.toggle-button');
		if (!toggleButton) return;

		const row = toggleButton.closest('tr');
		const referalId = row.dataset.referalId;
		const isExpanding = toggleButton.textContent === '+';

		const children = table.querySelectorAll(`tr[data-referer-id="${referalId}"]`);

		if (isExpanding) {
			children.forEach(child => {
				child.classList.remove('collapsed');
			});
			toggleButton.textContent = '-';
			updateTreeLines(row, true);
			// Обновляем линии всех родительских элементов
			updateParentLines(row);
		} else {
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
			// Обновляем линии всех родительских элементов
			updateParentLines(row);
		}
	});

	// Инициализация линий при загрузке страницы
	const expandedButtons = table.querySelectorAll('.toggle-button');
	expandedButtons.forEach(button => {
		if (button.textContent === '-') {
			updateTreeLines(button.closest('tr'), true);
		}
	});
});