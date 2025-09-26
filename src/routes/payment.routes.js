// src/routes/payment.routes.js
import express from 'express';
import paymentController from '../controllers/payment.controller.js';
import { apiAuth, apiAuthWrite } from '../middleware/api-auth.js';
import { apiRateLimit, webRateLimit } from '../middleware/rate-limiter.js';

const router = express.Router();

// Тестовый маршрут (оставьте вверху)
router.get('/payments/test', (req, res) => {
	res.send('Payments routes are working!');
});

// API endpoints для платежей - ЗАЩИЩЕНЫ
router.post('/api/payments', apiRateLimit, apiAuthWrite, paymentController.createPayment);              // POST /api/payments - Создать платеж
router.get('/api/payments/user/:userId', apiRateLimit, apiAuth, paymentController.getPaymentsByUserId); // GET /api/payments/user/:userId - Получить платежи пользователя по userId


export default router;