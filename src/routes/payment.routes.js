// src/routes/payment.routes.js
import express from 'express';
import paymentController from '../controllers/payment.controller.js';

const router = express.Router();

// Тестовый маршрут (оставьте вверху)
router.get('/payments/test', (req, res) => {
	res.send('Payments routes are working!');
});

// API endpoints для платежей
router.post('/api/payments', paymentController.createPayment);              // POST /api/payments - Создать платеж
router.get('/api/payments/user/:userId', paymentController.getPaymentsByUserId); // GET /api/payments/user/:userId - Получить платежи пользователя по userId


export default router;