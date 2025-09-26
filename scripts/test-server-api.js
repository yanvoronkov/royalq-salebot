#!/usr/bin/env node

/**
 * Тест безопасности API на сервере
 * Проверяет работу защиты на production сервере
 */

import https from 'https';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const SERVER_URL = process.env.SERVER_URL || 'https://projects.inetskills.ru';
const API_SECRET_KEY = process.env.API_SECRET_KEY || '06ediHycd1Vi1MY4l/DuV5FKrY5ocu8l0ru3Q1zXq5E=';

class ServerSecurityTester {
	constructor() {
		this.testResults = {
			passed: 0,
			failed: 0,
			total: 0
		};
	}

	logTest(testName, status, message = '') {
		const statusIcon = status === 'PASS' ? '✅' : '❌';
		console.log(`${statusIcon} ${testName}: ${status} ${message}`);

		this.testResults.total++;
		if (status === 'PASS') {
			this.testResults.passed++;
		} else {
			this.testResults.failed++;
		}
	}

	async makeRequest(path, options = {}) {
		return new Promise((resolve) => {
			const url = new URL(path, SERVER_URL);
			const isHttps = url.protocol === 'https:';
			const client = isHttps ? https : http;

			const requestOptions = {
				hostname: url.hostname,
				port: url.port || (isHttps ? 443 : 80),
				path: url.pathname + url.search,
				method: options.method || 'GET',
				headers: {
					'User-Agent': 'Server-Security-Tester/1.0',
					...options.headers
				},
				timeout: 10000
			};

			const req = client.request(requestOptions, (res) => {
				let data = '';

				res.on('data', (chunk) => {
					data += chunk;
				});

				res.on('end', () => {
					let jsonData;
					try {
						jsonData = JSON.parse(data);
					} catch (e) {
						jsonData = { raw: data };
					}

					resolve({
						status: res.statusCode,
						headers: res.headers,
						data: jsonData
					});
				});
			});

			req.on('error', (error) => {
				resolve({
					status: 0,
					error: error.message,
					data: null
				});
			});

			req.on('timeout', () => {
				req.destroy();
				resolve({
					status: 0,
					error: 'Request timeout',
					data: null
				});
			});

			if (options.body) {
				req.write(options.body);
			}

			req.end();
		});
	}

	async testHealthCheck() {
		console.log('\n🏥 Тестирование health check...');

		const response = await this.makeRequest('/health');
		if (response.status === 200) {
			this.logTest('Health check', 'PASS', `Статус: ${response.status}`);
		} else {
			this.logTest('Health check', 'FAIL', `Статус: ${response.status}`);
		}
	}

	async testWebInterface() {
		console.log('\n🌐 Тестирование веб-интерфейса...');

		const response = await this.makeRequest('/network');
		if (response.status === 200) {
			this.logTest('Веб-интерфейс доступен', 'PASS', `Статус: ${response.status}`);
		} else {
			this.logTest('Веб-интерфейс доступен', 'FAIL', `Статус: ${response.status}`);
		}
	}

	async testUnauthorizedAPI() {
		console.log('\n🔒 Тестирование неавторизованного доступа к API...');

		const response = await this.makeRequest('/api/referrals/tree');
		if (response.status === 401) {
			this.logTest('API без ключа заблокирован', 'PASS', `Статус: ${response.status}`);
		} else {
			this.logTest('API без ключа заблокирован', 'FAIL', `Ожидался статус 401, получен: ${response.status}`);
		}
	}

	async testAuthorizedAPI() {
		console.log('\n🔑 Тестирование авторизованного доступа к API...');

		const response = await this.makeRequest('/api/referrals/tree', {
			headers: { 'x-api-key': API_SECRET_KEY }
		});
		if (response.status === 200) {
			this.logTest('API с ключом работает', 'PASS', `Статус: ${response.status}`);
		} else {
			this.logTest('API с ключом работает', 'FAIL', `Статус: ${response.status}`);
		}
	}

	async testWrongAPIKey() {
		console.log('\n❌ Тестирование неверного API ключа...');

		const response = await this.makeRequest('/api/referrals/tree', {
			headers: { 'x-api-key': 'wrong-key' }
		});
		if (response.status === 401) {
			this.logTest('Неверный API ключ заблокирован', 'PASS', `Статус: ${response.status}`);
		} else {
			this.logTest('Неверный API ключ заблокирован', 'FAIL', `Ожидался статус 401, получен: ${response.status}`);
		}
	}

