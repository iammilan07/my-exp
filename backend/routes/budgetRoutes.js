import express from 'express';
import { body } from 'express-validator';
import {
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudgetAlerts
} from '../controllers/budgetController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const budgetValidation = [
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0')
];

// All routes are protected
router.use(protect);

router.route('/')
    .get(getBudgets)
    .post(budgetValidation, createBudget);

router.get('/alerts', getBudgetAlerts);

router.route('/:id')
    .put(updateBudget)
    .delete(deleteBudget);

export default router;
