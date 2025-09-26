#!/usr/bin/env node

/**
 * Скрипт для диагностики проблемы с Salebot API
 * Проверяет, почему Salebot получает ошибку "referal_id is required"
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_SECRET_KEY = process.env.API_SECRET_KEY || 'YdbX9WekeVLzRDbwrgeR+90W2rFE0Q60KzBwg7aP/P0=';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

console.log('🔍 Диагностика проблемы с Salebot API...\n');

/**
 * Тестирует POST запрос как Salebot
 */
async function testSalebotRequest() {
    console.log('📡 Тестирование POST запроса как Salebot...');
    
    const testData = {
        "referal_id": "1234",
        "referer_id": "214879489",
        "referal_nickname": "test_user",
        "referer_nickname": "test_referer",
        "referal_name": "Test User",
        "referral_link_url": "https://t.me/test",
        "personal_channel_link": "",
        "utm": ""
    };

    try {
        const response = await fetch(`${BASE_URL}/api/referals/`, {
            method: 'POST',
            headers: {
                'x-api-key': API_SECRET_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        console.log(`   Статус ответа: ${response.status} ${response.statusText}`);
        
        const responseText = await response.text();
        console.log(`   Ответ сервера: ${responseText}`);

        if (!response.ok) {
            console.log(`   ❌ Ошибка API: ${response.status}`);
            return false;
        }

        console.log(`   ✅ API работает корректно`);
        return true;
    } catch (error) {
        console.log(`   ❌ Ошибка запроса: ${error.message}`);
        return false;
    }
}

/**
 * Тестирует POST запрос с пустым телом
 */
async function testEmptyBodyRequest() {
    console.log('📡 Тестирование POST запроса с пустым телом...');
    
    try {
        const response = await fetch(`${BASE_URL}/api/referals/`, {
            method: 'POST',
            headers: {
                'x-api-key': API_SECRET_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        console.log(`   Статус ответа: ${response.status} ${response.statusText}`);
        
        const responseText = await response.text();
        console.log(`   Ответ сервера: ${responseText}`);

        return responseText;
    } catch (error) {
        console.log(`   ❌ Ошибка запроса: ${error.message}`);
        return null;
    }
}

/**
 * Тестирует POST запрос без referal_id
 */
async function testMissingReferalIdRequest() {
    console.log('📡 Тестирование POST запроса без referal_id...');
    
    const testData = {
        "referer_id": "214879489",
        "referal_nickname": "test_user",
        "referer_nickname": "test_referer",
        "referal_name": "Test User"
    };

    try {
        const response = await fetch(`${BASE_URL}/api/referals/`, {
            method: 'POST',
            headers: {
                'x-api-key': API_SECRET_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        console.log(`   Статус ответа: ${response.status} ${response.statusText}`);
        
        const responseText = await response.text();
        console.log(`   Ответ сервера: ${responseText}`);

        return responseText;
    } catch (error) {
        console.log(`   ❌ Ошибка запроса: ${error.message}`);
        return null;
    }
}

/**
 * Тестирует разные Content-Type заголовки
 */
async function testDifferentContentTypes() {
    console.log('📡 Тестирование разных Content-Type заголовков...');
    
    const testData = {
        "referal_id": "1234",
        "referer_id": "214879489",
        "referal_nickname": "test_user"
    };

    const contentTypes = [
        'application/json',
        'application/x-www-form-urlencoded',
        'text/plain'
    ];

    for (const contentType of contentTypes) {
        console.log(`   Тестирование Content-Type: ${contentType}`);
        
        try {
            let body;
            if (contentType === 'application/json') {
                body = JSON.stringify(testData);
            } else if (contentType === 'application/x-www-form-urlencoded') {
                body = new URLSearchParams(testData).toString();
            } else {
                body = JSON.stringify(testData);
            }

            const response = await fetch(`${BASE_URL}/api/referals/`, {
                method: 'POST',
                headers: {
                    'x-api-key': API_SECRET_KEY,
                    'Content-Type': contentType
                },
                body: body
            });

            console.log(`     Статус: ${response.status} ${response.statusText}`);
            
            const responseText = await response.text();
            console.log(`     Ответ: ${responseText.substring(0, 100)}...`);
            
        } catch (error) {
            console.log(`     ❌ Ошибка: ${error.message}`);
        }
    }
}

/**
 * Проверяет middleware для парсинга JSON
 */
async function testMiddlewareParsing() {
    console.log('📡 Тестирование парсинга middleware...');
    
    // Тест с некорректным JSON
    try {
        const response = await fetch(`${BASE_URL}/api/referals/`, {
            method: 'POST',
            headers: {
                'x-api-key': API_SECRET_KEY,
                'Content-Type': 'application/json'
            },
            body: '{"referal_id": "1234", "referer_id": "214879489"' // Неполный JSON
        });

        console.log(`   Некорректный JSON - Статус: ${response.status}`);
        const responseText = await response.text();
        console.log(`   Ответ: ${responseText}`);
        
    } catch (error) {
        console.log(`   ❌ Ошибка: ${error.message}`);
    }
}

/**
 * Основная функция диагностики
 */
async function runDiagnostics() {
    console.log(`🔧 Конфигурация:`);
    console.log(`   Base URL: ${BASE_URL}`);
    console.log(`   API Key: ${API_SECRET_KEY.substring(0, 10)}...`);
    console.log('');

    // Тест 1: Нормальный запрос
    await testSalebotRequest();
    console.log('');

    // Тест 2: Пустое тело
    await testEmptyBodyRequest();
    console.log('');

    // Тест 3: Без referal_id
    await testMissingReferalIdRequest();
    console.log('');

    // Тест 4: Разные Content-Type
    await testDifferentContentTypes();
    console.log('');

    // Тест 5: Парсинг middleware
    await testMiddlewareParsing();
    console.log('');

    console.log('✅ Диагностика завершена');
    console.log('');
    console.log('💡 Возможные причины проблемы:');
    console.log('1. Salebot отправляет некорректный JSON');
    console.log('2. Salebot не устанавливает правильный Content-Type');
    console.log('3. Middleware не парсит тело запроса');
    console.log('4. Переменные Salebot не подставляются в JSON');
}

// Запуск диагностики
runDiagnostics().catch(error => {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
});
