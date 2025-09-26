#!/usr/bin/env node

/**
 * Скрипт для тестирования защищенного API
 * Проверяет работу аутентификации и rate limiting
 */

import https from 'https';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_SECRET_KEY = process.env.API_SECRET_KEY || '06ediHycd1Vi1MY4l/DuV5FKrY5ocu8l0ru3Q1zXq5E=';

class APISecurityTester {
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

    async makeRequest(url, options = {}) {
        return new Promise((resolve) => {
            const urlObj = new URL(url);
            const isHttps = urlObj.protocol === 'https:';
            const client = isHttps ? https : http;
            
            const requestOptions = {
                hostname: urlObj.hostname,
                port: urlObj.port || (isHttps ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: options.method || 'GET',
                headers: {
                    'User-Agent': 'API-Security-Tester/1.0',
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

    async testUnauthorizedAccess() {
        console.log('\n🔒 Тестирование неавторизованного доступа...');
        
        // Тест 1: Запрос без API ключа
        const response1 = await this.makeRequest(`${API_BASE_URL}/api/referrals/tree`);
        if (response1.status === 401) {
            this.logTest('Запрос без API ключа', 'PASS', `Статус: ${response1.status}`);
        } else {
            this.logTest('Запрос без API ключа', 'FAIL', `Ожидался статус 401, получен: ${response1.status}`);
        }

        // Тест 2: Запрос с неверным API ключом
        const response2 = await this.makeRequest(`${API_BASE_URL}/api/referrals/tree`, {
            headers: { 'x-api-key': 'wrong-key' }
        });
        if (response2.status === 401) {
            this.logTest('Запрос с неверным API ключом', 'PASS', `Статус: ${response2.status}`);
        } else {
            this.logTest('Запрос с неверным API ключом', 'FAIL', `Ожидался статус 401, получен: ${response2.status}`);
        }
    }

    async testAuthorizedAccess() {
        console.log('\n🔑 Тестирование авторизованного доступа...');
        
        // Тест 3: Запрос с правильным API ключом в заголовке
        const response1 = await this.makeRequest(`${API_BASE_URL}/api/referrals/tree`, {
            headers: { 'x-api-key': API_SECRET_KEY }
        });
        if (response1.status === 200) {
            this.logTest('Запрос с правильным API ключом (заголовок)', 'PASS', `Статус: ${response1.status}`);
        } else {
            this.logTest('Запрос с правильным API ключом (заголовок)', 'FAIL', `Статус: ${response1.status}`);
        }

        // Тест 4: Запрос с правильным API ключом в query параметре
        const response2 = await this.makeRequest(`${API_BASE_URL}/api/referrals/tree?api_key=${API_SECRET_KEY}`);
        if (response2.status === 200) {
            this.logTest('Запрос с правильным API ключом (query)', 'PASS', `Статус: ${response2.status}`);
        } else {
            this.logTest('Запрос с правильным API ключом (query)', 'FAIL', `Статус: ${response2.status}`);
        }
    }

    async testWriteOperations() {
        console.log('\n✏️ Тестирование операций записи...');
        
        // Тест 5: POST запрос без API ключа
        const response1 = await this.makeRequest(`${API_BASE_URL}/api/referals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                referalId: 'test-user-123',
                referalName: 'Test User',
                referalPhone: '+1234567890'
            })
        });
        if (response1.status === 401) {
            this.logTest('POST запрос без API ключа', 'PASS', `Статус: ${response1.status}`);
        } else {
            this.logTest('POST запрос без API ключа', 'FAIL', `Ожидался статус 401, получен: ${response1.status}`);
        }

        // Тест 6: POST запрос с правильным API ключом
        const response2 = await this.makeRequest(`${API_BASE_URL}/api/referals`, {
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
            this.logTest('POST запрос с правильным API ключом', 'PASS', `Статус: ${response2.status}`);
        } else {
            this.logTest('POST запрос с правильным API ключом', 'FAIL', `Статус: ${response2.status}`);
        }
    }

    async testRateLimiting() {
        console.log('\n⏱️ Тестирование rate limiting...');
        
        const requests = [];
        const maxRequests = 10;
        
        // Отправляем несколько запросов подряд
        for (let i = 0; i < maxRequests; i++) {
            requests.push(
                this.makeRequest(`${API_BASE_URL}/api/referrals/tree`, {
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

    async testWebInterfaceAccess() {
        console.log('\n🌐 Тестирование доступа к веб-интерфейсу...');
        
        // Тест 7: Доступ к веб-интерфейсу без API ключа (должен работать)
        const response1 = await this.makeRequest(`${API_BASE_URL}/network`);
        if (response1.status === 200) {
            this.logTest('Доступ к веб-интерфейсу', 'PASS', `Статус: ${response1.status}`);
        } else {
            this.logTest('Доступ к веб-интерфейсу', 'FAIL', `Статус: ${response1.status}`);
        }

        // Тест 8: Health check без API ключа (должен работать)
        const response2 = await this.makeRequest(`${API_BASE_URL}/health`);
        if (response2.status === 200) {
            this.logTest('Health check endpoint', 'PASS', `Статус: ${response2.status}`);
        } else {
            this.logTest('Health check endpoint', 'FAIL', `Статус: ${response2.status}`);
        }
    }

    async runAllTests() {
        console.log('🛡️ Запуск тестов безопасности API...');
        console.log(`API Base URL: ${API_BASE_URL}`);
        console.log(`API Secret Key: ${API_SECRET_KEY.substring(0, 8)}...`);
        
        try {
            await this.testUnauthorizedAccess();
            await this.testAuthorizedAccess();
            await this.testWriteOperations();
            await this.testRateLimiting();
            await this.testWebInterfaceAccess();
            
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
const tester = new APISecurityTester();
tester.runAllTests();
