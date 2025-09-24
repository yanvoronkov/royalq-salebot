// src/services/referal.service.js
import Referal from '../models/referal.model.js'; // Импортируем модель Referal
import Payment from '../models/payment.model.js';

class ReferalService {

	/**
	 * Создает нового реферала в базе данных.
	 * @param {Object} referalData - Данные реферала для создания.
	 * @returns {Promise<Document>} - Промис, возвращающий созданный документ реферала.
	 * @throws {Error} - Если произошла ошибка при создании реферала.
	 */
	async createReferal(referalData) {
		try {
			const referal = new Referal(referalData); // Создаем новый экземпляр модели Referal
			await referal.save(); // Сохраняем документ в базу данных
			return referal; // Возвращаем созданный документ
		} catch (error) {
			console.error("Error creating referal:", error);
			throw error; // Пробрасываем ошибку для обработки выше (например, в контроллере)
		}
	}

	/**
	 * Получает реферала по его referal_id.
	 * @param {string} referalId - Идентификатор реферала.
	 * @returns {Promise<Document|null>} - Промис, возвращающий документ реферала или null, если не найден.
	 * @throws {Error} - Если произошла ошибка при поиске реферала.
	 */
	async getReferalById(referalId) {
		try {
			return await Referal.findOne({ referal_id: referalId }).lean(); // Ищем реферала по referal_id, .lean() для оптимизации чтения
		} catch (error) {
			console.error("Error getting referal by id:", error);
			throw error;
		}
	}

	/**
	 * Обновляет данные реферала по его referal_id.
	 * @param {string} referalId - Идентификатор реферала для обновления.
	 * @param {Object} updateData - Объект с данными для обновления.
	 * @returns {Promise<Document|null>} - Промис, возвращающий обновленный документ реферала или null, если не найден.
	 * @throws {Error} - Если произошла ошибка при обновлении реферала.
	 */
	async updateReferal(referalId, updateData) {
		try {
			return await Referal.findOneAndUpdate({ referal_id: referalId }, updateData, { new: true }).lean();
			// findOneAndUpdate: ищем по referal_id и обновляем updateData, { new: true } чтобы вернуть обновленный документ
			// .lean() для оптимизации чтения
		} catch (error) {
			console.error("Error updating referal:", error);
			throw error;
		}
	}

	/**
	 * Удаляет реферала по его referal_id.
	 * @param {string} referalId - Идентификатор реферала для удаления.
	 * @returns {Promise<Document|null>} - Промис, возвращающий удаленный документ реферала или null, если не найден.
	 * @throws {Error} - Если произошла ошибка при удалении реферала.
	 */

	async deleteReferal(referalId) {
		try {
			// Используем deleteOne, чтобы вызвать middleware
			const deletedReferal = await Referal.deleteOne({ referal_id: referalId });
			return deletedReferal; // Или вернуть что-то другое, что вам нужно
		} catch (error) {
			console.error("Error deleting referal:", error);
			throw error;
		}
	}

	/**
	 * Подсчитывает общее количество потомков в дереве (включая всех детей, внуков и т.д.)
	 * @param {Array} children - Массив дочерних элементов
	 * @returns {number} - Общее количество потомков
	 */
	countAllDescendants(children) {
		if (!children || children.length === 0) {
			return 0;
		}

		let totalCount = 0;
		for (const child of children) {
			// Считаем самого ребенка
			totalCount += 1;
			// Рекурсивно считаем всех его потомков
			totalCount += this.countAllDescendants(child.children);
		}
		return totalCount;
	}

