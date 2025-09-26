// src/middleware/request-monitor.js

/**
 * Middleware для мониторинга запросов и анализа нагрузки
 */
class RequestMonitor {
	constructor() {
		this.requests = new Map();
		this.stats = {
			total: 0,
			byEndpoint: new Map(),
			byIP: new Map(),
			byHour: new Map(),
			errors: 0,
			avgResponseTime: 0
		};

		// Очистка старых данных каждые 5 минут
		setInterval(() => {
			this.cleanup();
		}, 5 * 60 * 1000);
	}

	recordRequest(req, res, responseTime) {
		const timestamp = new Date();
		const hour = timestamp.getHours();
		const endpoint = `${req.method} ${req.path}`;
		const ip = req.ip || req.connection.remoteAddress;

		// Общая статистика
		this.stats.total++;
		this.stats.avgResponseTime = (this.stats.avgResponseTime + responseTime) / 2;

		// Статистика по endpoint
		if (!this.stats.byEndpoint.has(endpoint)) {
			this.stats.byEndpoint.set(endpoint, { count: 0, avgTime: 0, errors: 0 });
		}
		const endpointStats = this.stats.byEndpoint.get(endpoint);
		endpointStats.count++;
		endpointStats.avgTime = (endpointStats.avgTime + responseTime) / 2;
		if (res.statusCode >= 400) {
			endpointStats.errors++;
			this.stats.errors++;
		}

		// Статистика по IP
		if (!this.stats.byIP.has(ip)) {
			this.stats.byIP.set(ip, { count: 0, lastSeen: timestamp });
		}
		const ipStats = this.stats.byIP.get(ip);
		ipStats.count++;
		ipStats.lastSeen = timestamp;

		// Статистика по часам
		if (!this.stats.byHour.has(hour)) {
			this.stats.byHour.set(hour, 0);
		}
		this.stats.byHour.set(hour, this.stats.byHour.get(hour) + 1);

        // Логирование подозрительной активности
        if (ipStats.count > 100) { // Более 100 запросов с одного IP
            console.warn(`⚠️ High activity from IP ${ip}: ${ipStats.count} requests`);
        }
        
        if (responseTime > 5000) { // Медленные запросы
            console.warn(`🐌 Slow request: ${endpoint} took ${responseTime}ms`);
        }
        
        // Логирование ошибок API
        if (res.statusCode >= 400 && endpoint.includes('/api/')) {
            console.warn(`❌ API Error: ${endpoint} returned ${res.statusCode}`);
        }
	}

	cleanup() {
		const now = new Date();
		const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

		// Очистка старых IP записей
		for (const [ip, stats] of this.stats.byIP.entries()) {
			if (stats.lastSeen < oneHourAgo) {
				this.stats.byIP.delete(ip);
			}
		}
	}

	getStats() {
		return {
			total: this.stats.total,
			errors: this.stats.errors,
			avgResponseTime: Math.round(this.stats.avgResponseTime),
			topEndpoints: Array.from(this.stats.byEndpoint.entries())
				.sort((a, b) => b[1].count - a[1].count)
				.slice(0, 10),
			topIPs: Array.from(this.stats.byIP.entries())
				.sort((a, b) => b[1].count - a[1].count)
				.slice(0, 10),
			hourlyDistribution: Array.from(this.stats.byHour.entries())
				.sort((a, b) => a[0] - b[0])
		};
	}

	getLoadPrediction() {
		const stats = this.getStats();
		const currentHour = new Date().getHours();
		const currentHourRequests = stats.hourlyDistribution.find(h => h[0] === currentHour)?.[1] || 0;

		// Простое предсказание на основе текущей активности
		const predictedNextHour = currentHourRequests * 1.1; // +10% рост
		const peakHour = stats.hourlyDistribution.reduce((max, [hour, count]) =>
			count > max.count ? { hour, count } : max, { hour: 0, count: 0 });

		return {
			currentLoad: currentHourRequests,
			predictedNextHour: Math.round(predictedNextHour),
			peakHour: peakHour.hour,
			peakRequests: peakHour.count,
			recommendation: this.getRecommendation(stats)
		};
	}

	getRecommendation(stats) {
		if (stats.avgResponseTime > 2000) {
			return "⚠️ Высокое время отклика. Рекомендуется оптимизация базы данных или кэширование.";
		}
		if (stats.errors / stats.total > 0.05) {
			return "❌ Высокий процент ошибок. Проверьте логи и стабильность системы.";
		}
		if (stats.topIPs[0]?.count > 500) {
			return "🚨 Подозрительная активность с одного IP. Рассмотрите блокировку.";
		}
		return "✅ Система работает стабильно.";
	}
}

// Создаем глобальный экземпляр монитора
const requestMonitor = new RequestMonitor();

/**
 * Middleware для мониторинга запросов
 */
export const monitorRequests = (req, res, next) => {
	const startTime = Date.now();

	// Перехватываем завершение ответа
	const originalSend = res.send;
	res.send = function (data) {
		const responseTime = Date.now() - startTime;
		requestMonitor.recordRequest(req, res, responseTime);
		return originalSend.call(this, data);
	};

	next();
};

/**
 * Endpoint для получения статистики
 */
export const getStats = (req, res) => {
	const stats = requestMonitor.getStats();
	const prediction = requestMonitor.getLoadPrediction();

	res.json({
		status: true,
		data: {
			stats,
			prediction,
			timestamp: new Date().toISOString()
		}
	});
};

export default requestMonitor;
