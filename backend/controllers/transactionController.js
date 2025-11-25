import { validationResult } from 'express-validator';
import Transaction from '../models/Transaction.js';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';

// @desc    Get all transactions for user
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    const query = { user: req.user._id };
    
    if (type) query.type = type;
    if (category) query.category = category;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Transaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
export const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (transaction) {
      res.json(transaction);
    } else {
      res.status(404).json({ message: 'Transaction not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, category, amount, description, date } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      category,
      amount,
      description,
      date: date || new Date()
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (transaction) {
      transaction.type = req.body.type || transaction.type;
      transaction.category = req.body.category || transaction.category;
      transaction.amount = req.body.amount || transaction.amount;
      transaction.description = req.body.description || transaction.description;
      transaction.date = req.body.date || transaction.date;

      const updatedTransaction = await transaction.save();
      res.json(updatedTransaction);
    } else {
      res.status(404).json({ message: 'Transaction not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (transaction) {
      await transaction.deleteOne();
      res.json({ message: 'Transaction deleted successfully' });
    } else {
      res.status(404).json({ message: 'Transaction not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
export const getTransactionStats = async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Transaction.aggregate([
      { $match: { user: req.user._id, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    const result = {
      totalIncome: 0,
      totalExpense: 0,
      incomeCount: 0,
      expenseCount: 0,
      topCategories: categoryStats
    };

    stats.forEach(stat => {
      if (stat._id === 'income') {
        result.totalIncome = stat.total;
        result.incomeCount = stat.count;
      } else if (stat._id === 'expense') {
        result.totalExpense = stat.total;
        result.expenseCount = stat.count;
      }
    });

    result.balance = result.totalIncome - result.totalExpense;

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get transactions by period (day/week/month)
// @route   GET /api/transactions/period/:period
// @access  Private
export const getTransactionsByPeriod = async (req, res) => {
  try {
    const { period } = req.params;
    const { date } = req.query;
    const baseDate = date ? new Date(date) : new Date();

    let startDate, endDate;

    switch (period) {
      case 'day':
        startDate = startOfDay(baseDate);
        endDate = endOfDay(baseDate);
        break;
      case 'week':
        startDate = startOfWeek(baseDate);
        endDate = endOfWeek(baseDate);
        break;
      case 'month':
        startDate = startOfMonth(baseDate);
        endDate = endOfMonth(baseDate);
        break;
      default:
        return res.status(400).json({ message: 'Invalid period. Use day, week, or month' });
    }

    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    const stats = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const result = {
      period,
      startDate,
      endDate,
      transactions,
      totalIncome: 0,
      totalExpense: 0
    };

    stats.forEach(stat => {
      if (stat._id === 'income') {
        result.totalIncome = stat.total;
      } else if (stat._id === 'expense') {
        result.totalExpense = stat.total;
      }
    });

    result.balance = result.totalIncome - result.totalExpense;

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
