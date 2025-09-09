// Table View JavaScript

class TableDashboard {
	constructor() {
		this.searchTerm = '';
		this.currentLevelFilter = 'all';
		this.init();
	}

	init() {
		this.bindEvents();
		this.calculateStats();
		this.updateTableStats();
		this.initializeTable();
	}

	bindEvents() {
		// Search functionality
		const searchInput = document.getElementById('searchInput');
		const clearSearch = document.getElementById('clearSearch');

		if (searchInput) {
			searchInput.addEventListener('input', (e) => {
				this.searchTerm = e.target.value.toLowerCase();
				this.filterTable();
				this.updateClearButton();
			});
		}

		if (clearSearch) {
			clearSearch.addEventListener('click', () => {
				searchInput.value = '';
				this.searchTerm = '';
				this.filterTable();
				this.updateClearButton();
			});
		}

		// Level filter
		const levelFilter = document.getElementById('levelFilter');
		if (levelFilter) {
			levelFilter.addEventListener('change', (e) => {
				this.currentLevelFilter = e.target.value;
				this.filterTable();
			});
		}

		// Expand/Collapse all
		const expandAll = document.getElementById('expandAll');
		const collapseAll = document.getElementById('collapseAll');

		if (expandAll) {
			expandAll.addEventListener('click', () => {
				this.expandAllRows();
			});
		}

		if (collapseAll) {
			collapseAll.addEventListener('click', () => {
				this.collapseAllRows();
			});
		}

		// Toggle buttons - use global instance
		document.addEventListener('click', (e) => {
			if (e.target.closest('.toggle-btn')) {
				e.preventDefault();
				e.stopPropagation();
				const button = e.target.closest('.toggle-btn');
				const targetId = button.dataset.target;
				if (tableDashboard) {
					tableDashboard.toggleRow(targetId);
				}
			}
		});

		// Copy buttons
		document.addEventListener('click', (e) => {
			if (e.target.closest('.copy-btn')) {
				const button = e.target.closest('.copy-btn');
				const row = button.closest('tr');
				const linkCell = row.querySelector('.link-text');
				if (linkCell) {
					const fullLink = linkCell.getAttribute('title') || linkCell.textContent;
					this.copyToClipboard(fullLink);
				}
			}
		});
	}

	initializeTable() {
		// First, collapse all rows with level > 1
		const allRows = document.querySelectorAll('.referral-row');
		allRows.forEach(row => {
			const level = parseInt(row.dataset.level);
			if (level > 1) {
				row.classList.add('collapsed');
			}
		});

		// Add click handlers for all toggle buttons
		const toggleButtons = document.querySelectorAll('.toggle-btn');

		toggleButtons.forEach(button => {
			const targetId = button.dataset.target;
			const hasChildren = button.closest('tr').dataset.hasChildren === 'true';

			if (hasChildren) {
				const isExpanded = !button.closest('tr').classList.contains('collapsed');
				this.updateToggleButton(button, isExpanded);

				// Add direct click handler
				button.addEventListener('click', (e) => {
					e.preventDefault();
					e.stopPropagation();
					if (tableDashboard) {
						tableDashboard.toggleRow(targetId);
					}
				});
			}
		});

		// Initialize tooltips
		this.initializeTooltips();
	}

	initializeTooltips() {
		// Add tooltips to truncated text
		const truncatedElements = document.querySelectorAll('[title]');
		truncatedElements.forEach(element => {
			element.addEventListener('mouseenter', (e) => {
				if (e.target.scrollWidth > e.target.clientWidth) {
					this.showTooltip(e.target, e.target.getAttribute('title'));
				}
			});

			element.addEventListener('mouseleave', () => {
				this.hideTooltip();
			});
		});
	}

	showTooltip(element, text) {
		const tooltip = document.createElement('div');
		tooltip.className = 'table-tooltip';
		tooltip.textContent = text;
		tooltip.style.cssText = `
			position: absolute;
			background: var(--text-primary);
			color: white;
			padding: 0.5rem;
			border-radius: 0.25rem;
			font-size: 0.75rem;
			z-index: 1000;
			pointer-events: none;
			max-width: 300px;
			word-wrap: break-word;
		`;

		document.body.appendChild(tooltip);

		const rect = element.getBoundingClientRect();
		tooltip.style.left = rect.left + 'px';
		tooltip.style.top = (rect.bottom + 5) + 'px';
	}

	hideTooltip() {
		const tooltip = document.querySelector('.table-tooltip');
		if (tooltip) {
			tooltip.remove();
		}
	}

