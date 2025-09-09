// Скрипт для инициализации тестовых данных в Docker
import mongoose from 'mongoose';

// Подключение к MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://admin:password123@mongodb:27017/royalq-salebot?authSource=admin';

// Схемы (упрощенные)
const referalSchema = new mongoose.Schema({
	referal_id: String,
	referer_id: String,
	reg_date: { type: Date, default: Date.now },
	referal_nickname: String,
	referer_nickname: String,
	referal_name: String,
	referral_link_url: String,
	personal_channel_link: String,
	utm: String
});

const paymentSchema = new mongoose.Schema({
	userId: String,
	paymentDate: { type: Date, default: Date.now },
	amount: Number,
	currency: { type: String, default: 'USD' },
	paymentMethod: String,
	status: { type: String, default: 'success' },
	transactionId: String,
	subscriptionId: String
});

const Referal = mongoose.model('Referal', referalSchema);
const Payment = mongoose.model('Payment', paymentSchema);

// Тестовые данные
const testData = async () => {
	try {
		console.log('Connecting to MongoDB...');
		await mongoose.connect(mongoURI);
		console.log('Connected to MongoDB');

		// Очистка существующих данных
		await Referal.deleteMany({});
		await Payment.deleteMany({});

		// Создание тестовых рефералов
		const referals = [
			{
				referal_id: 'root001',
				referer_id: null,
				referal_nickname: 'root_user',
				referal_name: 'Root User',
				referral_link_url: 'https://example.com/ref/root001',
				personal_channel_link: 'https://t.me/root001_channel',
				utm: 'source=direct'
			},
			{
				referal_id: 'user001',
				referer_id: 'root001',
				referal_nickname: 'john_doe',
				referal_name: 'John Doe',
				referral_link_url: 'https://example.com/ref/user001',
				personal_channel_link: 'https://t.me/user001_channel',
				utm: 'source=telegram&campaign=referral'
			},
			{
				referal_id: 'user002',
				referer_id: 'root001',
				referal_nickname: 'jane_smith',
				referal_name: 'Jane Smith',
				referral_link_url: 'https://example.com/ref/user002',
				personal_channel_link: 'https://t.me/user002_channel',
				utm: 'source=telegram&campaign=referral'
			},
			{
				referal_id: 'user003',
				referer_id: 'user001',
				referal_nickname: 'bob_wilson',
				referal_name: 'Bob Wilson',
				referral_link_url: 'https://example.com/ref/user003',
				personal_channel_link: 'https://t.me/user003_channel',
				utm: 'source=telegram&campaign=referral'
			}
		];

		await Referal.insertMany(referals);
		console.log('Referals created successfully');

		// Создание тестовых платежей
		const payments = [
			{
				userId: 'user001',
				amount: 99.99,
				currency: 'USD',
				paymentMethod: 'card',
				status: 'success',
				transactionId: 'txn_001',
				subscriptionId: 'sub_001'
			},
			{
				userId: 'user001',
				amount: 49.99,
				currency: 'USD',
				paymentMethod: 'paypal',
				status: 'success',
				transactionId: 'txn_002',
				subscriptionId: 'sub_002'
			},
			{
				userId: 'user002',
				amount: 99.99,
				currency: 'USD',
				paymentMethod: 'card',
				status: 'success',
				transactionId: 'txn_003',
				subscriptionId: 'sub_003'
			},
			{
				userId: 'user003',
				amount: 99.99,
				currency: 'USD',
				paymentMethod: 'card',
				status: 'success',
				transactionId: 'txn_004',
				subscriptionId: 'sub_004'
			}
		];

		await Payment.insertMany(payments);
		console.log('Payments created successfully');

		console.log('Test data created successfully');
		process.exit(0);
	} catch (error) {
		console.error('Error creating test data:', error);
		process.exit(1);
	}
};

testData();
