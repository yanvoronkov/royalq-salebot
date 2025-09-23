// scripts/update-channel-activity.js
import mongoose from 'mongoose';
import Referal from '../src/models/referal.model.js';

// Подключение к базе данных
const mongoURI = 'mongodb://localhost:27017/royalq_salebot_db';

async function updateChannelActivity() {
	try {
		await mongoose.connect(mongoURI);
		console.log('✅ Подключение к MongoDB установлено');

		// Обновляем все записи, добавляя поле channel_activity со значением по умолчанию
		const result = await Referal.updateMany(
			{ channel_activity: { $exists: false } }, // Находим записи без поля channel_activity
			{ $set: { channel_activity: 'Неактивен' } } // Добавляем поле со значением по умолчанию
		);

		console.log(`✅ Обновлено ${result.modifiedCount} записей`);
		console.log('📊 Добавлено поле "channel_activity" со значением "Неактивен"');

		// Показываем примеры обновленных записей
		const sampleRecords = await Referal.find({}).limit(3).select('referal_id referal_nickname channel_activity');
		console.log('\n📋 Примеры обновленных записей:');
		sampleRecords.forEach(record => {
			console.log(`- ID: ${record.referal_id}, Никнейм: ${record.referal_nickname || '—'}, Активность: ${record.channel_activity}`);
		});

	} catch (error) {
		console.error('❌ Ошибка при обновлении:', error);
	} finally {
		await mongoose.disconnect();
		console.log('🔌 Отключение от MongoDB');
	}
}

// Запускаем обновление
updateChannelActivity();
