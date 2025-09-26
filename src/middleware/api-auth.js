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
    
    // Получаем секретный ключ из переменных окружения
    const secretKey = process.env.API_SECRET_KEY;
    
    // Проверяем наличие API ключа
    if (!apiKey) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'API key required',
            hint: 'Add x-api-key header or api_key query parameter'
        });
    }
    
    // Проверяем валидность API ключа
    if (!secretKey) {
        console.error('API_SECRET_KEY not configured in environment variables');
        return res.status(500).json({
            error: 'Server Configuration Error',
            message: 'API authentication not properly configured'
        });
    }
    
    if (apiKey !== secretKey) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid API key'
        });
    }
    
    // Логируем успешную аутентификацию
    console.log(`API request authenticated from IP: ${req.ip}`);
    
    // Переходим к следующему middleware
    next();
};

/**
 * Middleware для защиты только запросов на изменение данных
 * GET запросы проходят без проверки, POST/PUT/DELETE требуют API ключ
 */
export const apiAuthWrite = (req, res, next) => {
    // GET запросы проходят без проверки
    if (req.method === 'GET') {
        return next();
    }
    
    // Для остальных методов применяем полную аутентификацию
    return apiAuth(req, res, next);
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
