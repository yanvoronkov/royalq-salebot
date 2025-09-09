// Скрипт инициализации MongoDB
db = db.getSiblingDB('royalq-salebot');

// Создание пользователя для приложения
db.createUser({
	user: 'royalq_user',
	pwd: 'secure_password_here',
	roles: [
		{
			role: 'readWrite',
			db: 'royalq-salebot'
		}
	]
});

// Создание коллекций
db.createCollection('referals');
db.createCollection('payments');

// Создание индексов
db.referals.createIndex({ "referal_id": 1 }, { unique: true });
db.referals.createIndex({ "referer_id": 1 });
db.payments.createIndex({ "userId": 1 });
db.payments.createIndex({ "transactionId": 1 }, { unique: true, sparse: true });

print('MongoDB initialized successfully');