	/**
	 * Проверяет активность реферала на основе регистраций потомков за последние 7 дней
	 * @param {string} referalId - ID реферала для проверки
	 * @returns {Promise<boolean>} - true если активен (есть регистрации за 7 дней), false если неактивен
	 */
	async isReferalActive(referalId) {
		try {
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

			// Ищем рефералов, приглашенных данным рефералом за последние 7 дней
			const recentReferrals = await Referal.find({
				referer_id: referalId,
				reg_date: { $gte: sevenDaysAgo }
			}).countDocuments();

			return recentReferrals > 0;
		} catch (error) {
			console.error("Error checking referal activity:", error);
			return false; // В случае ошибки считаем неактивным
		}
	}

	/**
	 * Подсчитывает количество активных и неактивных рефералов
	 * @returns {Promise<Object>} - Объект с количеством активных и неактивных рефералов
	 */
	async getActivityStats() {
		try {
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

			// Получаем всех рефералов, которые имеют потомков
			const referalsWithChildren = await this.getReferalsWithChildren();

			// Получаем всех рефералов, которые НЕ имеют потомков (неактивные по умолчанию)
			const referalsWithoutChildren = await Referal.find({
				referal_id: { $nin: referalsWithChildren }
			}).select('referal_id').lean();

			let activeCount = 0;
			let inactiveCount = 0;

			// Все рефералы без потомков считаются неактивными
			inactiveCount += referalsWithoutChildren.length;

			// Проверяем активность рефералов с потомками
			for (const referalId of referalsWithChildren) {
				const isActive = await this.isReferalActive(referalId);
				if (isActive) {
					activeCount++;
				} else {
					inactiveCount++;
				}
			}

			return {
				active: activeCount,
				inactive: inactiveCount,
				total: activeCount + inactiveCount
			};
		} catch (error) {
			console.error("Error getting activity stats:", error);
			return { active: 0, inactive: 0, total: 0 };
		}
	}

	/**
	 * Получает список всех рефералов, которые имеют потомков
	 * @returns {Promise<Array>} - Массив referal_id рефералов с потомками
	 */
	async getReferalsWithChildren() {
		try {
			const result = await Referal.aggregate([
				{
					$group: {
						_id: "$referer_id",
						count: { $sum: 1 }
					}
				},
				{
					$match: {
						_id: { $ne: null } // Исключаем null (корневые рефералы)
					}
				},
				{
					$project: {
						referal_id: "$_id",
						_count: "$count"
					}
				}
			]);

			return result.map(item => item.referal_id);
		} catch (error) {
			console.error("Error getting referals with children:", error);
			return [];
		}
	}

	/**
	 * Подсчитывает количество активных и неактивных рефералов для конкретного пользователя
	 * @param {string} referalId - ID реферала для которого нужно получить статистику
	 * @returns {Promise<Object>} - Объект с количеством активных и неактивных рефералов
	 */
	async getUserActivityStats(referalId) {
		try {
			// Получаем дерево рефералов для пользователя
			const referralTree = await this.getReferalTree(referalId);

			// Преобразуем дерево в плоский список всех рефералов
			const allReferrals = this.flattenTreeForStats(referralTree);

			if (allReferrals.length === 0) {
				return {
					active: 0,
					inactive: 0,
					total: 0
				};
			}

			let activeCount = 0;
			let inactiveCount = 0;

			// Проверяем каждого реферала в дереве
			for (const referal of allReferrals) {
				// Проверяем, есть ли у этого реферала потомки
				const hasChildren = await Referal.findOne({
					referer_id: referal.referal_id
				}).lean();

				if (!hasChildren) {
					// Реферал без потомков = неактивный
					inactiveCount++;
				} else {
					// Реферал с потомками - проверяем активность за последние 7 дней
					const isActive = await this.isReferalActive(referal.referal_id);
					if (isActive) {
						activeCount++;
					} else {
						inactiveCount++;
					}
				}
			}

			return {
				active: activeCount,
				inactive: inactiveCount,
				total: activeCount + inactiveCount
			};
		} catch (error) {
			console.error("Error getting user activity stats:", error);
			return { active: 0, inactive: 0, total: 0 };
		}
	}

