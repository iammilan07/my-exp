import { useState, useEffect } from 'react';
import { Plus, Target, AlertTriangle, CheckCircle, X, Edit2, Trash2 } from 'lucide-react';
import api from '../utils/api';

const BudgetManager = ({ refreshTrigger }) => {
    const [budgets, setBudgets] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editBudget, setEditBudget] = useState(null);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        period: 'monthly',
        alertThreshold: 80
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, [refreshTrigger]);

    const fetchData = async () => {
        try {
            const [budgetsRes, alertsRes, categoriesRes] = await Promise.all([
                api.get('/budgets'),
                api.get('/budgets/alerts'),
                api.get('/categories')
            ]);
            setBudgets(budgetsRes.data);
            setAlerts(alertsRes.data);
            setCategories(categoriesRes.data.filter(c => c.type === 'expense'));
        } catch (error) {
            console.error('Error fetching budgets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.category || !formData.amount) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            if (editBudget) {
                await api.put(`/budgets/${editBudget._id}`, {
                    amount: parseFloat(formData.amount),
                    period: formData.period,
                    alertThreshold: parseInt(formData.alertThreshold)
                });
            } else {
                await api.post('/budgets', {
                    ...formData,
                    amount: parseFloat(formData.amount),
                    alertThreshold: parseInt(formData.alertThreshold)
                });
            }
            setShowForm(false);
            setEditBudget(null);
            setFormData({ category: '', amount: '', period: 'monthly', alertThreshold: 80 });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save budget');
        }
    };

    const handleEdit = (budget) => {
        setEditBudget(budget);
        setFormData({
            category: budget.category,
            amount: budget.amount.toString(),
            period: budget.period,
            alertThreshold: budget.alertThreshold
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
            try {
                await api.delete(`/budgets/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting budget:', error);
            }
        }
    };

    const getProgressColor = (percentage, isOverBudget, isNearLimit) => {
        if (isOverBudget) return 'bg-red-500';
        if (isNearLimit) return 'bg-yellow-500';
        if (percentage > 50) return 'bg-primary-500';
        return 'bg-green-500';
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Budget Goals</h2>
                </div>
                <button
                    onClick={() => {
                        setEditBudget(null);
                        setFormData({ category: '', amount: '', period: 'monthly', alertThreshold: 80 });
                        setShowForm(true);
                    }}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Budget
                </button>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="space-y-2">
                    {alerts.map((alert, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg flex items-center gap-3 animate-slide-up ${alert.type === 'danger'
                                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                                }`}
                        >
                            <AlertTriangle className={`h-5 w-5 ${alert.type === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                                }`} />
                            <span className={`text-sm ${alert.type === 'danger' ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'
                                }`}>
                                {alert.message}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Budget List */}
            {budgets.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No budgets set yet</p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Create a budget to track your spending goals</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {budgets.map((budget) => (
                        <div
                            key={budget._id}
                            className="card hover:shadow-lg transition-all duration-200 group"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900 dark:text-white">{budget.category}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                        {budget.period}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(budget)}
                                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(budget._id)}
                                        className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-baseline justify-between mb-2">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    ${budget.spent?.toFixed(2) || '0.00'}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                    of ${budget.amount.toFixed(2)}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="progress-bar mb-2">
                                <div
                                    className={`progress-bar-fill ${getProgressColor(budget.percentage, budget.isOverBudget, budget.isNearLimit)}`}
                                    style={{ width: `${Math.min(100, budget.percentage || 0)}%` }}
                                ></div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className={`font-medium ${budget.isOverBudget
                                    ? 'text-red-600 dark:text-red-400'
                                    : budget.isNearLimit
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-green-600 dark:text-green-400'
                                    }`}>
                                    {budget.isOverBudget ? (
                                        <>Over by ${(budget.spent - budget.amount).toFixed(2)}</>
                                    ) : (
                                        <>${budget.remaining?.toFixed(2)} remaining</>
                                    )}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                    {budget.percentage?.toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Budget Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editBudget ? 'Edit Budget' : 'Create Budget'}
                            </h3>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Category
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="input"
                                    disabled={!!editBudget}
                                >
                                    <option value="">Select a category</option>
                                    <option value="All">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat.name}>
                                            {cat.icon} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Budget Amount
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="input pl-8"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Period
                                </label>
                                <select
                                    value={formData.period}
                                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                    className="input"
                                >
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Alert Threshold (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.alertThreshold}
                                    onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                                    className="input"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Get alerted when spending reaches this percentage
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 btn btn-primary">
                                    {editBudget ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetManager;
