import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, Sparkles, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, subDays, subMonths } from 'date-fns';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';

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

  useEffect(() => {
    fetchData();
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
      const [statsRes, transactionsRes] = await Promise.all([
        api.get('/transactions/stats'),
        api.get(`/transactions/period/${period}`)
      ]);

      setStats(statsRes.data);
      setTransactions(transactionsRes.data.transactions);
      
      // Prepare chart data
      prepareChartData(transactionsRes.data.transactions);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
      fetchData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-purple-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary-600 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              {greeting}, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
          </div>
          <p className="text-gray-600 text-lg ml-11">Here's your financial overview</p>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600 mt-1">Track your financial journey</p>
          </div>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-slide-up" style={{animationDelay: '0.1s'}}>
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

          <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-slide-up" style={{animationDelay: '0.2s'}}>
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

          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-slide-up" style={{animationDelay: '0.3s'}}>
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
        <div className="flex items-center gap-2 mb-6 animate-slide-in">
          <Calendar className="h-5 w-5 text-gray-500" />
          <div className="flex gap-2">
            {['day', 'week', 'month'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  period === p
                    ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart */}
          <div className="card hover:shadow-xl transition-all duration-300 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-primary-600 to-purple-600 rounded"></span>
              Income vs Expenses
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="card hover:shadow-xl transition-all duration-300 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
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
                  label
                >
                  {stats.topCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card hover:shadow-xl transition-all duration-300 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-red-600 to-orange-600 rounded"></span>
            Recent Transactions
          </h3>
          <TransactionList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

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
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Transaction</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this transaction?</p>
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
