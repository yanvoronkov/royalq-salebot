// src/routes/referal.routes.js
import express from 'express';
import referalController from '../controllers/referal.controller.js';

const router = express.Router();

// Корневой маршрут - перенаправление на новый интерфейс реферальной сети
router.get('/', (req, res) => {
	res.redirect('/network');
});

// API endpoints для рефералов (CRUD операции)
router.post('/api/referals', referalController.createReferal);       // POST /api/referals - Создать реферала
router.get('/api/referals/:referalId', referalController.getReferalById); // GET /api/referals/:referalId - Получить реферала по ID (сейчас рендерит шаблон для теста)
router.put('/api/referals/:referalId', referalController.updateReferal);    // PUT /api/referals/:referalId - Обновить реферала по ID
router.delete('/api/referals/:referalId', referalController.deleteReferal); // DELETE /api/referals/:referalId - Удалить реферала по ID

// Веб-интерфейс: новый интерфейс реферальной сети
router.get('/network', referalController.getReferralNetwork); // GET /network - Отобразить новый интерфейс реферальной сети
router.get('/network/:referalId', referalController.getUserReferralNetwork); // GET /network/:referalId - Отобразить рефералов конкретного пользователя

// Веб-интерфейс: дашборд для реферала (старые маршруты для совместимости)
router.get('/dashboard/:refererId', referalController.getReferalDashboard); // GET /dashboard/:refererId - Отобразить дашборд реферала (дерево)
router.get('/table/:refererId', referalController.getReferalTable); // GET /table/:refererId - Отобразить табличный вид реферала
router.get('/modern/:refererId', referalController.getModernReferralDashboard); // GET /modern/:refererId - Отобразить современный дашборд реферала
router.get('/modern-table/:refererId', referalController.getModernReferralTable); // GET /modern-table/:refererId - Отобразить современную таблицу реферала

// API: получить дерево всех рефералов для нового интерфейса
router.get('/api/referrals/tree', referalController.getAllReferralsTree); // GET /api/referrals/tree - Получить дерево всех рефералов

// API: получить статистику активности рефералов
router.get('/api/referrals/activity-stats', referalController.getActivityStats); // GET /api/referrals/activity-stats - Получить статистику активности
router.get('/api/referrals/:referalId/activity-stats', referalController.getUserActivityStats); // GET /api/referrals/:referalId/activity-stats - Получить статистику активности конкретного пользователя

// API: получить дерево рефералов для конкретного пользователя
router.get('/api/referrals/:referalId/tree', referalController.getUserReferralsTree); // GET /api/referrals/:referalId/tree - Получить дерево рефералов конкретного пользователя

// API: поиск рефералов (заглушка)
router.get('/api/referals/search', (req, res) => {
	res.json({ message: 'Referal search API endpoint - To be implemented' });
});

// API: фильтрация рефералов (заглушка)
router.get('/api/referals/filter', (req, res) => {
	res.json({ message: 'Referal filter API endpoint - To be implemented' });
});

export default router;