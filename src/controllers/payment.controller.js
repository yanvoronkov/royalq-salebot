// src/controllers/payment.controller.js
import paymentService from '../services/payment.service.js'; // Импортируем сервис платежей

class PaymentController {

	/**
	 * Создает новый платеж.
	 * Обрабатывает POST запрос на создание платежа.
	 * @param {Request} req - Объект запроса Express.
	 * @param {Response} res - Объект ответа Express.
	 * @param {NextFunction} next - Функция next для передачи ошибок middleware обработки ошибок.
	 */
	async createPayment(req, res, next) {
		try {
			const paymentData = req.body; // Получаем данные платежа из тела запроса
			const createdPayment = await paymentService.createPayment(paymentData); // Вызываем сервис для создания платежа
			res.status(201).json({ message: 'Payment created successfully', data: createdPayment }); // Успешный ответ, 201 (Created)
		} catch (error) {
			console.error("Error in PaymentController - createPayment:", error);
			next(error); // Передаем ошибку в централизованный обработчик ошибок
		}
	}

	/**
	 * Получает платежи пользователя по userId.
	 * Обрабатывает GET запрос на получение платежей пользователя по userId.
	 * @param {Request} req - Объект запроса Express.
	 * @param {Response} res - Объект ответа Express.
	 * @param {NextFunction} next - Функция next для передачи ошибок middleware обработки ошибок.
	 */
	async getPaymentsByUserId(req, res, next) {
		try {
			const userId = req.params.userId; // Получаем userId из параметров маршрута
			const payments = await paymentService.getPaymentsByUserId(userId); // Вызываем сервис для получения платежей пользователя
			res.status(200).json({ data: payments }); // Успешный ответ, 200 (OK) с массивом платежей
		} catch (error) {
			console.error("Error in PaymentController - getPaymentsByUserId:", error);
			next(error); // Передаем ошибку в централизованный обработчик ошибок
		}
	}

	// Здесь можно добавить другие методы контроллера для работы с платежами (например, обработка вебхуков)

}

export default new PaymentController(); // <---------------------  ОБЯЗАТЕЛЬНО ПРОВЕРЬТЕ ЭТУ СТРОКУ!