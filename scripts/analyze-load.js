#!/usr/bin/env node

/**
 * Скрипт для анализа нагрузки на сервер
 * Показывает статистику запросов и предсказания нагрузки
 */

import https from 'https';
import http from 'http';

const BASE_URL = 'https://projects.inetskills.ru';
const API_READONLY_KEY = 'YdbX9WekeVLzRDbwrgeR+90W2rFE0Q60KzBwg7aP/P0='; // Readonly API ключ

// Функция для выполнения HTTP запросов
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https://');
        const client = isHttps ? https : http;
        
        const requestOptions = {
            method: options.method || 'GET',
            headers: {
                'User-Agent': 'LoadAnalyzer/1.0',
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

// Функция для получения статистики
async function getServerStats() {
    try {
        const response = await makeRequest(`${BASE_URL}/stats`);
        
        if (response.statusCode === 200) {
            return response.data;
        } else {
            throw new Error(`HTTP ${response.statusCode}: ${response.data}`);
        }
    } catch (error) {
        console.error('❌ Ошибка получения статистики:', error.message);
        return null;
    }
}

// Функция для тестирования нагрузки
async function testLoad() {
    console.log('🧪 Тестирование нагрузки...');
    
    const endpoints = [
        { path: '/health', needsAuth: false },
        { path: '/network', needsAuth: false },
        { path: '/api/referrals/tree', needsAuth: true },
        { path: '/api/referrals/activity-stats', needsAuth: true }
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
        const startTime = Date.now();
        try {
            const options = endpoint.needsAuth ? {
                headers: { 'x-api-key': API_READONLY_KEY }
            } : {};
            
            const response = await makeRequest(`${BASE_URL}${endpoint.path}`, options);
            const responseTime = Date.now() - startTime;
            
            results.push({
                endpoint: endpoint.path,
                status: response.statusCode,
                responseTime,
                success: response.statusCode < 400
            });
            
            console.log(`✅ ${endpoint.path}: ${response.statusCode} (${responseTime}ms)`);
        } catch (error) {
            const responseTime = Date.now() - startTime;
            results.push({
                endpoint: endpoint.path,
                status: 'ERROR',
                responseTime,
                success: false,
                error: error.message
            });
            
            console.log(`❌ ${endpoint.path}: ERROR (${responseTime}ms) - ${error.message}`);
        }
    }
    
    return results;
}

// Функция для анализа результатов
function analyzeResults(stats, loadTest) {
    console.log('\n📊 АНАЛИЗ НАГРУЗКИ');
    console.log('==================');
    
    if (stats && stats.data) {
        const { stats: serverStats, prediction } = stats.data;
        
        console.log(`📈 Общая статистика:`);
        console.log(`   Всего запросов: ${serverStats.total}`);
        console.log(`   Ошибок: ${serverStats.errors}`);
        console.log(`   Среднее время отклика: ${serverStats.avgResponseTime}ms`);
        
        console.log(`\n🔥 Топ endpoints:`);
        serverStats.topEndpoints.slice(0, 5).forEach(([endpoint, data], index) => {
            console.log(`   ${index + 1}. ${endpoint}: ${data.count} запросов (${data.avgTime}ms avg)`);
        });
        
        console.log(`\n🌐 Топ IP адреса:`);
        serverStats.topIPs.slice(0, 5).forEach(([ip, data], index) => {
            console.log(`   ${index + 1}. ${ip}: ${data.count} запросов`);
        });
        
        console.log(`\n⏰ Распределение по часам:`);
        serverStats.hourlyDistribution.forEach(([hour, count]) => {
            const bar = '█'.repeat(Math.min(count / 10, 20));
            console.log(`   ${hour.toString().padStart(2, '0')}:00 ${bar} ${count}`);
        });
        
        console.log(`\n🔮 Предсказание нагрузки:`);
        console.log(`   Текущая нагрузка: ${prediction.currentLoad} запросов/час`);
        console.log(`   Прогноз на следующий час: ${prediction.predictedNextHour} запросов`);
        console.log(`   Пиковый час: ${prediction.peakHour}:00 (${prediction.peakRequests} запросов)`);
        console.log(`   Рекомендация: ${prediction.recommendation}`);
    }
    
    console.log(`\n🧪 Результаты тестирования:`);
    const avgResponseTime = loadTest.reduce((sum, test) => sum + test.responseTime, 0) / loadTest.length;
    const successRate = (loadTest.filter(test => test.success).length / loadTest.length) * 100;
    
    console.log(`   Среднее время отклика: ${Math.round(avgResponseTime)}ms`);
    console.log(`   Успешность: ${Math.round(successRate)}%`);
    
    loadTest.forEach(test => {
        const status = test.success ? '✅' : '❌';
        console.log(`   ${status} ${test.endpoint}: ${test.responseTime}ms`);
    });
}

// Функция для рекомендаций по оптимизации
function getOptimizationRecommendations(stats, loadTest) {
    console.log('\n💡 РЕКОМЕНДАЦИИ ПО ОПТИМИЗАЦИИ');
    console.log('================================');
    
    const recommendations = [];
    
    if (stats && stats.data) {
        const { stats: serverStats } = stats.data;
        
        // Анализ времени отклика
        if (serverStats.avgResponseTime > 1000) {
            recommendations.push('🐌 Высокое время отклика. Рассмотрите кэширование или оптимизацию базы данных.');
        }
        
        // Анализ ошибок
        const errorRate = (serverStats.errors / serverStats.total) * 100;
        if (errorRate > 5) {
            recommendations.push('❌ Высокий процент ошибок. Проверьте стабильность системы и логи.');
        }
        
        // Анализ нагрузки с одного IP
        if (serverStats.topIPs[0]?.count > 100) {
            recommendations.push('🚨 Подозрительная активность с одного IP. Рассмотрите rate limiting или блокировку.');
        }
        
        // Анализ пиковой нагрузки
        const peakHour = serverStats.hourlyDistribution.reduce((max, [hour, count]) => 
            count > max.count ? { hour, count } : max, { hour: 0, count: 0 });
        
        if (peakHour.count > 1000) {
            recommendations.push('📈 Высокая пиковая нагрузка. Рассмотрите горизонтальное масштабирование.');
        }
    }
    
    // Анализ результатов тестирования
    const avgResponseTime = loadTest.reduce((sum, test) => sum + test.responseTime, 0) / loadTest.length;
    if (avgResponseTime > 2000) {
        recommendations.push('⏱️ Медленные ответы в тестах. Проверьте производительность сервера.');
    }
    
    const slowEndpoints = loadTest.filter(test => test.responseTime > 3000);
    if (slowEndpoints.length > 0) {
        recommendations.push(`🐌 Медленные endpoints: ${slowEndpoints.map(e => e.endpoint).join(', ')}`);
    }
    
    if (recommendations.length === 0) {
        recommendations.push('✅ Система работает оптимально. Продолжайте мониторинг.');
    }
    
    recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
    });
}

// Основная функция
async function main() {
    console.log('🔍 АНАЛИЗ НАГРУЗКИ СЕРВЕРА');
    console.log('===========================');
    console.log(`🌐 Сервер: ${BASE_URL}`);
    console.log(`⏰ Время: ${new Date().toLocaleString('ru-RU')}`);
    console.log('');
    
    // Получаем статистику сервера
    console.log('📊 Получение статистики сервера...');
    const stats = await getServerStats();
    
    // Тестируем нагрузку
    const loadTest = await testLoad();
    
    // Анализируем результаты
    analyzeResults(stats, loadTest);
    
    // Даем рекомендации
    getOptimizationRecommendations(stats, loadTest);
    
    console.log('\n🎯 Анализ завершен!');
}

// Запуск
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('❌ Критическая ошибка:', error);
        process.exit(1);
    });
}

export { main as analyzeLoad };
