// src/services/salebot.service.js
import axios from 'axios';
import salebotConfig from '../config/salebot.config.js';

class SalebotService {
	constructor() {
		this.apiClient = axios.create({
			baseURL: salebotConfig.baseUrl, // Из конфигурации
			// headers: { ... }, // Если нужны заголовки авторизации
		});
	}

	async getReferalData(referalId) {
		try {
			const response = await this.apiClient.get(`/referals/${referalId}`); // Пример эндпоинта
			return response.data;
		} catch (error) {
			console.error("Error fetching referal data from Salebot:", error);
			throw error; // Пробросить ошибку для обработки в контроллере
		}
	}

	async getPaymentData(transactionId) {
		// ... аналогично для получения данных о платежах
	}

	// ... другие методы для взаимодействия с Salebot API
}

export default new SalebotService(); // Экспортируем экземпляр сервиса