	toggleRow(nodeId) {
		const targetRow = document.querySelector(`[data-referal-id="${nodeId}"]`);
		const toggleButton = targetRow?.querySelector('.toggle-btn');

		if (!targetRow || !toggleButton) {
			return;
		}

		const isCollapsed = targetRow.classList.contains('collapsed');

		if (isCollapsed) {
			this.expandRow(targetRow);
			this.updateToggleButton(toggleButton, true);
		} else {
			this.collapseRow(targetRow);
			this.updateToggleButton(toggleButton, false);
		}

		this.updateTableStats();
	}

	expandRow(row) {
		row.classList.remove('collapsed');

		// Find and expand all direct child rows
		const currentLevel = parseInt(row.dataset.level);
		const currentReferalId = row.dataset.referalId;

		// Find all rows that are direct children of this row
		const allRows = document.querySelectorAll('.referral-row');
		allRows.forEach(nextRow => {
			const nextLevel = parseInt(nextRow.dataset.level);
			const nextRefererId = nextRow.dataset.refererId;

			// If this is a direct child (level + 1 and correct parent)
			if (nextLevel === currentLevel + 1 && nextRefererId === currentReferalId) {
				nextRow.classList.remove('collapsed');
				const childToggle = nextRow.querySelector('.toggle-btn');
				if (childToggle) {
					this.updateToggleButton(childToggle, true);
				}
			}
		});
	}

	collapseRow(row) {
		row.classList.add('collapsed');

		// Find and collapse all child rows
		const currentLevel = parseInt(row.dataset.level);
		const currentReferalId = row.dataset.referalId;

		// Find all rows that are children of this row
		const allRows = document.querySelectorAll('.referral-row');
		allRows.forEach(nextRow => {
			const nextLevel = parseInt(nextRow.dataset.level);
			const nextRefererId = nextRow.dataset.refererId;

			// If this is a child of the current row, collapse it
			if (nextLevel > currentLevel && nextRefererId === currentReferalId) {
				nextRow.classList.add('collapsed');
				const childToggle = nextRow.querySelector('.toggle-btn');
				if (childToggle) {
					this.updateToggleButton(childToggle, false);
				}
			}
		});
	}

	updateToggleButton(button, isExpanded) {
		const icon = button.querySelector('i');
		if (icon) {
			icon.className = isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right';
		}
		button.classList.toggle('expanded', isExpanded);
	}

	expandAllRows() {
		const allRows = document.querySelectorAll('.referral-row');
		const toggleButtons = document.querySelectorAll('.toggle-btn');

		// Expand all rows
		allRows.forEach(row => {
			row.classList.remove('collapsed');
		});

		// Update all toggle buttons to expanded state
		toggleButtons.forEach(button => {
			this.updateToggleButton(button, true);
		});

		this.updateTableStats();
	}

	collapseAllRows() {
		const allRows = document.querySelectorAll('.referral-row');
		const toggleButtons = document.querySelectorAll('.toggle-btn');

		// Collapse all rows except level 1
		allRows.forEach(row => {
			const level = parseInt(row.dataset.level);
			if (level > 1) {
				row.classList.add('collapsed');
			}
		});

		// Update all toggle buttons to collapsed state
		toggleButtons.forEach(button => {
			this.updateToggleButton(button, false);
		});

		this.updateTableStats();
	}

	filterTable() {
		const rows = document.querySelectorAll('.referral-row');

		rows.forEach(row => {
			const level = parseInt(row.dataset.level);
			const shouldShowByLevel = this.shouldShowByLevel(level);
			const shouldShowBySearch = this.shouldShowBySearch(row);
			const isCollapsed = row.classList.contains('collapsed');

			// Show row if it matches filters and is not collapsed
			if (shouldShowByLevel && shouldShowBySearch && !isCollapsed) {
				row.style.display = '';
				this.highlightSearchTerms(row);
			} else {
				row.style.display = 'none';
			}
		});

		this.updateTableStats();
	}

	shouldShowByLevel(level) {
		if (this.currentLevelFilter === 'all') return true;
		return level <= parseInt(this.currentLevelFilter);
	}

	shouldShowBySearch(row) {
		if (!this.searchTerm) return true;
		const text = row.textContent.toLowerCase();
		return text.includes(this.searchTerm);
	}

	highlightSearchTerms(row) {
		if (!this.searchTerm) {
			this.removeHighlights(row);
			return;
		}

		const cells = row.querySelectorAll('td');
		cells.forEach(cell => {
			const walker = document.createTreeWalker(
				cell,
				NodeFilter.SHOW_TEXT,
				null,
				false
			);

			const textNodes = [];
			let textNode;

			while (textNode = walker.nextNode()) {
				textNodes.push(textNode);
			}

			textNodes.forEach(textNode => {
				const parent = textNode.parentNode;
				if (parent.classList.contains('highlight')) return;

				const text = textNode.textContent;
				const regex = new RegExp(`(${this.escapeRegExp(this.searchTerm)})`, 'gi');

				if (regex.test(text)) {
					const highlightedText = text.replace(regex, '<span class="highlight">$1</span>');
					const wrapper = document.createElement('span');
					wrapper.innerHTML = highlightedText;
					parent.replaceChild(wrapper, textNode);
				}
			});
		});
	}

