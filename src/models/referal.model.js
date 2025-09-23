// src/models/referal.model.js
import mongoose from 'mongoose';

const referalSchema = new mongoose.Schema({
	referal_id: { type: String, required: true, unique: true, index: true },
	referer_id: { type: String, index: true },
	reg_date: { type: Date, default: Date.now, index: true },
	referal_nickname: { type: String },
	referer_nickname: { type: String },
	referal_name: { type: String },
	channel_activity: { type: String, default: 'Неактивен' }, // Активность в канале
	referral_link_url: { type: String },
	personal_channel_link: { type: String },
	utm: { type: String }
}, {
	timestamps: true
});

// Составные индексы для оптимизации запросов с сортировкой
referalSchema.index({ referer_id: 1, reg_date: 1 }); // Для поиска детей с сортировкой
referalSchema.index({ referer_id: 1, referal_id: 1 }); // Для быстрого поиска по родителю и ребенку
referalSchema.index({ reg_date: 1, referer_id: 1 }); // Для сортировки по дате с фильтром по родителю

// Middleware для удаления связанных платежей перед удалением реферала
referalSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
	try {
		// this - это удаляемый документ Referal
		await mongoose.model('Payment').deleteMany({ userId: this.referal_id }); // Удаляем все платежи с userId, соответствующим referal_id удаляемого реферала
		console.log(`Successfully deleted payments for referal_id: ${this.referal_id}`);
		next(); // Переходим к удалению реферала
	} catch (error) {
		console.error("Error deleting payments:", error);
		next(error); // Передаем ошибку дальше
	}
});

const Referal = mongoose.model('Referal', referalSchema);

export default Referal;