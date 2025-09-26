// src/app.js
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import path from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import { URL } from 'url';

// *** ВАЖНО: Определите __filename и __dirname СРАЗУ ПОСЛЕ ИМПОРТОВ! ***
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import databaseConfig from './config/database.config.js';
import errorHandler from './utils/error-handler.js';
import { webRateLimit } from './middleware/rate-limiter.js';
import { monitorRequests, getStats } from './middleware/request-monitor.js';

import referalRoutes from './routes/referal.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import readonlyRoutes from './routes/readonly.routes.js';

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Мониторинг запросов
app.use(monitorRequests);

// Глобальный rate limiting для веб-интерфейса
app.use(webRateLimit);

// Статические файлы
app.use(express.static(path.join(__dirname, '..', 'public'))); // Поднимаемся на уровень вверх // Теперь __dirname определен!

// Шаблонизатор
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// res.renderToString
app.use(async (req, res, next) => {
	res.renderToString = (path, options) => {
		return new Promise((resolve, reject) => {
			res.render(path, options, (err, html) => {
				if (err) {
					reject(err);
				} else {
					resolve(html);
				}
			});
		});
	};
	next();
});

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'OK',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		environment: process.env.NODE_ENV || 'development'
	});
});

// Статистика и мониторинг
app.get('/stats', getStats);

// Маршруты
app.use('/', referalRoutes);
app.use('/', paymentRoutes);
app.use('/', readonlyRoutes);

// Обработчик ошибок
app.use(errorHandler);

// Подключение к базе данных при запуске приложения
databaseConfig.connect()
	.then(() => {
		console.log('Database connection initialized.');
	})
	.catch(err => {
		console.error('Failed to initialize database connection:', err);
	});

export default app;