	/**
	 * Преобразует дерево рефералов в плоский список для статистики
	 * @param {Array} tree - Дерево рефералов
	 * @returns {Array} - Плоский список всех рефералов
	 */
	flattenTreeForStats(tree) {
		const result = [];

		function flatten(nodes) {
			for (const node of nodes) {
				result.push(node);
				if (node.children && node.children.length > 0) {
					flatten(node.children);
				}
			}
		}

		flatten(tree);
		return result;
	}

	/**
	 * Получает реферальное дерево для заданного refererId (до 10 уровней глубины)
	 * и добавляет количество рефералов в структуре для каждого реферала.
	 * @param {string} refererId - refererId, для которого нужно построить дерево.
	 * @param {number} depth - Максимальная глубина дерева (по умолчанию 10).
	 * @param {number} currentDepth - Текущая глубина рекурсии (используется внутри функции).
	 * @returns {Promise<Array>} - Промис, возвращающий массив объектов, представляющих реферальное дерево.
	 */
	async getReferalTree(refererId, depth = 10, currentDepth = 1) {
		if (depth < currentDepth) {
			return []; // Прекращаем рекурсию, если достигли максимальной глубины
		}

		try {
			// Оптимизированный запрос с выбором только нужных полей
			const referals = await Referal.find({ referer_id: refererId })
				.sort({ reg_date: 1 })
				.select('referal_id referer_id reg_date referal_nickname referer_nickname referal_name channel_activity referral_link_url personal_channel_link utm')
				.lean();

			if (referals.length === 0) {
				return []; // Если нет рефералов, возвращаем пустой массив
			}

			const tree = []; // Массив для хранения дерева

			// Параллельно обрабатываем всех рефералов для лучшей производительности
			const promises = referals.map(async (referal) => {
				const children = await this.getReferalTree(referal.referal_id, depth, currentDepth + 1);
				const totalReferals = this.countAllDescendants(children);
				return { ...referal, children, totalReferals };
			});

			const results = await Promise.all(promises);
			return results;
		} catch (error) {
			console.error("Error getting referal tree:", error);
			throw error;
		}
	}

	/**
	 * Получает всех корневых рефералов (без родителя) с оптимизированным запросом.
	 * @returns {Promise<Array>} - Промис, возвращающий массив корневых рефералов.
	 * @throws {Error} - Если произошла ошибка при поиске рефералов.
	 */
	async getRootReferrals() {
		try {
			return await Referal.find({ referer_id: null })
				.sort({ reg_date: 1 })
				.select('referal_id referer_id reg_date referal_nickname referer_nickname referal_name channel_activity referral_link_url personal_channel_link utm')
				.lean();
		} catch (error) {
			console.error("Error getting root referrals:", error);
			throw error;
		}
	}

	/**
	 * Получает всех рефералов в виде дерева для нового интерфейса с оптимизацией производительности.
	 * @returns {Promise<Array>} - Промис, возвращающий массив корневых рефералов с их детьми.
	 * @throws {Error} - Если произошла ошибка при построении дерева.
	 */
	async getAllReferralsTree() {
		try {
			// Используем оптимизированный метод для получения корневых рефералов
			const rootReferrals = await this.getRootReferrals();

			if (rootReferrals.length === 0) {
				return [];
			}

			// Параллельно обрабатываем всех корневых рефералов
			const promises = rootReferrals.map(async (rootReferral) => {
				const children = await this.getReferalTree(rootReferral.referal_id);
				const totalReferals = this.countAllDescendants(children);
				return { ...rootReferral, children, totalReferals };
			});

			const results = await Promise.all(promises);
			return results;
		} catch (error) {
			console.error("Error getting all referrals tree:", error);
			throw error;
		}
	}

	// Здесь можно добавить другие методы для работы с рефералами (например, поиск, фильтрация, построение дерева)

}

export default new ReferalService(); // Экспортируем экземпляр сервиса