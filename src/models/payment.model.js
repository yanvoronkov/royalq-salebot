// src/models/payment.model.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
	userId: { type: String, ref: 'Referal', required: true, index: true }, // Ссылка на referal_id из коллекции referals, обязательное поле, индексированное
	paymentDate: { type: Date, default: Date.now },                    // Дата платежа, по умолчанию текущая дата и время
	amount: { type: Number, required: true },                           // Сумма платежа, обязательное поле
	currency: { type: String, default: 'USD' },                         // Валюта платежа, по умолчанию USD
	paymentMethod: { type: String },                                     // Метод платежа (например, card, paypal)
	status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' }, // Статус платежа, enum для ограничений, по умолчанию pending
	transactionId: { type: String, unique: true, sparse: true },        // ID транзакции, уникальный (если есть), sparse позволяет null/undefined значения
	subscriptionId: { type: String, sparse: true }                       // ID подписки (если есть), sparse позволяет null/undefined значения

	// Можно добавить другие поля, если потребуется
}, {
	timestamps: true // Автоматически добавляет поля createdAt и updatedAt
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;