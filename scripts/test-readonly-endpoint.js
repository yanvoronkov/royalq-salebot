#!/usr/bin/env node

/**
 * Тест endpoint только для чтения
 * Проверяет работу защищенного веб-интерфейса
 */

import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const SERVER_URL = 'http://localhost:3000';
const API_READONLY_KEY = process.env.API_READONLY_KEY || 'ZDd1/oQLS2BxsFhfA7f012ArXCr0fByy6jlH1JXH7bs=';

class ReadonlyEndpointTester {
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
			const requestOptions = {
				hostname: 'localhost',
				port: 3000,
				path: path,
				method: options.method || 'GET',
				headers: {
					'User-Agent': 'Readonly-Tester/1.0',
					...options.headers
				},
				timeout: 5000
			};

			const req = http.request(requestOptions, (res) => {
				let data = '';

				res.on('data', (chunk) => {
					data += chunk;
				});

				res.on('end', () => {
					resolve({
						status: res.statusCode,
						headers: res.headers,
						data: data
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

	async testReadonlyWebInterface() {
		console.log('\n🌐 Тестирование веб-интерфейса только для чтения...');

		// Тест 1: Без ключа (должен быть заблокирован)
		const response1 = await this.makeRequest('/readonly');
		if (response1.status === 401) {
			this.logTest('Веб-интерфейс без ключа заблокирован', 'PASS', `Статус: ${response1.status}`);
		} else {
			this.logTest('Веб-интерфейс без ключа заблокирован', 'FAIL', `Ожидался статус 401, получен: ${response1.status}`);
		}

		// Тест 2: С ключом (должен работать)
		const response2 = await this.makeRequest('/readonly', {
			headers: { 'x-api-key': API_READONLY_KEY }
		});
		if (response2.status === 200) {
			this.logTest('Веб-интерфейс с ключом работает', 'PASS', `Статус: ${response2.status}`);
		} else {
			this.logTest('Веб-интерфейс с ключом работает', 'FAIL', `Статус: ${response2.status}`);
		}
	}

	async testReadonlyAPI() {
		console.log('\n🔍 Тестирование API только для чтения...');

		const endpoints = [
			'/api/readonly/referrals/tree',
			'/api/readonly/referrals/activity-stats'
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
				headers: { 'x-api-key': API_READONLY_KEY }
			});
			if (response2.status === 200) {
				this.logTest(`${endpoint} с ключом`, 'PASS', `Статус: ${response2.status}`);
			} else {
				this.logTest(`${endpoint} с ключом`, 'FAIL', `Статус: ${response2.status}`);
			}
		}
	}

	async testMainAPIStillProtected() {
		console.log('\n🔒 Тестирование основного API (должен остаться защищенным)...');

		// Тест: Основной API должен требовать основной ключ
		const response = await this.makeRequest('/api/referrals/tree', {
			headers: { 'x-api-key': API_READONLY_KEY }
		});
		if (response.status === 401) {
			this.logTest('Основной API с readonly ключом заблокирован', 'PASS', `Статус: ${response.status}`);
		} else {
			this.logTest('Основной API с readonly ключом заблокирован', 'FAIL', `Ожидался статус 401, получен: ${response.status}`);
		}
	}

	async runAllTests() {
		console.log('🛡️ Запуск тестов endpoint только для чтения...');
		console.log(`Server URL: ${SERVER_URL}`);
		console.log(`Readonly API Key: ${API_READONLY_KEY.substring(0, 8)}...`);

		try {
			await this.testReadonlyWebInterface();
			await this.testReadonlyAPI();
			await this.testMainAPIStillProtected();

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
			console.log('\n🎉 Все тесты endpoint только для чтения пройдены успешно!');
			console.log('🛡️ Веб-интерфейс защищен и доступен только с API ключом!');
		} else {
			console.log('\n⚠️ Обнаружены проблемы с endpoint только для чтения!');
		}
	}
}

// Запуск тестов
const tester = new ReadonlyEndpointTester();
tester.runAllTests();