	removeHighlights(row) {
		const highlights = row.querySelectorAll('.highlight');
		highlights.forEach(highlight => {
			const parent = highlight.parentNode;
			parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
			parent.normalize();
		});
	}

	escapeRegExp(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	updateClearButton() {
		const clearButton = document.getElementById('clearSearch');
		if (clearButton) {
			clearButton.style.display = this.searchTerm ? 'block' : 'none';
		}
	}

	calculateStats() {
		const rows = document.querySelectorAll('.referral-row');
		let totalReferrals = 0;
		let maxLevel = 0;
		let activeLevels = new Set();
		let todayReferrals = 0;

		const today = new Date().toDateString();

		rows.forEach(row => {
			const level = parseInt(row.dataset.level);
			maxLevel = Math.max(maxLevel, level);
			activeLevels.add(level);

			if (level > 1) {
				totalReferrals++;
			}

			const dateText = row.querySelector('.date')?.textContent;
			if (dateText && dateText.includes(today.split(' ')[1])) {
				todayReferrals++;
			}
		});

		this.updateStatElement('totalReferrals', totalReferrals);
		this.updateStatElement('maxLevel', maxLevel);
		this.updateStatElement('activeLevels', activeLevels.size);
		this.updateStatElement('todayReferrals', todayReferrals);
	}

	updateStatElement(id, value) {
		const element = document.getElementById(id);
		if (element) {
			this.animateNumber(element, parseInt(element.textContent) || 0, value);
		}
	}

	animateNumber(element, start, end) {
		const duration = 1000;
		const startTime = performance.now();

		const animate = (currentTime) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);

			const current = Math.round(start + (end - start) * this.easeOutQuart(progress));
			element.textContent = current.toLocaleString();

			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		};

		requestAnimationFrame(animate);
	}

	easeOutQuart(t) {
		return 1 - Math.pow(1 - t, 4);
	}

	updateTableStats() {
		const visibleRows = document.querySelectorAll('.referral-row[style*="block"], .referral-row:not([style])');
		const totalRows = document.querySelectorAll('.referral-row').length;
		const visibleCount = visibleRows.length;

		const statsElement = document.getElementById('tableStats');
		if (statsElement) {
			statsElement.textContent = `Показано ${visibleCount} из ${totalRows} рефералов`;
		}
	}

	copyToClipboard(text) {
		navigator.clipboard.writeText(text).then(() => {
			this.showNotification('Ссылка скопирована!', 'success');
		}).catch(() => {
			this.showNotification('Ошибка при копировании', 'error');
		});
	}

	showNotification(message, type = 'info') {
		const notification = document.createElement('div');
		notification.className = `notification notification-${type}`;
		notification.innerHTML = `
			<div class="notification-content">
				<i class="fas fa-${this.getNotificationIcon(type)}"></i>
				<span>${message}</span>
			</div>
		`;

		notification.style.cssText = `
			position: fixed;
			top: 2rem;
			right: 2rem;
			background: ${this.getNotificationColor(type)};
			color: white;
			padding: 1rem 1.5rem;
			border-radius: 0.5rem;
			box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
			z-index: 1000;
			transform: translateX(100%);
			transition: transform 0.3s ease;
			max-width: 400px;
		`;

		document.body.appendChild(notification);

		setTimeout(() => {
			notification.style.transform = 'translateX(0)';
		}, 100);

		setTimeout(() => {
			notification.style.transform = 'translateX(100%)';
			setTimeout(() => {
				document.body.removeChild(notification);
			}, 300);
		}, 3000);
	}

	getNotificationIcon(type) {
		const icons = {
			success: 'check-circle',
			error: 'exclamation-circle',
			warning: 'exclamation-triangle',
			info: 'info-circle'
		};
		return icons[type] || 'info-circle';
	}

	getNotificationColor(type) {
		const colors = {
			success: '#10b981',
			error: '#ef4444',
			warning: '#f59e0b',
			info: '#6366f1'
		};
		return colors[type] || '#6366f1';
	}
}

// View switching functions
function switchToTree() {
	const currentPath = window.location.pathname;
	const newPath = currentPath.replace('/table/', '/dashboard/');
	window.location.href = newPath;
}

function switchToTable() {
	const currentPath = window.location.pathname;
	const newPath = currentPath.replace('/dashboard/', '/table/');
	window.location.href = newPath;
}

// Global variable to store dashboard instance
let tableDashboard;

// Initialize table dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	tableDashboard = new TableDashboard();
});

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
	.notification-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	
	.notification-content i {
		font-size: 1.25rem;
	}
`;
document.head.appendChild(notificationStyles);

