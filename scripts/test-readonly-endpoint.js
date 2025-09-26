#!/usr/bin/env node

/**
 * Тест readonly endpoint для веб-интерфейса
 * Проверяет работу обновленного JavaScript с readonly API
 */

import https from 'https';
import http from 'http';

const API_READONLY_KEY = 'ZDd1/oQLS2BxsFhfA7f012ArXCr0fByy6jlH1JXH7bs=';
const BASE_URL = 'https://projects.inetskills.ru';

// Функция для выполнения HTTP запросов
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https://');
        const client = isHttps ? https : http;
        
        const requestOptions = {
            method: options.method || 'GET',
            headers: {
                'User-Agent': 'ReadonlyEndpointTest/1.0',
                ...options.headers
            },
            timeout: 10000
        };

        const req = client.request(url, requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data
                });
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

// Тест 1: Веб-интерфейс /network
async function testWebInterface() {
    console.log('🌐 Тестирование веб-интерфейса /network...');
    
    try {
        const response = await makeRequest(`${BASE_URL}/network`);
        
        if (response.statusCode === 200) {
            // Проверяем, что HTML содержит обновленный JavaScript
            if (response.data.includes('/api/readonly/referrals/tree')) {
                console.log('✅ Веб-интерфейс работает и использует readonly API');
                return true;
            } else {
                console.log('⚠️ Веб-интерфейс работает, но JavaScript не обновлен');
                return false;
            }
        } else {
            console.log(`❌ Веб-интерфейс недоступен: ${response.statusCode}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Ошибка веб-интерфейса: ${error.message}`);
        return false;
    }
}

// Тест 2: Readonly API для дерева рефералов
async function testReadonlyTreeAPI() {
    console.log('🌳 Тестирование readonly API для дерева рефералов...');
    
    try {
        const response = await makeRequest(`${BASE_URL}/api/readonly/referrals/tree`, {
            headers: {
                'x-api-key': API_READONLY_KEY
            }
        });
        
        if (response.statusCode === 200) {
            const data = JSON.parse(response.data);
            if (data.status && data.data) {
                console.log('✅ Readonly API для дерева работает');
                console.log(`   📊 Найдено корневых рефералов: ${data.data.length}`);
                return true;
            } else {
                console.log('⚠️ API отвечает, но данные некорректны');
                return false;
            }
        } else {
            console.log(`❌ Readonly API недоступен: ${response.statusCode}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Ошибка readonly API: ${error.message}`);
        return false;
    }
}

// Тест 3: Readonly API для статистики активности
async function testReadonlyStatsAPI() {
    console.log('📊 Тестирование readonly API для статистики...');
    
    try {
        const response = await makeRequest(`${BASE_URL}/api/readonly/referrals/activity-stats`, {
            headers: {
                'x-api-key': API_READONLY_KEY
            }
        });
        
        if (response.statusCode === 200) {
            const data = JSON.parse(response.data);
            if (data.status && data.data) {
                console.log('✅ Readonly API для статистики работает');
                console.log(`   📈 Активных: ${data.data.active}, Неактивных: ${data.data.inactive}`);
                return true;
            } else {
                console.log('⚠️ API отвечает, но данные некорректны');
                return false;
            }
        } else {
            console.log(`❌ Readonly API недоступен: ${response.statusCode}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Ошибка readonly API: ${error.message}`);
        return false;
    }
}

// Тест 4: Проверка защиты readonly API
async function testReadonlyAPISecurity() {
    console.log('🔒 Тестирование защиты readonly API...');
    
    try {
        // Тест без API ключа
        const responseNoKey = await makeRequest(`${BASE_URL}/api/readonly/referrals/tree`);
        
        if (responseNoKey.statusCode === 401) {
            console.log('✅ Readonly API защищен (без ключа)');
        } else {
            console.log(`❌ Readonly API не защищен: ${responseNoKey.statusCode}`);
            return false;
        }
        
        // Тест с неверным API ключом
        const responseWrongKey = await makeRequest(`${BASE_URL}/api/readonly/referrals/tree`, {
            headers: {
                'x-api-key': 'wrong-key'
            }
        });
        
        if (responseWrongKey.statusCode === 401) {
            console.log('✅ Readonly API защищен (неверный ключ)');
            return true;
        } else {
            console.log(`❌ Readonly API не защищен от неверного ключа: ${responseWrongKey.statusCode}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Ошибка тестирования защиты: ${error.message}`);
        return false;
    }
}

// Тест 5: Проверка endpoint для отдельного пользователя
async function testUserSpecificEndpoint() {
    console.log('👤 Тестирование endpoint для отдельного пользователя...');
    
    try {
        // Сначала получаем список всех рефералов
        const treeResponse = await makeRequest(`${BASE_URL}/api/readonly/referrals/tree`, {
            headers: {
                'x-api-key': API_READONLY_KEY
            }
        });
        
        if (treeResponse.statusCode === 200) {
            const treeData = JSON.parse(treeResponse.data);
            if (treeData.status && treeData.data && treeData.data.length > 0) {
                // Берем первого реферала для теста
                const firstReferral = treeData.data[0];
                const userId = firstReferral.referal_id;
                
                console.log(`   🧪 Тестируем с пользователем: ${userId}`);
                
                // Тестируем endpoint для конкретного пользователя
                const userResponse = await makeRequest(`${BASE_URL}/api/readonly/referrals/${userId}/tree`, {
                    headers: {
                        'x-api-key': API_READONLY_KEY
                    }
                });
                
                if (userResponse.statusCode === 200) {
                    const userData = JSON.parse(userResponse.data);
                    if (userData.status && userData.data) {
                        console.log('✅ Endpoint для отдельного пользователя работает');
                        console.log(`   📊 Найдено рефералов у пользователя: ${userData.data.length}`);
                        return true;
                    } else {
                        console.log('⚠️ Endpoint отвечает, но данные некорректны');
                        return false;
                    }
                } else {
                    console.log(`❌ Endpoint для пользователя недоступен: ${userResponse.statusCode}`);
                    return false;
                }
            } else {
                console.log('⚠️ Нет данных для тестирования endpoint пользователя');
                return false;
            }
        } else {
            console.log('❌ Не удалось получить данные для тестирования');
            return false;
        }
    } catch (error) {
        console.log(`❌ Ошибка тестирования endpoint пользователя: ${error.message}`);
        return false;
    }
}

// Основная функция тестирования
async function runTests() {
    console.log('🧪 ТЕСТИРОВАНИЕ READONLY ENDPOINT');
    console.log('=====================================');
    console.log(`🔑 API Readonly Key: ${API_READONLY_KEY.substring(0, 20)}...`);
    console.log(`🌐 Base URL: ${BASE_URL}`);
    console.log('');

    const tests = [
        { name: 'Веб-интерфейс /network', fn: testWebInterface },
        { name: 'Readonly API для дерева', fn: testReadonlyTreeAPI },
        { name: 'Readonly API для статистики', fn: testReadonlyStatsAPI },
        { name: 'Защита readonly API', fn: testReadonlyAPISecurity },
        { name: 'Endpoint для отдельного пользователя', fn: testUserSpecificEndpoint }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.log(`❌ Ошибка в тесте "${test.name}": ${error.message}`);
            failed++;
        }
        console.log('');
    }

    console.log('📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ');
    console.log('==========================');
    console.log(`✅ Пройдено: ${passed}`);
    console.log(`❌ Провалено: ${failed}`);
    console.log(`📈 Всего тестов: ${tests.length}`);
    console.log(`🎯 Успешность: ${Math.round((passed / tests.length) * 100)}%`);

    if (failed === 0) {
        console.log('');
        console.log('🎉 Все тесты пройдены успешно!');
        console.log('✅ Readonly endpoint полностью функционален');
    } else {
        console.log('');
        console.log('⚠️ Обнаружены проблемы с readonly endpoint');
        console.log('🔧 Проверьте настройки на сервере');
    }

    return failed === 0;
}

// Запуск тестов
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Критическая ошибка:', error);
        process.exit(1);
    });
}

export { runTests };