	async testWriteOperations() {
		console.log('\n✏️ Тестирование операций записи...');

		// POST без ключа
		const response1 = await this.makeRequest('/api/referals', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				referalId: 'test-user-123',
				referalName: 'Test User',
				referalPhone: '+1234567890'
			})
		});
		if (response1.status === 401) {
			this.logTest('POST без ключа заблокирован', 'PASS', `Статус: ${response1.status}`);
		} else {
			this.logTest('POST без ключа заблокирован', 'FAIL', `Ожидался статус 401, получен: ${response1.status}`);
		}

		// POST с ключом
		const response2 = await this.makeRequest('/api/referals', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': API_SECRET_KEY
			},
			body: JSON.stringify({
				referalId: 'test-user-456',
				referalName: 'Test User 2',
				referalPhone: '+1234567891'
			})
		});
		if (response2.status === 200 || response2.status === 201) {
			this.logTest('POST с ключом работает', 'PASS', `Статус: ${response2.status}`);
		} else {
			this.logTest('POST с ключом работает', 'FAIL', `Статус: ${response2.status}`);
		}
	}

	async testRateLimiting() {
		console.log('\n⏱️ Тестирование rate limiting...');

		const requests = [];
		const maxRequests = 10;

		// Отправляем несколько запросов подряд
		for (let i = 0; i < maxRequests; i++) {
			requests.push(
				this.makeRequest('/api/referrals/tree', {
					headers: { 'x-api-key': API_SECRET_KEY }
				})
			);
		}

		const responses = await Promise.all(requests);
		const successCount = responses.filter(r => r.status === 200).length;
		const rateLimitedCount = responses.filter(r => r.status === 429).length;

		if (successCount > 0) {
			this.logTest('Rate limiting - успешные запросы', 'PASS', `Успешно: ${successCount}/${maxRequests}`);
		} else {
			this.logTest('Rate limiting - успешные запросы', 'FAIL', 'Нет успешных запросов');
		}

		if (rateLimitedCount > 0) {
			this.logTest('Rate limiting - ограничение сработало', 'PASS', `Ограничено: ${rateLimitedCount}/${maxRequests}`);
		} else {
			this.logTest('Rate limiting - ограничение сработало', 'INFO', 'Ограничение не сработало (возможно, лимит не достигнут)');
		}
	}

	async testSpecificEndpoints() {
		console.log('\n🎯 Тестирование конкретных endpoints...');

		const endpoints = [
			'/api/referrals/activity-stats',
			'/api/referrals/search',
			'/api/referrals/filter',
			'/api/payments/user/test123'
		];

		for (const endpoint of endpoints) {
			// Без ключа
			const response1 = await this.makeRequest(endpoint);
			if (response1.status === 401) {
				this.logTest(`${endpoint} без ключа`, 'PASS', `Статус: ${response1.status}`);
			} else {
				this.logTest(`${endpoint} без ключа`, 'FAIL', `Ожидался статус 401, получен: ${response1.status}`);
			}

			// С ключом
			const response2 = await this.makeRequest(endpoint, {
				headers: { 'x-api-key': API_SECRET_KEY }
			});
			if (response2.status === 200 || response2.status === 404) { // 404 нормально для несуществующих данных
				this.logTest(`${endpoint} с ключом`, 'PASS', `Статус: ${response2.status}`);
			} else {
				this.logTest(`${endpoint} с ключом`, 'FAIL', `Статус: ${response2.status}`);
			}
		}
	}

	async runAllTests() {
		console.log('🛡️ Запуск тестов безопасности на сервере...');
		console.log(`Server URL: ${SERVER_URL}`);
		console.log(`API Secret Key: ${API_SECRET_KEY.substring(0, 8)}...`);

		try {
			await this.testHealthCheck();
			await this.testWebInterface();
			await this.testUnauthorizedAPI();
			await this.testAuthorizedAPI();
			await this.testWrongAPIKey();
			await this.testWriteOperations();
			await this.testRateLimiting();
			await this.testSpecificEndpoints();

			this.printSummary();
		} catch (error) {
			console.error('❌ Ошибка при выполнении тестов:', error.message);
		}
	}

	printSummary() {
		console.log('\n📊 Результаты тестирования:');
		console.log(`✅ Пройдено: ${this.testResults.passed}`);
		console.log(`❌ Провалено: ${this.testResults.failed}`);
		console.log(`📈 Всего тестов: ${this.testResults.total}`);

		const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
		console.log(`🎯 Успешность: ${successRate}%`);

		if (this.testResults.failed === 0) {
			console.log('\n🎉 Все тесты безопасности пройдены успешно!');
			console.log('🛡️ API защищен от несанкционированного доступа!');
		} else {
			console.log('\n⚠️ Обнаружены проблемы с безопасностью API!');
			console.log('🔧 Проверьте настройки на сервере.');
		}

		console.log('\n📋 Рекомендации:');
		console.log('1. Проверьте логи сервера: docker-compose logs app');
		console.log('2. Проверьте переменные окружения: docker-compose exec app env | grep API');
		console.log('3. Проверьте статус контейнеров: docker-compose ps');
		console.log('4. Убедитесь, что .env файл содержит API_SECRET_KEY');
	}
}

// Запуск тестов
const tester = new ServerSecurityTester();
tester.runAllTests();
