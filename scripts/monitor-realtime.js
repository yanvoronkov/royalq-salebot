#!/usr/bin/env node

/**
 * Скрипт для мониторинга нагрузки в реальном времени
 * Показывает обновляемую статистику каждые 30 секунд
 */

import https from 'https';
import http from 'http';

const BASE_URL = 'https://projects.inetskills.ru';
const UPDATE_INTERVAL = 30000; // 30 секунд

// Функция для выполнения HTTP запросов
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https://');
        const client = isHttps ? https : http;
        
        const requestOptions = {
            method: options.method || 'GET',
            headers: {
                'User-Agent': 'RealtimeMonitor/1.0',
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
            throw new Error(`HTTP ${response.statusCode}`);
        }
    } catch (error) {
        return null;
    }
}

// Функция для очистки экрана
function clearScreen() {
    process.stdout.write('\x1B[2J\x1B[0f');
}

// Функция для отображения статистики
function displayStats(stats, iteration) {
    clearScreen();
    
    console.log('🔍 МОНИТОРИНГ НАГРУЗКИ В РЕАЛЬНОМ ВРЕМЕНИ');
    console.log('==========================================');
    console.log(`🌐 Сервер: ${BASE_URL}`);
    console.log(`⏰ Время: ${new Date().toLocaleString('ru-RU')}`);
    console.log(`🔄 Обновление #${iteration} (каждые ${UPDATE_INTERVAL/1000} сек)`);
    console.log('');
    
    if (!stats || !stats.data) {
        console.log('❌ Не удалось получить статистику сервера');
        console.log('   Проверьте доступность сервера и endpoint /stats');
        return;
    }
    
    const { stats: serverStats, prediction } = stats.data;
    
    // Общая статистика
    console.log('📊 ОБЩАЯ СТАТИСТИКА');
    console.log('-------------------');
    console.log(`📈 Всего запросов: ${serverStats.total}`);
    console.log(`❌ Ошибок: ${serverStats.errors}`);
    console.log(`⏱️ Среднее время отклика: ${serverStats.avgResponseTime}ms`);
    
    // Топ endpoints
    console.log('\n🔥 ТОП ENDPOINTS');
    console.log('----------------');
    serverStats.topEndpoints.slice(0, 5).forEach(([endpoint, data], index) => {
        const status = data.errors > 0 ? '⚠️' : '✅';
        console.log(`${status} ${index + 1}. ${endpoint}`);
        console.log(`     Запросов: ${data.count} | Время: ${data.avgTime}ms | Ошибок: ${data.errors}`);
    });
    
    // Топ IP
    console.log('\n🌐 ТОП IP АДРЕСА');
    console.log('----------------');
    serverStats.topIPs.slice(0, 5).forEach(([ip, data], index) => {
        const status = data.count > 100 ? '🚨' : data.count > 50 ? '⚠️' : '✅';
        console.log(`${status} ${index + 1}. ${ip}: ${data.count} запросов`);
    });
    
    // Распределение по часам (последние 6 часов)
    console.log('\n⏰ АКТИВНОСТЬ ПО ЧАСАМ (последние 6 часов)');
    console.log('------------------------------------------');
    const currentHour = new Date().getHours();
    const recentHours = [];
    
    for (let i = 5; i >= 0; i--) {
        const hour = (currentHour - i + 24) % 24;
        const count = serverStats.hourlyDistribution.find(h => h[0] === hour)?.[1] || 0;
        recentHours.push([hour, count]);
    }
    
    recentHours.forEach(([hour, count]) => {
        const bar = '█'.repeat(Math.min(count / 20, 30));
        const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
        const isCurrent = hour === currentHour ? '👈' : '  ';
        console.log(`${timeLabel} ${bar} ${count} ${isCurrent}`);
    });
    
    // Предсказание нагрузки
    console.log('\n🔮 ПРЕДСКАЗАНИЕ НАГРУЗКИ');
    console.log('------------------------');
    console.log(`📊 Текущая нагрузка: ${prediction.currentLoad} запросов/час`);
    console.log(`📈 Прогноз на следующий час: ${prediction.predictedNextHour} запросов`);
    console.log(`🔥 Пиковый час: ${prediction.peakHour}:00 (${prediction.peakRequests} запросов)`);
    console.log(`💡 Рекомендация: ${prediction.recommendation}`);
    
    // Статус системы
    console.log('\n🎯 СТАТУС СИСТЕМЫ');
    console.log('-----------------');
    const systemStatus = getSystemStatus(serverStats, prediction);
    console.log(systemStatus);
    
    console.log('\n💡 Нажмите Ctrl+C для выхода');
}

// Функция для определения статуса системы
function getSystemStatus(stats, prediction) {
    const issues = [];
    
    if (stats.avgResponseTime > 2000) {
        issues.push('🐌 Медленные ответы');
    }
    
    if (stats.errors / stats.total > 0.05) {
        issues.push('❌ Много ошибок');
    }
    
    if (stats.topIPs[0]?.count > 500) {
        issues.push('🚨 Подозрительная активность');
    }
    
    if (prediction.predictedNextHour > 1000) {
        issues.push('📈 Высокая прогнозируемая нагрузка');
    }
    
    if (issues.length === 0) {
        return '✅ Система работает стабильно';
    } else {
        return `⚠️ Обнаружены проблемы: ${issues.join(', ')}`;
    }
}

// Основная функция мониторинга
async function startMonitoring() {
    let iteration = 0;
    
    console.log('🚀 Запуск мониторинга в реальном времени...');
    console.log('   Нажмите Ctrl+C для выхода\n');
    
    // Первое обновление
    const stats = await getServerStats();
    displayStats(stats, ++iteration);
    
    // Устанавливаем интервал обновления
    const interval = setInterval(async () => {
        const stats = await getServerStats();
        displayStats(stats, ++iteration);
    }, UPDATE_INTERVAL);
    
    // Обработка сигнала завершения
    process.on('SIGINT', () => {
        clearInterval(interval);
        clearScreen();
        console.log('👋 Мониторинг остановлен');
        process.exit(0);
    });
}

// Запуск
if (import.meta.url === `file://${process.argv[1]}`) {
    startMonitoring().catch(error => {
        console.error('❌ Критическая ошибка:', error);
        process.exit(1);
    });
}

export { startMonitoring };
