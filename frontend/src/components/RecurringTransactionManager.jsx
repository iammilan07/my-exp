import { useState, useEffect } from 'react';
import {
    Plus, RefreshCw, X, Edit2, Trash2, ToggleLeft, ToggleRight,
    Calendar, ArrowUpRight, ArrowDownRight, Clock, AlertCircle,
    CheckCircle2, Wallet, TrendingUp
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import api from '../utils/api';

const RecurringTransactionManager = () => {
    const [recurring, setRecurring] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [categories, setCategories] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [processSuccess, setProcessSuccess] = useState(false);
    const [formData, setFormData] = useState({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        frequency: 'monthly',
        startDate: format(new Date(), 'yyyy-MM-dd')
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [recurringRes, categoriesRes] = await Promise.all([
                api.get('/recurring'),
                api.get('/categories')
            ]);
            setRecurring(recurringRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Error fetching recurring transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate monthly equivalent for stats
    const calculateMonthlyEquivalent = (amount, frequency) => {
        const numAmount = parseFloat(amount);
        switch (frequency) {
            case 'daily': return numAmount * 30;
            case 'weekly': return numAmount * 4.33;
            case 'biweekly': return numAmount * 2.16;
            case 'monthly': return numAmount;
            case 'yearly': return numAmount / 12;
            default: return numAmount;
        }
    };

    const stats = recurring.reduce((acc, item) => {
        if (!item.isActive) return acc;
        const monthlyAmount = calculateMonthlyEquivalent(item.amount, item.frequency);
        if (item.type === 'income') {
            acc.income += monthlyAmount;
        } else {
            acc.expense += monthlyAmount;
        }

        // Check for due soon (within 7 days)
        const daysUntil = differenceInDays(new Date(item.nextDueDate), new Date());
        if (daysUntil <= 7 && daysUntil >= -1) acc.dueSoon++;

        return acc;
    }, { income: 0, expense: 0, dueSoon: 0 });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.category || !formData.amount) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount)
            };

            if (editItem) {
                await api.put(`/recurring/${editItem._id}`, payload);
            } else {
                await api.post('/recurring', payload);
            }
            setShowForm(false);
            setEditItem(null);
            resetForm();
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save recurring transaction');
        }
    };

    const resetForm = () => {
        setFormData({
            type: 'expense',
            category: '',
            amount: '',
            description: '',
            frequency: 'monthly',
            startDate: format(new Date(), 'yyyy-MM-dd')
        });
    };

    const handleEdit = (item) => {
        setEditItem(item);
        setFormData({
            type: item.type,
            category: item.category,
            amount: item.amount.toString(),
            description: item.description || '',
            frequency: item.frequency,
            startDate: format(new Date(item.startDate), 'yyyy-MM-dd')
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
            try {
                await api.delete(`/recurring/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting:', error);
            }
        }
    };

    const handleToggle = async (id) => {
        try {
            await api.patch(`/recurring/${id}/toggle`);
            fetchData();
        } catch (error) {
            console.error('Error toggling:', error);
        }
    };

    const handleProcessDue = async () => {
        setProcessing(true);
        try {
            const response = await api.post('/recurring/process');
            // Show success animation
            setProcessSuccess(true);
            setTimeout(() => {
                setProcessSuccess(false);
                fetchData();
                if (response.data.processed.length > 0) {
                    alert(response.data.message);
                }
            }, 1500);
        } catch (error) {
            console.error('Error processing:', error);
            alert('Failed to process recurring transactions');
        } finally {
            setProcessing(false);
        }
    };

    const getFrequencyLabel = (freq) => {
        const labels = {
            daily: 'Daily',
            weekly: 'Weekly',
            biweekly: 'Bi-Weekly',
            monthly: 'Monthly',
            yearly: 'Yearly'
        };
        return labels[freq] || freq;
    };

    const getDueStatus = (dueDate) => {
        const days = differenceInDays(new Date(dueDate), new Date());
        if (days < 0) return { label: 'Overdue', color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30' };
        if (days === 0) return { label: 'Due Today', color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30' };
        if (days <= 3) return { label: `Due in ${days}d`, color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' };
        return { label: format(new Date(dueDate), 'MMM dd'), color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800' };
    };

    const filteredCategories = categories.filter(cat => cat.type === formData.type);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />)}
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header with Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Monthly Income Stat */}
                <div className="glass p-6 rounded-2xl relative overflow-hidden group hover-lift">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <ArrowUpRight className="w-24 h-24 text-green-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Income</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${stats.income.toFixed(2)}
                        </h3>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Estimated recurring inflow
                        </p>
                    </div>
                </div>

                {/* Monthly Expense Stat */}
                <div className="glass p-6 rounded-2xl relative overflow-hidden group hover-lift">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <ArrowDownRight className="w-24 h-24 text-red-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Expenses</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${stats.expense.toFixed(2)}
                        </h3>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            Estimated recurring outflow
                        </p>
                    </div>
                </div>

                {/* Net Commitment */}
                <div className="glass p-6 rounded-2xl relative overflow-hidden group hover-lift">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Calendar className="w-24 h-24 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                <Clock className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Soon</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {stats.dueSoon}
                        </h3>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Payments due in 7 days
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
                        <RefreshCw className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Rules</h2>
                        <p className="text-sm text-gray-500">Manage your automated transactions</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleProcessDue}
                        disabled={processing || processSuccess}
                        className={`btn flex items-center gap-2 transition-all duration-300 ${processSuccess
                                ? 'bg-green-600 text-white dark:bg-green-500'
                                : 'btn-secondary'
                            }`}
                    >
                        {processSuccess ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 animate-bounce" />
                                <span className="animate-fade-in">Processed!</span>
                            </>
                        ) : (
                            <>
                                <Calendar className={`h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
                                {processing ? 'Processing...' : 'Process Due'}
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            setEditItem(null);
                            resetForm();
                            setShowForm(true);
                        }}
                        className="btn btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40"
                    >
                        <Plus className="h-4 w-4" />
                        Add New
                    </button>
                </div>
            </div>

            {/* List */}
            {recurring.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="bg-gray-50 dark:bg-gray-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <RefreshCw className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Recurring Transactions</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        Set up your first automated transaction to track subscriptions, bills, or salary.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {recurring.map((item, index) => {
                        const dueStatus = getDueStatus(item.nextDueDate);
                        return (
                            <div
                                key={item._id}
                                className={`glass p-5 rounded-xl border border-gray-100 dark:border-gray-700/50 group hover-lift animate-slide-up ${!item.isActive ? 'opacity-60 grayscale-[0.5]' : ''
                                    }`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    {/* Left Section: Icon & Info */}
                                    <div className="flex items-center gap-5 flex-1 min-w-0">
                                        <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${item.type === 'income'
                                                ? 'bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 text-green-600 dark:text-green-400'
                                                : 'bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/10 text-red-600 dark:text-red-400'
                                            }`}>
                                            <RefreshCw className="h-7 w-7" />
                                            {!item.isActive && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-400 rounded-full border-2 border-white dark:border-gray-800" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                                    {item.category}
                                                </h4>
                                                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${item.type === 'income'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                                                    }`}>
                                                    {getFrequencyLabel(item.frequency)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                {item.description && (
                                                    <span className="truncate max-w-[200px] border-r border-gray-200 dark:border-gray-700 pr-4 mr-2 hidden sm:block">
                                                        {item.description}
                                                    </span>
                                                )}
                                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${dueStatus.color}`}>
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span className="font-medium text-xs">{dueStatus.label}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section: Amount & Actions */}
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className={`text-xl font-black ${item.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-gray-400 font-medium">per {item.frequency}</div>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <button
                                                onClick={() => handleToggle(item._id)}
                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                title={item.isActive ? 'Pause' : 'Resume'}
                                            >
                                                {item.isActive ? (
                                                    <ToggleRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <ToggleLeft className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {editItem ? 'Edit Recurring' : 'New Recurring Rule'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">Set up automated transactions</p>
                            </div>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Type Toggle */}
                            <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                                    className={`py-2.5 rounded-lg text-sm font-bold transition-all ${formData.type === 'income'
                                            ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    Income
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                                    className={`py-2.5 rounded-lg text-sm font-bold transition-all ${formData.type === 'expense'
                                            ? 'bg-white dark:bg-gray-800 text-red-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    Expense
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="input bg-gray-50 dark:bg-gray-900/50"
                                    >
                                        <option value="">Select a category</option>
                                        {filteredCategories.map(cat => (
                                            <option key={cat._id} value={cat.name}>{cat.icon} {cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                className="input pl-8 bg-gray-50 dark:bg-gray-900/50 font-bold"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Frequency</label>
                                        <select
                                            value={formData.frequency}
                                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                            className="input bg-gray-50 dark:bg-gray-900/50"
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="biweekly">Bi-Weekly</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Start Date</label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="input bg-gray-50 dark:bg-gray-900/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Description</label>
                                        <input
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="input bg-gray-50 dark:bg-gray-900/50"
                                            placeholder="Optional note"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 btn btn-primary shadow-lg shadow-primary-500/20">
                                    {editItem ? 'Save Changes' : 'Create Rule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecurringTransactionManager;
