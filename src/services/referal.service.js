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
		 * Удаляет реферала по его referal_id и все связанные с ним платежи.
		 * @param {string} referalId - Идентификатор реферала для удаления.
		 * @returns {Promise<Document|null>} - Промис, возвращающий удаленный документ реферала или null, если не найден.
		 * @throws {Error} - Если произошла ошибка при удалении реферала или связанных платежей.
		 */
	async deleteReferal(referalId) {
		try {
			// 1. Удаляем платежи, связанные с этим рефералом
			await Payment.deleteMany({ userId: referalId }); // Удаляем все платежи, где userId соответствует referalId

			// 2. Удаляем самого реферала
			const deletedReferal = await Referal.findOneAndDelete({ referal_id: referalId }).lean(); // Ищем и удаляем реферала по referal_id, .lean() для оптимизации чтения

			return deletedReferal; // Возвращаем удаленный документ реферала (может быть null, если реферал не был найден)
		} catch (error) {
			console.error("Error deleting referal and related payments:", error);
			throw error;
		}
	}

	/**
	 * Получает реферальное дерево для заданного refererId (до 4 уровней глубины)
	 * и добавляет количество рефералов в структуре для каждого реферала.
	 * @param {string} refererId - refererId, для которого нужно построить дерево.
	 * @param {number} depth - Максимальная глубина дерева (по умолчанию 4).
	 * @param {number} currentDepth - Текущая глубина рекурсии (используется внутри функции).
	 * @returns {Promise<Array>} - Промис, возвращающий массив объектов, представляющих реферальное дерево.
	 */
	async getReferalTree(refererId, depth = 4, currentDepth = 1) {
		if (depth < currentDepth) {
			return []; // Прекращаем рекурсию, если достигли максимальной глубины
		}

		try {
			const referals = await Referal.find({ referer_id: refererId }).lean(); // Получаем всех рефералов для данного refererId

			if (referals.length === 0) {
				return []; // Если нет рефералов, возвращаем пустой массив
			}

			const tree = []; // Массив для хранения дерева

			// Рекурсивно строим дерево для каждого реферала
			for (const referal of referals) {
				const children = await this.getReferalTree(referal.referal_id, depth, currentDepth + 1); // Получаем поддерево для текущего реферала
				const totalReferals = children.reduce((sum, child) => sum + (child.totalReferals || 0) + 1, children.length); // Считаем общее количество рефералов в структуре

				tree.push({ ...referal, children, totalReferals }); // Добавляем текущего реферала, его поддерево и общее количество рефералов в структуру
			}

			return tree; // Возвращаем построенное дерево
		} catch (error) {
			console.error("Error getting referal tree:", error);
			throw error;
		}
	}

	// Здесь можно добавить другие методы для работы с рефералами (например, поиск, фильтрация, построение дерева)

}

export default new ReferalService(); // Экспортируем экземпляр сервиса