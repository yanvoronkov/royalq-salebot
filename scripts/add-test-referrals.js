// Скрипт для добавления тестовых рефералов
import mongoose from 'mongoose';
import Referal from '../src/models/referal.model.js';
import { config } from 'dotenv';

// Загружаем переменные окружения
config();

async function addTestReferrals() {
	try {
		// Подключаемся к базе данных
		await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/royalq-salebot');
		console.log('Подключено к MongoDB');

		// Очищаем существующие данные
		await Referal.deleteMany({});
		console.log('Очищены существующие данные');

		// Создаем тестовые данные
		const testReferrals = [
			// Корневые пользователи
			{
				referal_id: 'root001',
				referer_id: null,
				reg_date: new Date('2025-01-01'),
				referal_nickname: 'root_user',
				referer_nickname: null,
				referal_name: 'Root User',
				referral_link_url: 'https://example.com/ref/root001',
				personal_channel_link: 'https://t.me/root_channel',
				utm: 'source=direct&campaign=main'
			},
			{
				referal_id: 'root002',
				referer_id: null,
				reg_date: new Date('2025-01-02'),
				referal_nickname: 'admin_user',
				referer_nickname: null,
				referal_name: 'Admin User',
				referral_link_url: 'https://example.com/ref/root002',
				personal_channel_link: 'https://t.me/admin_channel',
				utm: 'source=direct&campaign=main'
			},
			// Пользователи первого уровня
			{
				referal_id: 'user001',
				referer_id: 'root001',
				reg_date: new Date('2025-01-10'),
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
				reg_date: new Date('2025-01-11'),
				referal_nickname: 'jane_smith',
				referer_nickname: 'root_user',
				referal_name: 'Jane Smith',
				referral_link_url: 'https://example.com/ref/user002',
				personal_channel_link: 'https://t.me/jane_smith_channel',
				utm: 'source=facebook&campaign=social'
			},
			{
				referal_id: 'user003',
				referer_id: 'root002',
				reg_date: new Date('2025-01-12'),
				referal_nickname: 'bob_wilson',
				referer_nickname: 'admin_user',
				referal_name: 'Bob Wilson',
				referral_link_url: 'https://example.com/ref/user003',
				personal_channel_link: 'https://t.me/bob_wilson_channel',
				utm: 'source=instagram&campaign=social'
			},
			// Пользователи второго уровня
			{
				referal_id: 'user004',
				referer_id: 'user001',
				reg_date: new Date('2025-01-20'),
				referal_nickname: 'alice_brown',
				referer_nickname: 'john_doe',
				referal_name: 'Alice Brown',
				referral_link_url: 'https://example.com/ref/user004',
				personal_channel_link: 'https://t.me/alice_brown_channel',
				utm: 'source=telegram&campaign=referral'
			},
			{
				referal_id: 'user005',
				referer_id: 'user001',
				reg_date: new Date('2025-01-21'),
				referal_nickname: 'charlie_davis',
				referer_nickname: 'john_doe',
				referal_name: 'Charlie Davis',
				referral_link_url: 'https://example.com/ref/user005',
				personal_channel_link: 'https://t.me/charlie_davis_channel',
				utm: 'source=telegram&campaign=referral'
			},
			{
				referal_id: 'user006',
				referer_id: 'user002',
				reg_date: new Date('2025-01-22'),
				referal_nickname: 'diana_prince',
				referer_nickname: 'jane_smith',
				referal_name: 'Diana Prince',
				referral_link_url: 'https://example.com/ref/user006',
				personal_channel_link: 'https://t.me/diana_prince_channel',
				utm: 'source=facebook&campaign=social'
			},
			// Пользователи третьего уровня
			{
				referal_id: 'user007',
				referer_id: 'user004',
				reg_date: new Date('2025-01-30'),
				referal_nickname: 'eve_adams',
				referer_nickname: 'alice_brown',
				referal_name: 'Eve Adams',
				referral_link_url: 'https://example.com/ref/user007',
				personal_channel_link: 'https://t.me/eve_adams_channel',
				utm: 'source=telegram&campaign=referral'
			},
			{
				referal_id: 'user008',
				referer_id: 'user005',
				reg_date: new Date('2025-01-31'),
				referal_nickname: 'frank_miller',
				referer_nickname: 'charlie_davis',
				referal_name: 'Frank Miller',
				referral_link_url: 'https://example.com/ref/user008',
				personal_channel_link: 'https://t.me/frank_miller_channel',
				utm: 'source=telegram&campaign=referral'
			},
			{
				referal_id: 'user009',
				referer_id: 'user006',
				reg_date: new Date('2025-02-01'),
				referal_nickname: 'grace_hopper',
				referer_nickname: 'diana_prince',
				referal_name: 'Grace Hopper',
				referral_link_url: 'https://example.com/ref/user009',
				personal_channel_link: 'https://t.me/grace_hopper_channel',
				utm: 'source=facebook&campaign=social'
			},
			// Пользователи четвертого уровня
			{
				referal_id: 'user010',
				referer_id: 'user007',
				reg_date: new Date('2025-02-10'),
				referal_nickname: 'henry_ford',
				referer_nickname: 'eve_adams',
				referal_name: 'Henry Ford',
				referral_link_url: 'https://example.com/ref/user010',
				personal_channel_link: 'https://t.me/henry_ford_channel',
				utm: 'source=telegram&campaign=referral'
			},
			{
				referal_id: 'user011',
				referer_id: 'user008',
				reg_date: new Date('2025-02-11'),
				referal_nickname: 'iris_west',
				referer_nickname: 'frank_miller',
				referal_name: 'Iris West',
				referral_link_url: 'https://example.com/ref/user011',
				personal_channel_link: 'https://t.me/iris_west_channel',
				utm: 'source=telegram&campaign=referral'
			}
		];

		// Добавляем данные в базу
		await Referal.insertMany(testReferrals);
		console.log(`Добавлено ${testReferrals.length} тестовых рефералов`);

		// Выводим статистику
		const totalReferrals = await Referal.countDocuments();
		const rootReferrals = await Referal.countDocuments({ referer_id: null });
		const level1Referrals = await Referal.countDocuments({ referer_id: { $in: ['root001', 'root002'] } });
		const level2Referrals = await Referal.countDocuments({ referer_id: { $in: ['user001', 'user002', 'user003'] } });
		const level3Referrals = await Referal.countDocuments({ referer_id: { $in: ['user004', 'user005', 'user006'] } });
		const level4Referrals = await Referal.countDocuments({ referer_id: { $in: ['user007', 'user008', 'user009'] } });

		console.log('\nСтатистика:');
		console.log(`Всего рефералов: ${totalReferrals}`);
		console.log(`Корневых пользователей: ${rootReferrals}`);
		console.log(`Пользователей 1-го уровня: ${level1Referrals}`);
		console.log(`Пользователей 2-го уровня: ${level2Referrals}`);
		console.log(`Пользователей 3-го уровня: ${level3Referrals}`);
		console.log(`Пользователей 4-го уровня: ${level4Referrals}`);

	} catch (error) {
		console.error('Ошибка при добавлении тестовых данных:', error);
	} finally {
		// Закрываем соединение
		await mongoose.disconnect();
		console.log('Соединение с MongoDB закрыто');
	}
}

// Запускаем скрипт
addTestReferrals();
