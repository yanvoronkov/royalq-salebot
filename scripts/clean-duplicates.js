// Скрипт для очистки дубликатов рефералов в базе данных
import mongoose from 'mongoose';
import Referal from '../src/models/referal.model.js';
import { config } from 'dotenv';

// Загружаем переменные окружения
config();

async function cleanDuplicates() {
	try {
		// Подключаемся к базе данных
		await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/royalq-salebot');
		console.log('Подключено к MongoDB');

		// Находим дубликаты по referal_id
		const duplicates = await Referal.aggregate([
			{
				$group: {
					_id: '$referal_id',
					count: { $sum: 1 },
					docs: { $push: '$$ROOT' }
				}
			},
			{
				$match: {
					count: { $gt: 1 }
				}
			}
		]);

		if (duplicates.length === 0) {
			console.log('Дубликаты не найдены');
			return;
		}

		console.log(`Найдено ${duplicates.length} групп дубликатов:`);

		let totalRemoved = 0;

		for (const duplicate of duplicates) {
			console.log(`\nОбрабатываем дубликаты для referal_id: ${duplicate._id}`);
			console.log(`Количество дубликатов: ${duplicate.count}`);

			// Сортируем документы по дате создания (оставляем самый старый)
			const sortedDocs = duplicate.docs.sort((a, b) => {
				return new Date(a.createdAt) - new Date(b.createdAt);
			});

			// Оставляем первый документ (самый старый), удаляем остальные
			const toKeep = sortedDocs[0];
			const toRemove = sortedDocs.slice(1);

			console.log(`Оставляем документ с ID: ${toKeep._id} (создан: ${toKeep.createdAt})`);

			for (const doc of toRemove) {
				console.log(`Удаляем дубликат с ID: ${doc._id} (создан: ${doc.createdAt})`);
				await Referal.deleteOne({ _id: doc._id });
				totalRemoved++;
			}
		}

		console.log(`\nОчистка завершена. Удалено ${totalRemoved} дубликатов.`);

		// Проверяем результат
		const finalDuplicates = await Referal.aggregate([
			{
				$group: {
					_id: '$referal_id',
					count: { $sum: 1 }
				}
			},
			{
				$match: {
					count: { $gt: 1 }
				}
			}
		]);

		if (finalDuplicates.length === 0) {
			console.log('✅ Все дубликаты успешно удалены!');
		} else {
			console.log(`❌ Остались дубликаты: ${finalDuplicates.length} групп`);
		}

	} catch (error) {
		console.error('Ошибка при очистке дубликатов:', error);
	} finally {
		// Закрываем соединение
		await mongoose.disconnect();
		console.log('Соединение с MongoDB закрыто');
	}
}

// Запускаем скрипт
cleanDuplicates();
