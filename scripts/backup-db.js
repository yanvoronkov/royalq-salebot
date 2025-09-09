// scripts/backup-db.js
// Скрипт для резервного копирования локальной базы данных

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
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

const createBackup = async () => {
	try {
		console.log('💾 Creating database backup...');

		// Создаем директорию для бэкапов
		const backupDir = path.join(__dirname, '..', 'backups');
		if (!fs.existsSync(backupDir)) {
			fs.mkdirSync(backupDir, { recursive: true });
		}

		// Генерируем имя файла с датой и временем
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

		// Получаем все данные
		const referals = await Referal.find({}).lean();
		const payments = await Payment.find({}).lean();

		// Создаем объект бэкапа
		const backup = {
			timestamp: new Date().toISOString(),
			database: 'royalq-salebot',
			referals: referals,
			payments: payments,
			stats: {
				referalsCount: referals.length,
				paymentsCount: payments.length
			}
		};

		// Сохраняем бэкап
		fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

		console.log(`✅ Backup created: ${backupFile}`);
		console.log(`📊 Backup contains ${referals.length} referals and ${payments.length} payments`);

		return backupFile;

	} catch (error) {
		console.error('❌ Error creating backup:', error.message);
	}
};

const listBackups = async () => {
	try {
		const backupDir = path.join(__dirname, '..', 'backups');

		if (!fs.existsSync(backupDir)) {
			console.log('📁 No backups directory found');
			return;
		}

		const files = fs.readdirSync(backupDir)
			.filter(file => file.endsWith('.json'))
			.sort()
			.reverse(); // Новые файлы сверху

		if (files.length === 0) {
			console.log('📁 No backup files found');
			return;
		}

		console.log('📁 Available backups:');
		files.forEach((file, index) => {
			const filePath = path.join(backupDir, file);
			const stats = fs.statSync(filePath);
			const size = (stats.size / 1024).toFixed(2);
			const date = stats.mtime.toLocaleString();
			console.log(`  ${index + 1}. ${file} (${size} KB, ${date})`);
		});

	} catch (error) {
		console.error('❌ Error listing backups:', error.message);
	}
};

const main = async () => {
	const args = process.argv.slice(2);
	const command = args[0];

	console.log('💾 Database backup utility\n');

	await connectDB();

	if (command === 'list') {
		await listBackups();
	} else {
		await createBackup();
		await listBackups();
	}

	console.log('\n✅ Backup operation completed!');

	process.exit(0);
};

main().catch(error => {
	console.error('❌ Backup failed:', error);
	process.exit(1);
});
