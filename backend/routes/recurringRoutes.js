import express from 'express';
import { body } from 'express-validator';
import {
    getRecurringTransactions,
    createRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    toggleRecurringTransaction,
    processRecurringTransactions
} from '../controllers/recurringController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const recurringValidation = [
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('frequency').isIn(['daily', 'weekly', 'biweekly', 'monthly', 'yearly']).withMessage('Invalid frequency')
];

// All routes are protected
router.use(protect);

router.route('/')
    .get(getRecurringTransactions)
    .post(recurringValidation, createRecurringTransaction);

router.post('/process', processRecurringTransactions);

router.route('/:id')
    .put(recurringValidation, updateRecurringTransaction)
    .delete(deleteRecurringTransaction);

router.patch('/:id/toggle', toggleRecurringTransaction);

export default router;
