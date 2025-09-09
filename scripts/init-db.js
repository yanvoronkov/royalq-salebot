// scripts/init-db.js
// Скрипт для инициализации локальной базы данных с тестовыми данными

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
		await mongoose.connect(mongoURI);
		console.log('✅ Connected to MongoDB');
	} catch (error) {
		console.error('❌ MongoDB connection failed:', error.message);
		process.exit(1);
	}
};

const clearDatabase = async () => {
	try {
		await Referal.deleteMany({});
		await Payment.deleteMany({});
		console.log('🗑️  Database cleared');
	} catch (error) {
		console.error('❌ Error clearing database:', error.message);
	}
};

const seedDatabase = async () => {
	try {
		// Создаем тестовые рефералы
		const testReferals = [
			{
				referal_id: 'root001',
				referer_id: null,
				referal_nickname: 'root_user',
				referer_nickname: null,
				referal_name: 'Root User',
				referral_link_url: 'https://example.com/ref/root001',
				personal_channel_link: 'https://t.me/root001_channel',
				utm: 'source=direct&campaign=initial'
			},
			{
				referal_id: 'user001',
				referer_id: 'root001',
				referal_nickname: 'john_doe',
				referer_nickname: 'root_user',
				referal_name: 'John Doe',
				referral_link_url: 'https://example.com/ref/user001',
				personal_channel_link: 'https://t.me/john_doe_channel',
				utm: 'source=telegram&campaign=referral'
			},
			{
				referal_id: 'user002',
				referer_id: 'root001',
				referal_nickname: 'jane_smith',
				referer_nickname: 'root_user',
				referal_name: 'Jane Smith',
				referral_link_url: 'https://example.com/ref/user002',
				personal_channel_link: 'https://t.me/jane_smith_channel',
				utm: 'source=facebook&campaign=social'
			},
			{
				referal_id: 'user003',
				referer_id: 'user001',
				referal_nickname: 'bob_wilson',
				referer_nickname: 'john_doe',
				referal_name: 'Bob Wilson',
				referral_link_url: 'https://example.com/ref/user003',
				personal_channel_link: 'https://t.me/bob_wilson_channel',
				utm: 'source=telegram&campaign=referral'
			},
			{
				referal_id: 'user004',
				referer_id: 'user001',
				referal_nickname: 'alice_brown',
				referer_nickname: 'john_doe',
				referal_name: 'Alice Brown',
				referral_link_url: 'https://example.com/ref/user004',
				personal_channel_link: 'https://t.me/alice_brown_channel',
				utm: 'source=instagram&campaign=social'
			},
			{
				referal_id: 'user005',
				referer_id: 'user003',
				referal_nickname: 'charlie_davis',
				referer_nickname: 'bob_wilson',
				referal_name: 'Charlie Davis',
				referral_link_url: 'https://example.com/ref/user005',
				personal_channel_link: 'https://t.me/charlie_davis_channel',
				utm: 'source=telegram&campaign=referral'
			}
		];

		// Создаем тестовые платежи
		const testPayments = [
			{
				userId: 'user001',
				amount: 99.99,
				currency: 'USD',
				paymentMethod: 'card',
				status: 'success',
				transactionId: 'txn_001_001',
				subscriptionId: 'sub_001_001'
			},
			{
				userId: 'user002',
				amount: 49.99,
				currency: 'USD',
				paymentMethod: 'paypal',
				status: 'success',
				transactionId: 'txn_002_001',
				subscriptionId: 'sub_002_001'
			},
			{
				userId: 'user003',
				amount: 149.99,
				currency: 'USD',
				paymentMethod: 'card',
				status: 'success',
				transactionId: 'txn_003_001',
				subscriptionId: 'sub_003_001'
			},
			{
				userId: 'user001',
				amount: 199.99,
				currency: 'USD',
				paymentMethod: 'card',
				status: 'success',
				transactionId: 'txn_001_002',
				subscriptionId: 'sub_001_002'
			}
		];

		// Сохраняем рефералов
		const createdReferals = await Referal.insertMany(testReferals);
		console.log(`✅ Created ${createdReferals.length} referals`);

		// Сохраняем платежи
		const createdPayments = await Payment.insertMany(testPayments);
		console.log(`✅ Created ${createdPayments.length} payments`);

		console.log('\n📊 Database structure:');
		console.log('Root User (root001)');
		console.log('├── John Doe (user001) - 2 payments');
		console.log('│   ├── Bob Wilson (user003) - 1 payment');
		console.log('│   │   └── Charlie Davis (user005)');
		console.log('│   └── Alice Brown (user004)');
		console.log('└── Jane Smith (user002) - 1 payment');

	} catch (error) {
		console.error('❌ Error seeding database:', error.message);
	}
};

const main = async () => {
	console.log('🚀 Initializing local MongoDB database...\n');

	await connectDB();
	await clearDatabase();
	await seedDatabase();

	console.log('\n✅ Database initialization completed!');
	console.log('🌐 You can now start the application with: npm run dev');
	console.log('📱 Dashboard will be available at: http://localhost:3000/dashboard/root001');

	process.exit(0);
};

main().catch(error => {
	console.error('❌ Initialization failed:', error);
	process.exit(1);
});
