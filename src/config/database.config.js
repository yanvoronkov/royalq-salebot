// src/config/database.config.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Загружаем переменные окружения из .env файла

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI, { // Используем переменную окружения MONGODB_URI
			// clear
		});
		console.log('MongoDB connected successfully!');
	} catch (error) {
		console.error('MongoDB connection failed:', error.message);
		process.exit(1); // Завершаем процесс с ошибкой, если не удалось подключиться к БД
	}
};

export default { connect: connectDB }; // Экспортируем функцию connectDB под именем connect