import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, Sparkles, Trash2, CalendarRange, Download, Target, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, subDays, subMonths } from 'date-fns';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import BudgetManager from '../components/BudgetManager';
import RecurringTransactionManager from '../components/RecurringTransactionManager';
import ExportModal from '../components/ExportModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    topCategories: []
  });
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [period, setPeriod] = useState('month');
  const [showForm, setShowForm] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [showCustomDateInputs, setShowCustomDateInputs] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (period !== 'custom') {
      fetchData();
    }
    setGreetingMessage();
  }, [period]);

  const setGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let transactionsData;

      if (period === 'custom') {
        // Fetch transactions for custom date range
        const response = await api.get('/transactions', {
          params: {
            startDate: customDateRange.startDate,
            endDate: customDateRange.endDate
          }
        });
        transactionsData = response.data.transactions || [];
        console.log('Custom range:', customDateRange);
        console.log('Custom range transactions:', transactionsData);
      } else {
        // Fetch transactions for predefined period
        const response = await api.get(`/transactions/period/${period}`);
        transactionsData = response.data.transactions || [];
        console.log(`${period} transactions:`, transactionsData);
      }

      // Calculate stats from filtered transactions
      const calculatedStats = calculateStats(transactionsData);
      console.log('Calculated stats:', calculatedStats);

      setStats(calculatedStats);
      setTransactions(transactionsData);

      // Prepare chart data
      prepareChartData(transactionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        topCategories: []
      };
    }

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};

    transactions.forEach(transaction => {
      const amount = Number(transaction.amount) || 0;
      if (transaction.type === 'income') {
        totalIncome += amount;
      } else if (transaction.type === 'expense') {
        totalExpense += amount;
        // Group expenses by category for pie chart
        if (transaction.category) {
          if (!categoryTotals[transaction.category]) {
            categoryTotals[transaction.category] = 0;
          }
          categoryTotals[transaction.category] += amount;
        }
      }
    });

    // Convert category totals to array format for pie chart
    const topCategories = Object.entries(categoryTotals).map(([category, total]) => ({
      _id: category,
      total: total
    })).sort((a, b) => b.total - a.total);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      topCategories
    };
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    if (newPeriod === 'custom') {
      setShowCustomDateInputs(true);
    } else {
      setShowCustomDateInputs(false);
    }
  };

  const handleCustomDateChange = (field, value) => {
    setCustomDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyCustomDateRange = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      fetchData();
    }
  };

  const prepareChartData = (transactions) => {
    const groupedData = {};

    transactions.forEach(transaction => {
      const date = format(new Date(transaction.date), 'MMM dd');

      if (!groupedData[date]) {
        groupedData[date] = { date, income: 0, expense: 0 };
      }

      if (transaction.type === 'income') {
        groupedData[date].income += transaction.amount;
      } else {
        groupedData[date].expense += transaction.amount;
      }
    });

    setChartData(Object.values(groupedData).reverse());
  };

  const handleTransactionAdded = () => {
    setShowForm(false);
    setEditTransaction(null);
    setRefreshTrigger(prev => prev + 1);
    fetchData();
  };

  const handleEdit = (transaction) => {
    setEditTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/transactions/${deleteConfirm}`);
      setDeleteConfirm(null);
      setRefreshTrigger(prev => prev + 1);
      fetchData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="font-semibold" style={{ color: entry.color }}>
              {entry.name}: ${entry.value?.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
              {greeting}, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg ml-11">Here's your financial overview</p>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Expenses</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage your spending</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Download className="h-5 w-5" />
              Export
            </button>
            <button
              onClick={() => {
                setEditTransaction(null);
                setShowForm(true);
              }}
              className="btn btn-primary flex items-center gap-2 transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: <DollarSign className="h-4 w-4" /> },
            { id: 'budgets', label: 'Budgets', icon: <Target className="h-4 w-4" /> },
            { id: 'recurring', label: 'Recurring', icon: <RefreshCw className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total Income</p>
                    <p className="text-3xl font-bold mt-2 animate-count">${stats.totalIncome.toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-bounce-slow">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Total Expenses</p>
                    <p className="text-3xl font-bold mt-2 animate-count">${stats.totalExpense.toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-bounce-slow">
                    <TrendingDown className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-100 text-sm font-medium">Balance</p>
                    <p className="text-3xl font-bold mt-2 animate-count">${stats.balance.toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-bounce-slow">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Period Selector */}
            <div className="mb-6 animate-slide-in">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div className="flex gap-2 flex-wrap">
                  {['day', 'week', 'month', 'custom'].map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePeriodChange(p)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${period === p
                        ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md border border-gray-200 dark:border-gray-700'
                        }`}
                    >
                      {p === 'custom' ? (
                        <span className="flex items-center gap-1">
                          <CalendarRange className="h-4 w-4" />
                          Custom Range
                        </span>
                      ) : (
                        p.charAt(0).toUpperCase() + p.slice(1)
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range Inputs */}
              {showCustomDateInputs && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700 animate-slide-down">
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customDateRange.startDate}
                        onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                        className="input"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customDateRange.endDate}
                        onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                        min={customDateRange.startDate}
                        className="input"
                      />
                    </div>
                    <button
                      onClick={applyCustomDateRange}
                      className="btn btn-primary px-6 whitespace-nowrap"
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Line Chart */}
              <div className="card hover:shadow-xl transition-all duration-300 animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <span className="w-1 h-6 bg-gradient-to-b from-primary-600 to-purple-600 rounded"></span>
                  Income vs Expenses
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                    <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div className="card hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <span className="w-1 h-6 bg-gradient-to-b from-green-600 to-blue-600 rounded"></span>
                  Expense by Category
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.topCategories}
                      dataKey="total"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={{ stroke: '#9ca3af' }}
                    >
                      {stats.topCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="card hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <span className="w-1 h-6 bg-gradient-to-b from-red-600 to-orange-600 rounded"></span>
                Recent Transactions
              </h3>
              <TransactionList
                transactions={transactions}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </>
        )}

        {/* Budgets Tab */}
        {activeTab === 'budgets' && (
          <BudgetManager refreshTrigger={refreshTrigger} />
        )}

        {/* Recurring Tab */}
        {activeTab === 'recurring' && (
          <RecurringTransactionManager />
        )}
      </div>

      {/* Export Modal */}
      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          transaction={editTransaction}
          onClose={() => {
            setShowForm(false);
            setEditTransaction(null);
          }}
          onSuccess={handleTransactionAdded}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Transaction</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this transaction?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
