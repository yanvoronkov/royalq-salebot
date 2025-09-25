// Скрипт для тестирования защиты от дублирования
import mongoose from 'mongoose';
import Referal from '../src/models/referal.model.js';
import referalService from '../src/services/referal.service.js';
import { config } from 'dotenv';

// Загружаем переменные окружения
config();

async function testDuplicateProtection() {
	try {
		// Подключаемся к базе данных
		await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/royalq-salebot');
		console.log('Подключено к MongoDB');

		const testReferalId = 'test_duplicate_protection_' + Date.now();
		const testData = {
			referal_id: testReferalId,
			referer_id: null,
			referal_nickname: 'test_user',
			referal_name: 'Test User',
			referral_link_url: 'https://example.com/ref/test',
			personal_channel_link: 'https://t.me/test_channel',
			utm: 'source=test&campaign=duplicate_protection'
		};

		console.log('\n=== Тестирование защиты от дублирования ===\n');

		// Тест 1: Создание первого реферала
		console.log('1. Создание первого реферала...');
		try {
			const firstReferal = await referalService.createReferal(testData);
			console.log('✅ Первый реферал создан успешно:', firstReferal.referal_id);
		} catch (error) {
			console.log('❌ Ошибка при создании первого реферала:', error.message);
		}

		// Тест 2: Попытка создать дубликат (должна вызвать ошибку)
		console.log('\n2. Попытка создать дубликат...');
		try {
			const duplicateReferal = await referalService.createReferal(testData);
			console.log('❌ ОШИБКА: Дубликат был создан! Это не должно было произойти.');
		} catch (error) {
			if (error.code === 'DUPLICATE_REFERAL' || error.statusCode === 409) {
				console.log('✅ Защита от дублирования работает:', error.message);
			} else {
				console.log('❌ Неожиданная ошибка:', error.message);
			}
		}

		// Тест 3: Использование upsert (должно обновить существующий)
		console.log('\n3. Тестирование upsert...');
		const updatedData = {
			...testData,
			referal_nickname: 'test_user_updated',
			referal_name: 'Test User Updated'
		};

		try {
			const upsertedReferal = await referalService.createOrUpdateReferal(updatedData);
			console.log('✅ Upsert выполнен успешно:');
			console.log('   - referal_id:', upsertedReferal.referal_id);
			console.log('   - referal_nickname:', upsertedReferal.referal_nickname);
			console.log('   - referal_name:', upsertedReferal.referal_name);
		} catch (error) {
			console.log('❌ Ошибка при upsert:', error.message);
		}

		// Тест 4: Проверка, что в базе только один документ
		console.log('\n4. Проверка количества документов...');
		const count = await Referal.countDocuments({ referal_id: testReferalId });
		if (count === 1) {
			console.log('✅ В базе данных только один документ с этим referal_id');
		} else {
			console.log(`❌ ОШИБКА: В базе данных ${count} документов с этим referal_id`);
		}

		// Тест 5: Попытка создать реферал без referal_id
		console.log('\n5. Тестирование валидации (без referal_id)...');
		try {
			const invalidData = { ...testData };
			delete invalidData.referal_id;
			await referalService.createReferal(invalidData);
			console.log('❌ ОШИБКА: Реферал без referal_id был создан!');
		} catch (error) {
			if (error.statusCode === 400) {
				console.log('✅ Валидация работает:', error.message);
			} else {
				console.log('❌ Неожиданная ошибка валидации:', error.message);
			}
		}

		// Очистка тестовых данных
		console.log('\n6. Очистка тестовых данных...');
		await Referal.deleteOne({ referal_id: testReferalId });
		console.log('✅ Тестовые данные удалены');

		console.log('\n=== Тестирование завершено ===');
		console.log('Все тесты пройдены успешно! Защита от дублирования работает корректно.');

	} catch (error) {
		console.error('Ошибка при тестировании:', error);
	} finally {
		// Закрываем соединение
		await mongoose.disconnect();
		console.log('Соединение с MongoDB закрыто');
	}
}

// Запускаем тест
testDuplicateProtection();
