// src/config/database.config.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Загружаем переменные окружения из .env файла

const connectDB = async () => {
	try {
		// Используем переменную окружения или локальную MongoDB по умолчанию
		const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/royalq-salebot';

		await mongoose.connect(mongoURI, {

			// Отключаем автоматическое создание индексов в development
			autoIndex: process.env.NODE_ENV !== 'production'
		});

		console.log(`MongoDB connected successfully to: ${mongoURI}`);
		console.log(`Database: ${mongoose.connection.name}`);
		console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
	} catch (error) {
		console.error('MongoDB connection failed:', error.message);
		console.error('Make sure MongoDB is running locally on port 27017');
		process.exit(1); // Завершаем процесс с ошибкой, если не удалось подключиться к БД
	}
};

export default { connect: connectDB }; // Экспортируем функцию connectDB под именем connect