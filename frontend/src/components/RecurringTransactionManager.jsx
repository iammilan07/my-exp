import { useState, useEffect } from 'react';
import { Plus, RefreshCw, X, Edit2, Trash2, ToggleLeft, ToggleRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import api from '../utils/api';

const RecurringTransactionManager = () => {
    const [recurring, setRecurring] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [categories, setCategories] = useState([]);
    const [processing, setProcessing] = useState(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.category || !formData.amount) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            if (editItem) {
                await api.put(`/recurring/${editItem._id}`, {
                    ...formData,
                    amount: parseFloat(formData.amount)
                });
            } else {
                await api.post('/recurring', {
                    ...formData,
                    amount: parseFloat(formData.amount)
                });
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
            alert(response.data.message);
            fetchData();
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

    const filteredCategories = categories.filter(cat => cat.type === formData.type);

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <RefreshCw className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recurring Transactions</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleProcessDue}
                        disabled={processing}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <Calendar className="h-4 w-4" />
                        {processing ? 'Processing...' : 'Process Due'}
                    </button>
                    <button
                        onClick={() => {
                            setEditItem(null);
                            resetForm();
                            setShowForm(true);
                        }}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Recurring
                    </button>
                </div>
            </div>

            {/* List */}
            {recurring.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No recurring transactions</p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Set up automatic transactions for bills, subscriptions, or income</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {recurring.map((item) => (
                        <div
                            key={item._id}
                            className={`card flex items-center justify-between gap-4 group transition-all duration-200 ${!item.isActive ? 'opacity-60' : ''
                                }`}
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'income'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                    }`}>
                                    <RefreshCw className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-gray-900 dark:text-white">{item.category}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.type === 'income'
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                            }`}>
                                            {item.type}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                            {getFrequencyLabel(item.frequency)}
                                        </span>
                                        {!item.isActive && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                                                Paused
                                            </span>
                                        )}
                                    </div>
                                    {item.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{item.description}</p>
                                    )}
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        Next: {format(new Date(item.nextDueDate), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`text-xl font-bold ${item.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                                </span>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleToggle(item._id)}
                                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
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
                                        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editItem ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
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

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                                        className={`py-2 rounded-lg font-medium transition-all ${formData.type === 'income'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        Income
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                                        className={`py-2 rounded-lg font-medium transition-all ${formData.type === 'expense'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        Expense
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="input"
                                >
                                    <option value="">Select a category</option>
                                    {filteredCategories.map(cat => (
                                        <option key={cat._id} value={cat.name}>{cat.icon} {cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
                                <select
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                    className="input"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="biweekly">Bi-Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="input"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input"
                                    placeholder="e.g., Netflix subscription"
                                />
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
                                    {editItem ? 'Update' : 'Create'}
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
