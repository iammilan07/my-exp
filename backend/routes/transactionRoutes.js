import express from 'express';
import { body } from 'express-validator';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
  getTransactionsByPeriod
} from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const transactionValidation = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('date').isISO8601().withMessage('Valid date is required')
];

// All routes are protected
router.use(protect);

router.route('/')
  .get(getTransactions)
  .post(transactionValidation, createTransaction);

router.get('/stats', getTransactionStats);
router.get('/period/:period', getTransactionsByPeriod);

router.route('/:id')
  .get(getTransaction)
  .put(transactionValidation, updateTransaction)
  .delete(deleteTransaction);

export default router;
