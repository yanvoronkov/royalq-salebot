// src/routes/referal.routes.js
import express from 'express';
import referalController from '../controllers/referal.controller.js';
import { apiAuth, apiAuthWrite } from '../middleware/api-auth.js';
import { apiRateLimit, webRateLimit } from '../middleware/rate-limiter.js';

const router = express.Router();

// Корневой маршрут - перенаправление на новый интерфейс реферальной сети
router.get('/', (req, res) => {
	res.redirect('/network');
});

// API endpoints для рефералов (CRUD операции) - ЗАЩИЩЕНЫ
router.post('/api/referals', apiRateLimit, apiAuthWrite, referalController.createReferal);       // POST /api/referals - Создать реферала (строгая проверка на дублирование)
router.post('/api/referals/upsert', apiRateLimit, apiAuthWrite, referalController.createOrUpdateReferal); // POST /api/referals/upsert - Создать или обновить реферала (безопасно)
router.get('/api/referals/:referalId', apiRateLimit, apiAuth, referalController.getReferalById); // GET /api/referals/:referalId - Получить реферала по ID (сейчас рендерит шаблон для теста)
router.put('/api/referals/:referalId', apiRateLimit, apiAuthWrite, referalController.updateReferal);    // PUT /api/referals/:referalId - Обновить реферала по ID
router.delete('/api/referals/:referalId', apiRateLimit, apiAuthWrite, referalController.deleteReferal); // DELETE /api/referals/:referalId - Удалить реферала по ID

// Веб-интерфейс: новый интерфейс реферальной сети
router.get('/network', referalController.getReferralNetwork); // GET /network - Отобразить новый интерфейс реферальной сети
router.get('/network/:referalId', referalController.getUserReferralNetwork); // GET /network/:referalId - Отобразить рефералов конкретного пользователя


// API: получить дерево всех рефералов для нового интерфейса - ЗАЩИЩЕН
router.get('/api/referrals/tree', apiRateLimit, apiAuth, referalController.getAllReferralsTree); // GET /api/referrals/tree - Получить дерево всех рефералов

// API: получить статистику активности рефералов - ЗАЩИЩЕН
router.get('/api/referrals/activity-stats', apiRateLimit, apiAuth, referalController.getActivityStats); // GET /api/referrals/activity-stats - Получить статистику активности
router.get('/api/referrals/:referalId/activity-stats', apiRateLimit, apiAuth, referalController.getUserActivityStats); // GET /api/referrals/:referalId/activity-stats - Получить статистику активности конкретного пользователя

// API: получить дерево рефералов для конкретного пользователя - ЗАЩИЩЕН
router.get('/api/referrals/:referalId/tree', apiRateLimit, apiAuth, referalController.getUserReferralsTree); // GET /api/referrals/:referalId/tree - Получить дерево рефералов конкретного пользователя

// API: поиск рефералов (заглушка) - ЗАЩИЩЕН
router.get('/api/referals/search', apiRateLimit, apiAuth, (req, res) => {
	res.json({ message: 'Referal search API endpoint - To be implemented' });
});

// API: фильтрация рефералов (заглушка) - ЗАЩИЩЕН
router.get('/api/referals/filter', apiRateLimit, apiAuth, (req, res) => {
	res.json({ message: 'Referal filter API endpoint - To be implemented' });
});

export default router;