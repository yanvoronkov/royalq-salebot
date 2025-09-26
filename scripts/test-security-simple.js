#!/usr/bin/env node

/**
 * Простой тест безопасности API
 * Проверяет основные функции защиты без внешних зависимостей
 */

import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'http://localhost:3000';
const API_SECRET_KEY = process.env.API_SECRET_KEY || '06ediHycd1Vi1MY4l/DuV5FKrY5ocu8l0ru3Q1zXq5E=';

class SimpleSecurityTester {
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
                    'User-Agent': 'Security-Tester/1.0',
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

    async runAllTests() {
        console.log('🛡️ Запуск простых тестов безопасности...');
        console.log(`API Base URL: ${API_BASE_URL}`);
        console.log(`API Secret Key: ${API_SECRET_KEY.substring(0, 8)}...`);
        
        try {
            await this.testHealthCheck();
            await this.testWebInterface();
            await this.testUnauthorizedAPI();
            await this.testAuthorizedAPI();
            await this.testWrongAPIKey();
            
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
        } else {
            console.log('\n⚠️ Обнаружены проблемы с безопасностью API!');
        }
    }
}

// Запуск тестов
const tester = new SimpleSecurityTester();
tester.runAllTests();
