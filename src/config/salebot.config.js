// src/config/salebot.config.js
import dotenv from 'dotenv';
dotenv.config(); // Загружаем переменные окружения из .env файла

export default {
	baseUrl: process.env.SALEBOT_API_BASE_URL, // Базовый URL Salebot API (из .env)
	apiKey: process.env.SALEBOT_API_KEY,      // API ключ Salebot API (из .env)
	// Здесь можно добавить другие настройки Salebot API, если понадобятся
};