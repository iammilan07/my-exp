import express from 'express';
import { exportToCSV, getExportReport } from '../controllers/exportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/csv', exportToCSV);
router.get('/report', getExportReport);

export default router;
