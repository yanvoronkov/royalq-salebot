#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки отображения статистики в блоке stats-bar
 * Проверяет API endpoints и логику расчета статистики
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_READONLY_KEY = process.env.API_READONLY_KEY || 'ZDd1/oQLS2BxsFhfA7f012ArXCr0fByy6jlH1JXH7bs=';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

console.log('🧪 Тестирование отображения статистики...\n');

/**
 * Тестирует API endpoint для получения дерева рефералов
 */
async function testReferralsTreeAPI() {
	console.log('📊 Тестирование API /api/readonly/referrals/tree...');

	try {
		const response = await fetch(`${BASE_URL}/api/readonly/referrals/tree`, {
			headers: {
				'x-api-key': API_READONLY_KEY,
				'Content-Type': 'application/json'
			}
		});

		console.log(`   Статус ответа: ${response.status} ${response.statusText}`);

		if (!response.ok) {
			console.log(`   ❌ Ошибка API: ${response.status}`);
			return null;
		}

		const data = await response.json();
		console.log(`   ✅ API работает, получено ${data.data ? data.data.length : 0} корневых рефералов`);

		return data;
	} catch (error) {
		console.log(`   ❌ Ошибка запроса: ${error.message}`);
		return null;
	}
}

/**
 * Тестирует API endpoint для получения статистики активности
 */
async function testActivityStatsAPI() {
	console.log('📈 Тестирование API /api/readonly/referrals/activity-stats...');

	try {
		const response = await fetch(`${BASE_URL}/api/readonly/referrals/activity-stats`, {
			headers: {
				'x-api-key': API_READONLY_KEY,
				'Content-Type': 'application/json'
			}
		});

		console.log(`   Статус ответа: ${response.status} ${response.statusText}`);

		if (!response.ok) {
			console.log(`   ❌ Ошибка API: ${response.status}`);
			return null;
		}

		const data = await response.json();
		console.log(`   ✅ API работает, статистика:`, data.data);

		return data;
	} catch (error) {
		console.log(`   ❌ Ошибка запроса: ${error.message}`);
		return null;
	}
}

/**
 * Симулирует логику расчета статистики по таблице (как в JavaScript)
 */
function simulateTableStatsCalculation(referralData) {
	console.log('🧮 Симуляция расчета статистики по таблице...');

	if (!referralData || referralData.length === 0) {
		console.log('   📭 Нет данных для расчета');
		return { total: 0, active: 0, inactive: 0, levels: 0 };
	}

	// Преобразуем дерево в плоский список (упрощенная версия)
	const flattenTree = (tree, level = 0) => {
		const result = [];
		tree.forEach(item => {
			result.push({ ...item, level });
			if (item.children && item.children.length > 0) {
				result.push(...flattenTree(item.children, level + 1));
			}
		});
		return result;
	};

	const flatData = flattenTree(referralData);
	const totalReferrals = flatData.length;
	const maxLevels = flatData.length > 0 ? Math.max(...flatData.map(item => item.level)) + 1 : 0;

	// Расчет активности (улучшенная версия, как в JavaScript)
	let activeCount = 0;
	let inactiveCount = 0;

	flatData.forEach(item => {
		const hasNickname = item.referal_nickname && item.referal_nickname.trim() !== '';
		const hasChannelActivity = item.channel_activity &&
			item.channel_activity !== 'Неактивен' &&
			item.channel_activity !== '—' &&
			item.channel_activity.trim() !== '';
		const hasChildren = item.totalReferals && item.totalReferals > 0;

		// Считаем активным, если:
		// - Есть никнейм И активность в канале (полная активность)
		// - ИЛИ есть потомки (активность в реферальной программе)
		if ((hasNickname && hasChannelActivity) || hasChildren) {
			activeCount++;
		} else {
			inactiveCount++;
		}
	});

	const stats = {
		total: totalReferrals,
		active: activeCount,
		inactive: inactiveCount,
		levels: maxLevels
	};

	console.log('   📊 Рассчитанная статистика:', stats);
	return stats;
}

/**
 * Тестирует веб-интерфейс
 */
async function testWebInterface() {
	console.log('🌐 Тестирование веб-интерфейса...');

	try {
		const response = await fetch(`${BASE_URL}/network`);
		console.log(`   Статус ответа: ${response.status} ${response.statusText}`);

		if (response.ok) {
			const html = await response.text();
			const hasStatsBar = html.includes('id="statsBar"');
			const hasApiKey = html.includes('api-readonly-key');

			console.log(`   ✅ Веб-интерфейс доступен`);
			console.log(`   📊 Блок stats-bar: ${hasStatsBar ? 'найден' : 'не найден'}`);
			console.log(`   🔑 API ключ в HTML: ${hasApiKey ? 'найден' : 'не найден'}`);
		} else {
			console.log(`   ❌ Ошибка веб-интерфейса: ${response.status}`);
		}
	} catch (error) {
		console.log(`   ❌ Ошибка запроса: ${error.message}`);
	}
}

/**
 * Основная функция тестирования
 */
async function runTests() {
	console.log(`🔧 Конфигурация:`);
	console.log(`   Base URL: ${BASE_URL}`);
	console.log(`   API Key: ${API_READONLY_KEY.substring(0, 10)}...`);
	console.log('');

	// Тест 1: API дерева рефералов
	const treeData = await testReferralsTreeAPI();
	console.log('');

	// Тест 2: API статистики активности
	const activityData = await testActivityStatsAPI();
	console.log('');

	// Тест 3: Симуляция расчета по таблице
	if (treeData && treeData.data) {
		const calculatedStats = simulateTableStatsCalculation(treeData.data);
		console.log('');

		// Сравнение с API статистикой
		if (activityData && activityData.data) {
			console.log('🔄 Сравнение статистики:');
			console.log(`   API активные: ${activityData.data.active}, рассчитанные: ${calculatedStats.active}`);
			console.log(`   API неактивные: ${activityData.data.inactive}, рассчитанные: ${calculatedStats.inactive}`);
		}
	}
	console.log('');

	// Тест 4: Веб-интерфейс
	await testWebInterface();
	console.log('');

	console.log('✅ Тестирование завершено');
}

// Запуск тестов
runTests().catch(error => {
	console.error('❌ Критическая ошибка:', error);
	process.exit(1);
});
