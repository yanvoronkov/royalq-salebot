// src/controllers/referal.controller.js
import referalService from '../services/referal.service.js';

class ReferalController {

	/**
	 * Создает нового реферала.
	 * Обрабатывает POST запрос на создание реферала.
	 * @param {Request} req - Объект запроса Express.
	 * @param {Response} res - Объект ответа Express.
	 * @param {NextFunction} next - Функция next для передачи ошибок middleware обработки ошибок.
	 */
	async createReferal(req, res, next) {
		try {
			const referalData = req.body; // Получаем данные реферала из тела запроса
			const createdReferal = await referalService.createReferal(referalData); // Вызываем сервис для создания реферала
			res.status(201).json({ message: 'Referal created successfully', data: createdReferal }); // Отправляем успешный ответ с кодом 201 (Created) и данными
		} catch (error) {
			console.error("Error in ReferalController - createReferal:", error);
			next(error); // Передаем ошибку в централизованный обработчик ошибок
		}
	}

	/**
	 * Получает реферала по ID и отображает дашборд реферала (веб-интерфейс).
	 * Обрабатывает GET запрос на получение реферала по referal_id и рендерит шаблон 'referal-dashboard'.
	 * @param {Request} req - Объект запроса Express.
	 * @param {Response} res - Объект ответа Express.
	 * @param {NextFunction} next - Функция next для передачи ошибок middleware обработки ошибок.
	 */

	async getReferalDashboard(req, res, next) {
		try {
			const refererId = req.params.refererId; // Получаем referer_id из параметров запроса
			const referalTree = await referalService.getReferalTree(refererId); // Получаем дерево рефералов
			const referalData = await referalService.getReferalById(refererId); // Получаем данные текущего реферала

			// Рендерим шаблон referal-dashboard.ejs и вставляем его в layout.ejs
			res.render('layout', {
				title: `Dashboard for ${refererId}`, // Заголовок страницы
				body: await res.renderToString('referal-dashboard', { // Рендерим referal-dashboard.ejs в строку
					referal: referalData,
					referalTree: referalTree
				})
			});
		} catch (error) {
			next(error); // Передаем ошибку в централизованный обработчик
		}
	}


	/**
	 * Получает реферала по ID и возвращает JSON (API endpoint - остается как есть).
	 * Обрабатывает GET запрос на получение реферала по referal_id для API.
	 * @param {Request} req - Объект запроса Express.
	 * @param {Response} res - Объект ответа Express.
	 * @param {NextFunction} next - Функция next для передачи ошибок middleware обработки ошибок.
	 */
	async getReferalById(req, res, next) { // <--- **ОБНОВЛЕННЫЙ getReferalById**
		try {
			const referalId = req.params.referalId;
			const referal = await referalService.getReferalById(referalId);

			if (referal) {
				// Теперь по умолчанию рендерим шаблон дашборда для тестирования
				return res.render('referal-dashboard', { // <--- **Рендерим шаблон для тестирования**
					title: 'Дашборд реферала (тест)',
					referal: referal
				});
				// Если нужно вернуть JSON для API, раскомментируйте строку ниже и закомментируйте res.render выше
				// res.status(200).json({ data: referal }); // Возвращаем JSON для API (как было раньше)
			} else {
				res.status(404).json({ message: 'Referal not found' });
			}
		} catch (error) {
			console.error("Error in ReferalController - getReferalById:", error);
			next(error);
		}
	}

	/**
	 * Обновляет данные реферала по ID.
	 * Обрабатывает PUT запрос на обновление реферала по referal_id.
	 * @param {Request} req - Объект запроса Express.
	 * @param {Response} res - Объект ответа Express.
	 * @param {NextFunction} next - Функция next для передачи ошибок middleware обработки ошибок.
	 */
	async updateReferal(req, res, next) {
		try {
			const referalId = req.params.referalId; // Получаем referal_id из параметров маршрута
			const updateData = req.body; // Получаем данные для обновления из тела запроса
			const updatedReferal = await referalService.updateReferal(referalId, updateData); // Вызываем сервис для обновления реферала

			if (updatedReferal) {
				res.status(200).json({ message: 'Referal updated successfully', data: updatedReferal }); // Успешное обновление, 200 (OK)
			} else {
				res.status(404).json({ message: 'Referal not found' }); // Не найден для обновления, 404 (Not Found)
			}
		} catch (error) {
			console.error("Error in ReferalController - updateReferal:", error);
			next(error); // Передаем ошибку в централизованный обработчик ошибок
		}
	}

	/**
	 * Удаляет реферала по ID.
	 * Обрабатывает DELETE запрос на удаление реферала по referal_id.
	 * @param {Request} req - Объект запроса Express.
	 * @param {Response} res - Объект ответа Express.
	 * @param {NextFunction} next - Функция next для передачи ошибок middleware обработки ошибок.
	 */
	async deleteReferal(req, res, next) {
		try {
			const referalId = req.params.referalId; // Получаем referal_id из параметров маршрута
			const deletedReferal = await referalService.deleteReferal(referalId); // Вызываем сервис для удаления реферала

			if (deletedReferal) {
				res.status(200).json({ message: 'Referal deleted successfully', data: deletedReferal }); // Успешное удаление, 200 (OK)
			} else {
				res.status(404).json({ message: 'Referal not found' }); // Не найден для удаления, 404 (Not Found)
			}
		} catch (error) {
			console.error("Error in ReferalController - deleteReferal:", error);
			next(error); // Передаем ошибку в централизованный обработчик ошибок
		}
	}

	// Здесь будут добавлены другие методы контроллера (например, для получения дерева, поиска, фильтрации)

}

export default new ReferalController();