// Modern Referral Dashboard JavaScript

class ReferralDashboard {
	constructor() {
		this.searchTerm = '';
		this.currentLevelFilter = 'all';
		this.init();
	}

	init() {
		this.bindEvents();
		this.calculateStats();
		this.updateTreeStats();
		this.initializeTree();
	}

	bindEvents() {
		// Search functionality
		const searchInput = document.getElementById('searchInput');
		const clearSearch = document.getElementById('clearSearch');

		if (searchInput) {
			searchInput.addEventListener('input', (e) => {
				this.searchTerm = e.target.value.toLowerCase();
				this.filterTree();
				this.updateClearButton();
			});
		}

		if (clearSearch) {
			clearSearch.addEventListener('click', () => {
				searchInput.value = '';
				this.searchTerm = '';
				this.filterTree();
				this.updateClearButton();
			});
		}

		// Level filter
		const levelFilter = document.getElementById('levelFilter');
		if (levelFilter) {
			levelFilter.addEventListener('change', (e) => {
				this.currentLevelFilter = e.target.value;
				this.filterTree();
			});
		}

		// Expand/Collapse all
		const expandAll = document.getElementById('expandAll');
		const collapseAll = document.getElementById('collapseAll');

		if (expandAll) {
			expandAll.addEventListener('click', () => {
				this.expandAllNodes();
			});
		}

		if (collapseAll) {
			collapseAll.addEventListener('click', () => {
				this.collapseAllNodes();
			});
		}

		// Toggle buttons
		document.addEventListener('click', (e) => {
			if (e.target.closest('.toggle-btn')) {
				const button = e.target.closest('.toggle-btn');
				const targetId = button.dataset.target;
				this.toggleNode(targetId);
			}
		});
	}

	initializeTree() {
		const toggleButtons = document.querySelectorAll('.toggle-btn');
		toggleButtons.forEach(button => {
			const targetId = button.dataset.target;
			const childrenContainer = document.getElementById(`children-${targetId}`);

			if (childrenContainer) {
				const isExpanded = !childrenContainer.previousElementSibling.classList.contains('collapsed');
				this.updateToggleButton(button, isExpanded);
			}
		});
	}

	toggleNode(nodeId) {
		const childrenContainer = document.getElementById(`children-${nodeId}`);
		const parentNode = childrenContainer?.closest('.tree-node');
		const toggleButton = document.querySelector(`[data-target="${nodeId}"]`);

		if (!childrenContainer || !parentNode || !toggleButton) return;

		const isCollapsed = parentNode.classList.contains('collapsed');

		if (isCollapsed) {
			parentNode.classList.remove('collapsed');
			this.updateToggleButton(toggleButton, true);
		} else {
			parentNode.classList.add('collapsed');
			this.updateToggleButton(toggleButton, false);
		}

		this.updateTreeStats();
	}

	updateToggleButton(button, isExpanded) {
		const icon = button.querySelector('i');
		if (icon) {
			icon.className = isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right';
		}
		button.classList.toggle('expanded', isExpanded);
	}

	expandAllNodes() {
		const collapsedNodes = document.querySelectorAll('.tree-node.collapsed');
		const toggleButtons = document.querySelectorAll('.toggle-btn');

		collapsedNodes.forEach(node => {
			node.classList.remove('collapsed');
		});

		toggleButtons.forEach(button => {
			this.updateToggleButton(button, true);
		});

		this.updateTreeStats();
	}

	collapseAllNodes() {
		const expandedNodes = document.querySelectorAll('.tree-node:not(.collapsed)');
		const toggleButtons = document.querySelectorAll('.toggle-btn');

		expandedNodes.forEach(node => {
			if (node.querySelector('.children-container')) {
				node.classList.add('collapsed');
			}
		});

		toggleButtons.forEach(button => {
			this.updateToggleButton(button, false);
		});

		this.updateTreeStats();
	}

	filterTree() {
		const nodes = document.querySelectorAll('.tree-node');

		nodes.forEach(node => {
			const level = parseInt(node.dataset.level);
			const shouldShowByLevel = this.shouldShowByLevel(level);
			const shouldShowBySearch = this.shouldShowBySearch(node);

			if (shouldShowByLevel && shouldShowBySearch) {
				node.style.display = 'block';
				this.highlightSearchTerms(node);
			} else {
				node.style.display = 'none';
			}
		});

		this.updateTreeStats();
	}

	shouldShowByLevel(level) {
		if (this.currentLevelFilter === 'all') return true;
		return level <= parseInt(this.currentLevelFilter);
	}

	shouldShowBySearch(node) {
		if (!this.searchTerm) return true;
		const text = node.textContent.toLowerCase();
		return text.includes(this.searchTerm);
	}

	highlightSearchTerms(node) {
		if (!this.searchTerm) {
			this.removeHighlights(node);
			return;
		}

		const walker = document.createTreeWalker(
			node,
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
	}

	removeHighlights(node) {
		const highlights = node.querySelectorAll('.highlight');
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
		const nodes = document.querySelectorAll('.tree-node');
		let totalReferrals = 0;
		let maxLevel = 0;
		let activeLevels = new Set();
		let todayReferrals = 0;

		const today = new Date().toDateString();

		nodes.forEach(node => {
			const level = parseInt(node.dataset.level);
			maxLevel = Math.max(maxLevel, level);
			activeLevels.add(level);

			if (level > 1) {
				totalReferrals++;
			}

			const dateText = node.querySelector('.meta-item')?.textContent;
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

	updateTreeStats() {
		const visibleNodes = document.querySelectorAll('.tree-node[style*="block"], .tree-node:not([style])');
		const totalNodes = document.querySelectorAll('.tree-node').length;
		const visibleCount = visibleNodes.length;

		const statsElement = document.getElementById('treeStats');
		if (statsElement) {
			statsElement.textContent = `Показано ${visibleCount} из ${totalNodes} рефералов`;
		}
	}
}

// Utility functions
function copyReferralLink() {
	const linkInput = document.getElementById('referralLink');
	if (linkInput) {
		navigator.clipboard.writeText(linkInput.value).then(() => {
			showNotification('Ссылка скопирована в буфер обмена!', 'success');
		}).catch(() => {
			showNotification('Ошибка при копировании ссылки', 'error');
		});
	}
}

function copyToClipboard(text) {
	navigator.clipboard.writeText(text).then(() => {
		showNotification('Ссылка скопирована!', 'success');
	}).catch(() => {
		showNotification('Ошибка при копировании', 'error');
	});
}

function viewDetails(referralId) {
	showNotification(`Просмотр деталей для ${referralId}`, 'info');
}

function exportData() {
	showNotification('Функция экспорта в разработке', 'info');
}

function showNotification(message, type = 'info') {
	const notification = document.createElement('div');
	notification.className = `notification notification-${type}`;
	notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;

	notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${getNotificationColor(type)};
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

function getNotificationIcon(type) {
	const icons = {
		success: 'check-circle',
		error: 'exclamation-circle',
		warning: 'exclamation-triangle',
		info: 'info-circle'
	};
	return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
	const colors = {
		success: '#10b981',
		error: '#ef4444',
		warning: '#f59e0b',
		info: '#6366f1'
	};
	return colors[type] || '#6366f1';
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

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	new ReferralDashboard();
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
