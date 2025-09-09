// scripts/clear-db.js
// Скрипт для очистки локальной базы данных

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Определяем __dirname для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем переменные окружения
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Импортируем модели
import Referal from '../src/models/referal.model.js';
import Payment from '../src/models/payment.model.js';

const connectDB = async () => {
	try {
		const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/royalq-salebot';
		await mongoose.connect(mongoURI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log('✅ Connected to MongoDB');
	} catch (error) {
		console.error('❌ MongoDB connection failed:', error.message);
		process.exit(1);
	}
};

const clearDatabase = async () => {
	try {
		console.log('🗑️  Clearing database...');

		// Получаем количество документов перед удалением
		const referalsCount = await Referal.countDocuments();
		const paymentsCount = await Payment.countDocuments();

		console.log(`📊 Found ${referalsCount} referals and ${paymentsCount} payments`);

		// Удаляем все документы
		await Referal.deleteMany({});
		await Payment.deleteMany({});

		console.log('✅ Database cleared successfully');
		console.log(`🗑️  Removed ${referalsCount} referals and ${paymentsCount} payments`);

	} catch (error) {
		console.error('❌ Error clearing database:', error.message);
	}
};

const main = async () => {
	console.log('🧹 Clearing local MongoDB database...\n');

	await connectDB();
	await clearDatabase();

	console.log('\n✅ Database clearing completed!');
	console.log('💡 Run "npm run init-db" to populate with test data');

	process.exit(0);
};

main().catch(error => {
	console.error('❌ Clearing failed:', error);
	process.exit(1);
});
