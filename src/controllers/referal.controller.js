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
			// Детальное логирование для диагностики Salebot
			console.log('🔍 Salebot API Request Debug:');
			console.log('  Headers:', JSON.stringify(req.headers, null, 2));
			console.log('  Body:', JSON.stringify(req.body, null, 2));
			console.log('  Body type:', typeof req.body);
			console.log('  Body keys:', req.body ? Object.keys(req.body) : 'null/undefined');
			console.log('  Content-Type:', req.get('Content-Type'));
			console.log('  User-Agent:', req.get('User-Agent'));
			console.log('  IP:', req.ip);
			console.log('  Timestamp:', new Date().toISOString());
			console.log('---');

			const referalData = req.body; // Получаем данные реферала из тела запроса

			// Дополнительная проверка на пустое тело
			if (!referalData || Object.keys(referalData).length === 0) {
				console.error('❌ Empty request body received from Salebot');
				const error = new Error('Empty request body - check Salebot configuration');
				error.statusCode = 400;
				error.code = 'EMPTY_BODY';
				throw error;
			}

			const createdReferal = await referalService.createReferal(referalData); // Вызываем сервис для создания реферала
			res.status(201).json({ message: 'Referal created successfully', data: createdReferal }); // Отправляем успешный ответ с кодом 201 (Created) и данными
		} catch (error) {
			console.error("Error in ReferalController - createReferal:", error);
			next(error); // Передаем ошибку в централизованный обработчик ошибок
		}
	}

	/**
	 * Создает нового реферала или обновляет существующего (upsert).
	 * Обрабатывает POST запрос на создание/обновление реферала.
	 * @param {Request} req - Объект запроса Express.
	 * @param {Response} res - Объект ответа Express.
	 * @param {NextFunction} next - Функция next для передачи ошибок middleware обработки ошибок.
	 */
	async createOrUpdateReferal(req, res, next) {
		try {
			const referalData = req.body; // Получаем данные реферала из тела запроса
			const createdOrUpdatedReferal = await referalService.createOrUpdateReferal(referalData); // Вызываем сервис для создания/обновления реферала
			res.status(200).json({ message: 'Referal created or updated successfully', data: createdOrUpdatedReferal }); // Отправляем успешный ответ с данными
		} catch (error) {
			console.error("Error in ReferalController - createOrUpdateReferal:", error);
			next(error); // Передаем ошибку в централизованный обработчик ошибок
		}
	}

	/**
	 * Получает реферала по ID и возвращает JSON с параметром status.
	 * Обрабатывает GET запрос на получение реферала по referal_id для API.
	 * @param {Request} req - Объект запроса Express.
	 * @param {Response} res - Объект ответа Express.
	 * @param {NextFunction} next - Функция next для передачи ошибок middleware обработки ошибок.
	 */
	async getReferalById(req, res, next) {
		try {
			const referalId = req.params.referalId;
			const referal = await referalService.getReferalById(referalId);

			if (referal) {
				// Возвращаем JSON для API с status: true
				res.status(200).json({
					status: true,
					data: referal
				});
			} else {
				// Возвращаем JSON с status: false для несуществующего реферала
				res.status(200).json({
					status: false,
					message: 'Referal not found'
				});
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



	/**
	 * Отображает новый интерфейс реферальной сети.
	 * Обрабатывает GET запрос и рендерит шаблон 'referral-network'.
	 * @param {Request} req - Объект запроса Express.
	 * @param {Response} res - Объект ответа Express.
	 * @param {NextFunction} next - Функция next для передачи ошибок middleware обработки ошибок.
	 */
	async getReferralNetwork(req, res, next) {
		try {
			// Рендерим шаблон referral-network.ejs
			res.render('referral-network', {
				title: 'Реферальная сеть'
			});
		} catch (error) {
			next(error); // Передаем ошибку в централизованный обработчик
		}
	}

	/**
	 * Получает все рефералы в виде дерева для API.
	 * Обрабатывает GET запрос и возвращает JSON с данными всех рефералов.
	 * @param {Request} req - Объект запроса Express.
	 * @param {Response} res - Объект ответа Express.
	 * @param {NextFunction} next - Функция next для передачи ошибок middleware обработки ошибок.
	 */
	async getAllReferralsTree(req, res, next) {
		const startTime = Date.now();
		try {
			console.log('📊 Начало загрузки дерева всех рефералов...');
			
			// Получаем дерево всех рефералов
			const referralTrees = await referalService.getAllReferralsTree();

			const executionTime = Date.now() - startTime;
			console.log(`✅ getAllReferralsTree завершено за ${executionTime}ms, возвращено ${referralTrees.length} корневых рефералов`);

			res.status(200).json({
				status: true,
				data: referralTrees,
				meta: {
					count: referralTrees.length,
					executionTime: executionTime
				}
			});
		} catch (error) {
			const executionTime = Date.now() - startTime;
			console.error(`❌ Error in ReferalController - getAllReferralsTree (${executionTime}ms):`, error);
			
			// Возвращаем ошибку с информацией о времени выполнения
			const errorResponse = {
				status: false,
				error: {
					message: error.message || 'Ошибка при загрузке дерева рефералов',
					code: error.code || 'TREE_LOAD_ERROR',
					executionTime: executionTime
				}
			};

			// Если это таймаут или ошибка БД, возвращаем 500
			if (error.message && (
				error.message.includes('timeout') || 
				error.message.includes('Query timeout') ||
				error.message.includes('connection')
			)) {
				return res.status(500).json(errorResponse);
			}

			next(error);
		}
	}

	/**
	 * Получает статистику активности рефералов для API.
	 * Обрабатывает GET запрос и возвращает JSON с количеством активных и неактивных рефералов.
	 * @param {Request} req - Объект запроса Express.
	 * @param {Response} res - Объект ответа Express.
	 * @param {NextFunction} next - Функция next для передачи ошибок middleware обработки ошибок.
	 */
	async getActivityStats(req, res, next) {
		try {
			// Получаем статистику активности
			const activityStats = await referalService.getActivityStats();

			res.status(200).json({
				status: true,
				data: activityStats
			});
		} catch (error) {
			console.error("Error in ReferalController - getActivityStats:", error);
			next(error);
		}
	}

	/**
	 * Отображает интерфейс реферальной сети для конкретного пользователя.
	 * Обрабатывает GET запрос и рендерит шаблон 'referral-network' с данными конкретного пользователя.
	 * @param {Request} req - Объект запроса Express.
	 * @param {Response} res - Объект ответа Express.
	 * @param {NextFunction} next - Функция next для передачи ошибок middleware обработки ошибок.
	 */
	async getUserReferralNetwork(req, res, next) {
		try {
			const referalId = req.params.referalId;

			// Рендерим шаблон referral-network.ejs с ID пользователя
			res.render('referral-network', {
				title: `Реферальная сеть - ${referalId}`,
				userReferalId: referalId
			});
		} catch (error) {
			next(error); // Передаем ошибку в централизованный обработчик
		}
	}

	/**
	 * Получает дерево рефералов для конкретного пользователя для API.
	 * Обрабатывает GET запрос и возвращает JSON с данными рефералов конкретного пользователя.
	 * @param {Request} req - Объект запроса Express.
	 * @param {Response} res - Объект ответа Express.
	 * @param {NextFunction} next - Функция next для передачи ошибок middleware обработки ошибок.
	 */
	async getUserReferralsTree(req, res, next) {
		const startTime = Date.now();
		try {
			const referalId = req.params.referalId;
			console.log(`📊 Начало загрузки дерева рефералов для пользователя: ${referalId}`);

			// Получаем дерево рефералов для конкретного пользователя
			const referralTree = await referalService.getReferalTree(referalId);

			const executionTime = Date.now() - startTime;
			console.log(`✅ getUserReferralsTree завершено за ${executionTime}ms для пользователя ${referalId}`);

			res.status(200).json({
				status: true,
				data: referralTree,
				meta: {
					referalId: referalId,
					count: referralTree.length,
					executionTime: executionTime
				}
			});
		} catch (error) {
			const executionTime = Date.now() - startTime;
			console.error(`❌ Error in ReferalController - getUserReferralsTree (${executionTime}ms):`, error);
			
			// Возвращаем ошибку с информацией
			const errorResponse = {
				status: false,
				error: {
					message: error.message || 'Ошибка при загрузке дерева рефералов пользователя',
					code: error.code || 'USER_TREE_LOAD_ERROR',
					executionTime: executionTime
				}
			};

			// Если это таймаут или ошибка БД, возвращаем 500
			if (error.message && (
				error.message.includes('timeout') || 
				error.message.includes('Query timeout') ||
				error.message.includes('connection')
			)) {
				return res.status(500).json(errorResponse);
			}

			next(error);
		}
	}

	/**
	 * Получает статистику активности рефералов для конкретного пользователя для API.
	 * Обрабатывает GET запрос и возвращает JSON с количеством активных и неактивных рефералов пользователя.
	 * @param {Request} req - Объект запроса Express.
	 * @param {Response} res - Объект ответа Express.
	 * @param {NextFunction} next - Функция next для передачи ошибок middleware обработки ошибок.
	 */
	async getUserActivityStats(req, res, next) {
		try {
			const referalId = req.params.referalId;

			// Получаем статистику активности для конкретного пользователя
			const activityStats = await referalService.getUserActivityStats(referalId);

			res.status(200).json({
				status: true,
				data: activityStats
			});
		} catch (error) {
			console.error("Error in ReferalController - getUserActivityStats:", error);
			next(error);
		}
	}

	// Здесь будут добавлены другие методы контроллера (например, для получения дерева, поиска, фильтрации)

}

export default new ReferalController();