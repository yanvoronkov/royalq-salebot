// Скрипт для проверки и создания уникальных индексов
import mongoose from 'mongoose';
import { config } from 'dotenv';

// Загружаем переменные окружения
config();

async function checkUniqueIndexes() {
	try {
		// Подключаемся к базе данных
		await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/royalq-salebot');
		console.log('Подключено к MongoDB');

		const db = mongoose.connection.db;

		// Проверяем индексы коллекции referals
		console.log('\n=== Проверка индексов коллекции referals ===');
		const referalsIndexes = await db.collection('referals').indexes();

		console.log('Существующие индексы:');
		referalsIndexes.forEach((index, i) => {
			console.log(`${i + 1}. ${JSON.stringify(index.key)} - unique: ${index.unique || false}`);
		});

		// Проверяем, есть ли уникальный индекс на referal_id
		const referalIdIndex = referalsIndexes.find(index =>
			index.key && index.key.referal_id === 1 && index.unique === true
		);

		if (referalIdIndex) {
			console.log('✅ Уникальный индекс на referal_id существует');
		} else {
			console.log('❌ Уникальный индекс на referal_id НЕ существует');
			console.log('Создаем уникальный индекс...');

			try {
				await db.collection('referals').createIndex(
					{ referal_id: 1 },
					{ unique: true, name: 'referal_id_unique' }
				);
				console.log('✅ Уникальный индекс на referal_id создан');
			} catch (error) {
				if (error.code === 11000) {
					console.log('❌ Не удалось создать уникальный индекс из-за дубликатов в данных');
					console.log('Сначала запустите скрипт clean-duplicates.js для очистки дубликатов');
				} else {
					console.error('Ошибка при создании индекса:', error);
				}
			}
		}

		// Проверяем индексы коллекции payments
		console.log('\n=== Проверка индексов коллекции payments ===');
		const paymentsIndexes = await db.collection('payments').indexes();

		console.log('Существующие индексы:');
		paymentsIndexes.forEach((index, i) => {
			console.log(`${i + 1}. ${JSON.stringify(index.key)} - unique: ${index.unique || false}`);
		});

		// Проверяем, есть ли уникальный индекс на transactionId
		const transactionIdIndex = paymentsIndexes.find(index =>
			index.key && index.key.transactionId === 1 && index.unique === true
		);

		if (transactionIdIndex) {
			console.log('✅ Уникальный индекс на transactionId существует');
		} else {
			console.log('❌ Уникальный индекс на transactionId НЕ существует');
			console.log('Создаем уникальный индекс...');

			try {
				await db.collection('payments').createIndex(
					{ transactionId: 1 },
					{ unique: true, sparse: true, name: 'transactionId_unique' }
				);
				console.log('✅ Уникальный индекс на transactionId создан');
			} catch (error) {
				console.error('Ошибка при создании индекса:', error);
			}
		}

		// Проверяем дубликаты в данных
		console.log('\n=== Проверка дубликатов в данных ===');

		// Проверяем дубликаты referal_id
		const referalDuplicates = await db.collection('referals').aggregate([
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
		]).toArray();

		if (referalDuplicates.length === 0) {
			console.log('✅ Дубликаты referal_id не найдены');
		} else {
			console.log(`❌ Найдено ${referalDuplicates.length} дубликатов referal_id:`);
			referalDuplicates.forEach(dup => {
				console.log(`  - ${dup._id}: ${dup.count} записей`);
			});
		}

		// Проверяем дубликаты transactionId
		const paymentDuplicates = await db.collection('payments').aggregate([
			{
				$match: {
					transactionId: { $ne: null, $ne: '' }
				}
			},
			{
				$group: {
					_id: '$transactionId',
					count: { $sum: 1 }
				}
			},
			{
				$match: {
					count: { $gt: 1 }
				}
			}
		]).toArray();

		if (paymentDuplicates.length === 0) {
			console.log('✅ Дубликаты transactionId не найдены');
		} else {
			console.log(`❌ Найдено ${paymentDuplicates.length} дубликатов transactionId:`);
			paymentDuplicates.forEach(dup => {
				console.log(`  - ${dup._id}: ${dup.count} записей`);
			});
		}

	} catch (error) {
		console.error('Ошибка при проверке индексов:', error);
	} finally {
		// Закрываем соединение
		await mongoose.disconnect();
		console.log('Соединение с MongoDB закрыто');
	}
}

// Запускаем скрипт
checkUniqueIndexes();
