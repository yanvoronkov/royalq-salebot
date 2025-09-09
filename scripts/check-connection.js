// scripts/check-connection.js
// Скрипт для проверки подключения к MongoDB

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Определяем __dirname для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем переменные окружения
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const checkConnection = async () => {
	try {
		console.log('🔍 Checking MongoDB connection...\n');

		const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/royalq-salebot';
		console.log(`📍 Connection URI: ${mongoURI}`);

		// Подключаемся к MongoDB
		await mongoose.connect(mongoURI, {
			serverSelectionTimeoutMS: 5000, // 5 секунд таймаут
		});

		console.log('✅ MongoDB connection successful!');
		console.log(`📊 Database: ${mongoose.connection.name}`);
		console.log(`🌐 Host: ${mongoose.connection.host}`);
		console.log(`🔌 Port: ${mongoose.connection.port}`);
		console.log(`⚡ Ready State: ${mongoose.connection.readyState}`);

		// Проверяем коллекции
		const collections = await mongoose.connection.db.listCollections().toArray();
		console.log(`📁 Collections: ${collections.length}`);

		if (collections.length > 0) {
			console.log('📋 Available collections:');
			collections.forEach(col => {
				console.log(`  - ${col.name}`);
			});
		} else {
			console.log('📋 No collections found (database is empty)');
			console.log('💡 Run "npm run init-db" to populate with test data');
		}

		// Закрываем соединение
		await mongoose.connection.close();
		console.log('\n✅ Connection test completed successfully!');

	} catch (error) {
		console.error('❌ MongoDB connection failed:');
		console.error(`   Error: ${error.message}`);

		if (error.message.includes('ECONNREFUSED')) {
			console.error('\n💡 Troubleshooting:');
			console.error('   1. Make sure MongoDB is running locally');
			console.error('   2. Check if MongoDB is listening on port 27017');
			console.error('   3. Try: brew services start mongodb/brew/mongodb-community (macOS)');
			console.error('   4. Try: sudo systemctl start mongodb (Ubuntu)');
		}

		process.exit(1);
	}
};

checkConnection();
