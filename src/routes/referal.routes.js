// src/routes/referal.routes.js
import express from 'express';
import referalController from '../controllers/referal.controller.js';

const router = express.Router();

// API endpoints для рефералов (CRUD операции)
router.post('/api/referals', referalController.createReferal);       // POST /api/referals - Создать реферала
router.get('/api/referals/:referalId', referalController.getReferalById); // GET /api/referals/:referalId - Получить реферала по ID (сейчас рендерит шаблон для теста)
router.put('/api/referals/:referalId', referalController.updateReferal);    // PUT /api/referals/:referalId - Обновить реферала по ID
router.delete('/api/referals/:referalId', referalController.deleteReferal); // DELETE /api/referals/:referalId - Удалить реферала по ID

// Веб-интерфейс: дашборд для реферала
router.get('/dashboard/:refererId', referalController.getReferalDashboard); // GET /dashboard/:refererId - Отобразить дашборд реферала

// API: получить дерево рефералов (заглушка, пока не реализуем)
router.get('/api/referals/:refererId/tree', (req, res) => {
	res.json({ message: 'Referal tree API endpoint - To be implemented' });
});

// API: поиск рефералов (заглушка)
router.get('/api/referals/search', (req, res) => {
	res.json({ message: 'Referal search API endpoint - To be implemented' });
});

// API: фильтрация рефералов (заглушка)
router.get('/api/referals/filter', (req, res) => {
	res.json({ message: 'Referal filter API endpoint - To be implemented' });
});

export default router;