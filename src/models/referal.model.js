// src/models/referal.model.js
import mongoose from 'mongoose';

const referalSchema = new mongoose.Schema({
	referal_id: { type: String, required: true, unique: true, index: true },
	referer_id: { type: String, index: true },
	reg_date: { type: Date, default: Date.now },
	referal_nickname: { type: String },
	referer_nickname: { type: String },
	referal_name: { type: String },
	referral_link_url: { type: String },
	personal_channel_link: { type: String },
	utm: { type: String }
}, {
	timestamps: true
});

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