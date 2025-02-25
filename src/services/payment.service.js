// src/services/payment.service.js
import Payment from '../models/payment.model.js'; // Импортируем модель Payment
import Referal from '../models/referal.model.js';

class PaymentService {

	/**
	 * Создает новый платеж в базе данных, предварительно проверяя существование реферала (userId).
	 * @param {Object} paymentData - Данные платежа для создания, включая userId (referal_id).
	 * @returns {Promise<Document>} - Промис, возвращающий созданный документ платежа.
	 * @throws {Error} - Если реферал с указанным userId не найден, или произошла другая ошибка при создании платежа.
	 */
	async createPayment(paymentData) {
		try {
			const { userId } = paymentData; // Извлекаем userId из данных платежа

			// 1. Проверяем, существует ли реферал с указанным userId
			const existingReferal = await Referal.findOne({ referal_id: userId }).lean();
			if (!existingReferal) {
				// Если реферал не найден, выбрасываем ошибку
				const error = new Error(`Referal with referal_id "${userId}" not found. Payment cannot be created.`);
				error.statusCode = 400; // Bad Request - неверный запрос, реферал не найден
				throw error;
			}

			// 2. Если реферал существует, создаем платеж
			const payment = new Payment(paymentData);
			await payment.save();
			return payment;
		} catch (error) {
			console.error("Error creating payment:", error);
			throw error; // Пробрасываем ошибку для обработки в контроллере
		}
	}

	/**
	 * Получает платежи пользователя по его userId (referal_id).
	 * @param {string} userId - Идентификатор пользователя (referal_id).
	 * @returns {Promise<Document[]>} - Промис, возвращающий массив документов платежей пользователя.
	 * @throws {Error} - Если произошла ошибка при поиске платежей.
	 */
	async getPaymentsByUserId(userId) {
		try {
			return await Payment.find({ userId: userId }).lean(); // Ищем платежи по userId, .lean() для оптимизации чтения
		} catch (error) {
			console.error("Error getting payments by userId:", error);
			throw error;
		}
	}

	// Здесь можно добавить другие методы для работы с платежами (например, получение платежа по transactionId, обновление статуса)

}

export default new PaymentService(); // Экспортируем экземпляр сервиса