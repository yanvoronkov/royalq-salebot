// src/routes/readonly.routes.js
import express from 'express';
import referalController from '../controllers/referal.controller.js';
import { apiAuth } from '../middleware/api-auth.js';
import { apiRateLimit } from '../middleware/rate-limiter.js';

const router = express.Router();

// API endpoints только для чтения - ЗАЩИЩЕНЫ
router.get('/api/readonly/referrals/tree', apiRateLimit, apiAuth, referalController.getAllReferralsTree);
router.get('/api/readonly/referrals/activity-stats', apiRateLimit, apiAuth, referalController.getActivityStats);
router.get('/api/readonly/referrals/:referalId/activity-stats', apiRateLimit, apiAuth, referalController.getUserActivityStats);
router.get('/api/readonly/referrals/:referalId/tree', apiRateLimit, apiAuth, referalController.getUserReferralsTree);

// Веб-интерфейс только для чтения - ЗАЩИЩЕН
router.get('/readonly', apiRateLimit, apiAuth, referalController.getReferralNetwork);

export default router;
