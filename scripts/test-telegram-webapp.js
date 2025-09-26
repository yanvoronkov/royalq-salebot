#!/usr/bin/env node

/**
 * Скрипт для тестирования Telegram WebApp
 * Проверяет, что API ключ правильно передается и работает
 */

import https from 'https';
import http from 'http';

const BASE_URL = 'https://projects.inetskills.ru';
const API_READONLY_KEY = 'YdbX9WekeVLzRDbwrgeR+90W2rFE0Q60KzBwg7aP/P0=';

// Функция для выполнения HTTP запросов
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https://');
        const client = isHttps ? https : http;
        
        const requestOptions = {
            method: options.method || 'GET',
            headers: {
                'User-Agent': 'TelegramWebAppTest/1.0',
                ...options.headers
            },
            timeout: 10000
        };

        const req = client.request(url, requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

// Функция для извлечения API ключа из HTML
async function getApiKeyFromHtml() {
    try {
        const response = await makeRequest(`${BASE_URL}/network`);
        
        if (response.statusCode === 200) {
            const html = response.data;
            const match = html.match(/<meta name="api-readonly-key" content="([^"]+)">/);
            
            if (match) {
                return match[1];
            } else {
                throw new Error('API ключ не найден в HTML');
            }
        } else {
            throw new Error(`HTTP ${response.statusCode}`);
        }
    } catch (error) {
        console.error('❌ Ошибка получения HTML:', error.message);
        return null;
    }
}

// Функция для тестирования API endpoints
async function testApiEndpoints(apiKey) {
    console.log('🧪 Тестирование API endpoints...');
    
    const endpoints = [
        { path: '/api/readonly/referrals/tree', name: 'Дерево рефералов' },
        { path: '/api/readonly/referrals/activity-stats', name: 'Статистика активности' }
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
        const startTime = Date.now();
        try {
            const response = await makeRequest(`${BASE_URL}${endpoint.path}`, {
                headers: { 'x-api-key': apiKey }
            });
            const responseTime = Date.now() - startTime;
            
            const success = response.statusCode === 200;
            results.push({
                endpoint: endpoint.name,
                status: response.statusCode,
                responseTime,
                success
            });
            
            const status = success ? '✅' : '❌';
            console.log(`${status} ${endpoint.name}: ${response.statusCode} (${responseTime}ms)`);
            
            if (!success) {
                console.log(`   Ошибка: ${response.data}`);
            }
        } catch (error) {
            const responseTime = Date.now() - startTime;
            results.push({
                endpoint: endpoint.name,
                status: 'ERROR',
                responseTime,
                success: false,
                error: error.message
            });
            
            console.log(`❌ ${endpoint.name}: ERROR (${responseTime}ms) - ${error.message}`);
        }
    }
    
    return results;
}

// Функция для тестирования без API ключа
async function testWithoutApiKey() {
    console.log('\n🔒 Тестирование без API ключа (должно вернуть 401)...');
    
    try {
        const response = await makeRequest(`${BASE_URL}/api/readonly/referrals/tree`);
        
        if (response.statusCode === 401) {
            console.log('✅ Защита работает: 401 Unauthorized');
            return true;
        } else {
            console.log(`❌ Защита не работает: ${response.statusCode}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Ошибка тестирования защиты: ${error.message}`);
        return false;
    }
}

// Основная функция
async function main() {
    console.log('🔍 ТЕСТИРОВАНИЕ TELEGRAM WEBAPP');
    console.log('===============================');
    console.log(`🌐 Сервер: ${BASE_URL}`);
    console.log(`⏰ Время: ${new Date().toLocaleString('ru-RU')}`);
    console.log('');
    
    // 1. Получаем API ключ из HTML
    console.log('📄 Получение API ключа из HTML...');
    const apiKeyFromHtml = await getApiKeyFromHtml();
    
    if (!apiKeyFromHtml) {
        console.log('❌ Не удалось получить API ключ из HTML');
        process.exit(1);
    }
    
    console.log(`✅ API ключ получен: ${apiKeyFromHtml.substring(0, 10)}...`);
    
    // 2. Проверяем, совпадает ли ключ
    if (apiKeyFromHtml === API_READONLY_KEY) {
        console.log('✅ API ключ совпадает с ожидаемым');
    } else {
        console.log('⚠️ API ключ не совпадает с ожидаемым');
        console.log(`   Ожидаемый: ${API_READONLY_KEY.substring(0, 10)}...`);
        console.log(`   Полученный: ${apiKeyFromHtml.substring(0, 10)}...`);
    }
    
    // 3. Тестируем API endpoints
    const results = await testApiEndpoints(apiKeyFromHtml);
    
    // 4. Тестируем защиту
    const protectionWorks = await testWithoutApiKey();
    
    // 5. Анализируем результаты
    console.log('\n📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ');
    console.log('==========================');
    
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    console.log(`✅ Успешных тестов: ${successCount}/${totalCount}`);
    console.log(`🔒 Защита работает: ${protectionWorks ? 'Да' : 'Нет'}`);
    
    if (successCount === totalCount && protectionWorks) {
        console.log('\n🎉 Все тесты пройдены! Telegram WebApp должен работать корректно.');
        console.log('\n💡 Если в браузере все еще 401 ошибки:');
        console.log('   1. Очистите кэш браузера (Ctrl+Shift+R)');
        console.log('   2. Откройте в режиме инкогнито');
        console.log('   3. Проверьте консоль браузера на ошибки JavaScript');
    } else {
        console.log('\n⚠️ Обнаружены проблемы:');
        results.forEach(result => {
            if (!result.success) {
                console.log(`   - ${result.endpoint}: ${result.error || result.status}`);
            }
        });
        if (!protectionWorks) {
            console.log('   - Защита API не работает');
        }
    }
}

// Запуск
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('❌ Критическая ошибка:', error);
        process.exit(1);
    });
}

export { main as testTelegramWebApp };
