// src/middleware/rate-limiter.js

/**
 * Простой rate limiter без внешних зависимостей
 * Ограничивает количество запросов с одного IP
 */
class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60000); // Очистка каждую минуту
    }
    
    cleanup() {
        const now = Date.now();
        for (const [ip, data] of this.requests.entries()) {
            if (now - data.firstRequest > data.windowMs) {
                this.requests.delete(ip);
            }
        }
    }
    
    check(ip, maxRequests = 100, windowMs = 15 * 60 * 1000) {
        const now = Date.now();
        const requestData = this.requests.get(ip);
        
        if (!requestData) {
            this.requests.set(ip, {
                count: 1,
                firstRequest: now,
                windowMs: windowMs
            });
            return { allowed: true, remaining: maxRequests - 1 };
        }
        
        // Если окно истекло, сбрасываем счетчик
        if (now - requestData.firstRequest > windowMs) {
            this.requests.set(ip, {
                count: 1,
                firstRequest: now,
                windowMs: windowMs
            });
            return { allowed: true, remaining: maxRequests - 1 };
        }
        
        // Увеличиваем счетчик
        requestData.count++;
        
        if (requestData.count > maxRequests) {
            return { 
                allowed: false, 
                remaining: 0,
                resetTime: requestData.firstRequest + windowMs
            };
        }
        
        return { 
            allowed: true, 
            remaining: maxRequests - requestData.count 
        };
    }
}

const rateLimiter = new RateLimiter();

/**
 * Middleware для ограничения скорости запросов
 */
export const rateLimit = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // 15 минут
        max = 100, // максимум 100 запросов
        message = 'Too many requests from this IP',
        skipSuccessfulRequests = false
    } = options;
    
    return (req, res, next) => {
        const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
        
        const result = rateLimiter.check(clientIP, max, windowMs);
        
        // Добавляем заголовки с информацией о лимитах
        res.set({
            'X-RateLimit-Limit': max,
            'X-RateLimit-Remaining': result.remaining,
            'X-RateLimit-Reset': result.resetTime ? new Date(result.resetTime).toISOString() : undefined
        });
        
        if (!result.allowed) {
            console.log(`Rate limit exceeded for IP: ${clientIP}`);
            return res.status(429).json({
                error: 'Too Many Requests',
                message: message,
                retryAfter: result.resetTime ? Math.ceil((result.resetTime - Date.now()) / 1000) : undefined
            });
        }
        
        next();
    };
};

/**
 * Специальный rate limiter для API endpoints
 */
export const apiRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 50, // максимум 50 API запросов
    message: 'API rate limit exceeded'
});

/**
 * Специальный rate limiter для веб-интерфейса
 */
export const webRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 200, // максимум 200 запросов для веб-интерфейса
    message: 'Web interface rate limit exceeded'
});
