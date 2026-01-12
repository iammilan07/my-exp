import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

// @desc    Get all budgets for user with spending info
// @route   GET /api/budgets
// @access  Private
export const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user._id, isActive: true });

        // Get current period spending for each budget
        const budgetsWithSpending = await Promise.all(
            budgets.map(async (budget) => {
                const spending = await calculateBudgetSpending(req.user._id, budget);
                return {
                    ...budget.toObject(),
                    spent: spending,
                    remaining: Math.max(0, budget.amount - spending),
                    percentage: Math.min(100, (spending / budget.amount) * 100),
                    isOverBudget: spending > budget.amount,
                    isNearLimit: spending >= (budget.amount * budget.alertThreshold / 100)
                };
            })
        );

        res.json(budgetsWithSpending);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
export const createBudget = async (req, res) => {
    try {
        const { category, amount, period, alertThreshold } = req.body;

        // Check if budget for this category already exists
        const existingBudget = await Budget.findOne({
            user: req.user._id,
            category: category
        });

        if (existingBudget) {
            return res.status(400).json({ message: 'Budget for this category already exists' });
        }

        const budget = await Budget.create({
            user: req.user._id,
            category,
            amount,
            period: period || 'monthly',
            alertThreshold: alertThreshold || 80
        });

        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
export const updateBudget = async (req, res) => {
    try {
        const budget = await Budget.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        const { amount, period, alertThreshold, isActive } = req.body;

        if (amount !== undefined) budget.amount = amount;
        if (period !== undefined) budget.period = period;
        if (alertThreshold !== undefined) budget.alertThreshold = alertThreshold;
        if (isActive !== undefined) budget.isActive = isActive;

        const updatedBudget = await budget.save();
        res.json(updatedBudget);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        await budget.deleteOne();
        res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get budget alerts (over budget or near limit)
// @route   GET /api/budgets/alerts
// @access  Private
export const getBudgetAlerts = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user._id, isActive: true });

        const alerts = [];

        for (const budget of budgets) {
            const spending = await calculateBudgetSpending(req.user._id, budget);
            const percentage = (spending / budget.amount) * 100;

            if (spending > budget.amount) {
                alerts.push({
                    type: 'danger',
                    category: budget.category,
                    message: `You've exceeded your ${budget.category} budget by $${(spending - budget.amount).toFixed(2)}`,
                    spent: spending,
                    budget: budget.amount,
                    percentage
                });
            } else if (percentage >= budget.alertThreshold) {
                alerts.push({
                    type: 'warning',
                    category: budget.category,
                    message: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget`,
                    spent: spending,
                    budget: budget.amount,
                    percentage
                });
            }
        }

        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to calculate spending for a budget period
// Helper function to calculate spending for a budget period
async function calculateBudgetSpending(userId, budget) {
    const now = new Date();
    let startDate, endDate;

    if (budget.period === 'weekly') {
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
    } else {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    const matchQuery = {
        user: userId,
        type: 'expense',
        date: { $gte: startDate, $lte: endDate }
    };

    // Only filter by category if it's not 'All'
    if (budget.category !== 'All') {
        matchQuery.category = budget.category;
    }

    const result = await Transaction.aggregate([
        {
            $match: matchQuery
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ]);

    return result[0]?.total || 0;
}
