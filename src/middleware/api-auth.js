// src/middleware/api-auth.js
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware для защиты API endpoints
 * Проверяет наличие и валидность API ключа
 */
export const apiAuth = (req, res, next) => {
    // Получаем API ключ из заголовков или query параметров
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    // Получаем ключи из переменных окружения
    const API_SECRET_KEY = process.env.API_SECRET_KEY;
    const API_READONLY_KEY = process.env.API_READONLY_KEY;

    // Проверяем наличие API ключа
    if (!apiKey) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'API key required',
            hint: 'Add x-api-key header or api_key query parameter'
        });
    }

    // Проверяем конфигурацию
    if (!API_SECRET_KEY && !API_READONLY_KEY) {
        console.error('API_SECRET_KEY or API_READONLY_KEY not configured in environment variables');
        return res.status(500).json({
            error: 'Server Configuration Error',
            message: 'API authentication not properly configured'
        });
    }

    // Проверяем валидность API ключа (принимаем любой из двух ключей)
    if (apiKey === API_SECRET_KEY || apiKey === API_READONLY_KEY) {
        req.api_key_type = (apiKey === API_SECRET_KEY) ? 'full_access' : 'readonly';
        console.log(`API request authenticated from IP: ${req.ip} with key type: ${req.api_key_type}`);
        next();
    } else {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid API key'
        });
    }
};

/**
 * Middleware для защиты только запросов на изменение данных
 * GET запросы проходят без проверки, POST/PUT/DELETE требуют API ключ
 */
export const apiAuthWrite = (req, res, next) => {
    // Получаем API ключ из заголовков или query параметров
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    // Получаем основной секретный ключ
    const API_SECRET_KEY = process.env.API_SECRET_KEY;

    // Проверяем наличие API ключа
    if (!apiKey) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'API key required',
            hint: 'Add x-api-key header or api_key query parameter'
        });
    }

    // Проверяем конфигурацию
    if (!API_SECRET_KEY) {
        console.error('API_SECRET_KEY not configured in environment variables for write operation');
        return res.status(500).json({
            error: 'Server Configuration Error',
            message: 'API write authentication not properly configured'
        });
    }

    // Для записи принимаем только основной ключ
    if (apiKey !== API_SECRET_KEY) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Valid API_SECRET_KEY required for write operations'
        });
    }

    req.api_key_type = 'full_access';
    console.log(`API write request authenticated from IP: ${req.ip}`);
    next();
};

/**
 * Middleware для проверки IP адресов (дополнительная защита)
 */
export const ipWhitelist = (allowedIPs = []) => {
    return (req, res, next) => {
        const clientIP = req.ip || req.connection.remoteAddress;

        // Если whitelist пустой, пропускаем все IP
        if (allowedIPs.length === 0) {
            return next();
        }

        // Проверяем IP адрес
        if (!allowedIPs.includes(clientIP)) {
            console.log(`Blocked request from unauthorized IP: ${clientIP}`);
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Access denied from this IP address'
            });
        }

        next();
    };
};
