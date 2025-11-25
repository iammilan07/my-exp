import Category from '../models/Category.js';

// Default categories
const defaultCategories = [
  // Expense categories
  { name: 'Food & Dining', type: 'expense', icon: '🍔', color: '#ef4444' },
  { name: 'Transportation', type: 'expense', icon: '🚗', color: '#f59e0b' },
  { name: 'Shopping', type: 'expense', icon: '🛍️', color: '#ec4899' },
  { name: 'Entertainment', type: 'expense', icon: '🎬', color: '#8b5cf6' },
  { name: 'Healthcare', type: 'expense', icon: '⚕️', color: '#10b981' },
  { name: 'Bills & Utilities', type: 'expense', icon: '📱', color: '#06b6d4' },
  { name: 'Education', type: 'expense', icon: '📚', color: '#3b82f6' },
  { name: 'Travel', type: 'expense', icon: '✈️', color: '#6366f1' },
  { name: 'Housing', type: 'expense', icon: '🏠', color: '#14b8a6' },
  { name: 'Personal Care', type: 'expense', icon: '💄', color: '#f97316' },
  { name: 'Fitness', type: 'expense', icon: '💪', color: '#84cc16' },
  { name: 'Gifts', type: 'expense', icon: '🎁', color: '#a855f7' },
  { name: 'Other', type: 'expense', icon: '📌', color: '#64748b' },
  
  // Income categories
  { name: 'Salary', type: 'income', icon: '💰', color: '#22c55e' },
  { name: 'Freelance', type: 'income', icon: '💼', color: '#3b82f6' },
  { name: 'Business', type: 'income', icon: '🏢', color: '#8b5cf6' },
  { name: 'Investments', type: 'income', icon: '📈', color: '#06b6d4' },
  { name: 'Rental', type: 'income', icon: '🏘️', color: '#10b981' },
  { name: 'Gift', type: 'income', icon: '🎁', color: '#f59e0b' },
  { name: 'Other', type: 'income', icon: '💵', color: '#64748b' }
];

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
export const getCategories = async (req, res) => {
  try {
    let categories = await Category.find();
    
    // If no categories exist, create default ones
    if (categories.length === 0) {
      categories = await Category.insertMany(
        defaultCategories.map(cat => ({ ...cat, isDefault: true }))
      );
    }

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
