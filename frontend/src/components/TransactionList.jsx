import { useState } from 'react';
import { Edit2, Trash2, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { format } from 'date-fns';

// Category color mapping
const getCategoryClass = (category) => {
  const categoryLower = category?.toLowerCase() || '';
  if (categoryLower.includes('food') || categoryLower.includes('dining') || categoryLower.includes('restaurant')) return 'category-food';
  if (categoryLower.includes('transport') || categoryLower.includes('uber') || categoryLower.includes('gas')) return 'category-transport';
  if (categoryLower.includes('shop') || categoryLower.includes('retail') || categoryLower.includes('amazon')) return 'category-shopping';
  if (categoryLower.includes('entertain') || categoryLower.includes('movie') || categoryLower.includes('game')) return 'category-entertainment';
  if (categoryLower.includes('bill') || categoryLower.includes('utility') || categoryLower.includes('rent')) return 'category-bills';
  if (categoryLower.includes('health') || categoryLower.includes('medical') || categoryLower.includes('doctor')) return 'category-health';
  if (categoryLower.includes('salary') || categoryLower.includes('wage') || categoryLower.includes('paycheck')) return 'category-salary';
  if (categoryLower.includes('invest') || categoryLower.includes('dividend') || categoryLower.includes('stock')) return 'category-investment';
  return 'category-other';
};

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(transaction => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.category.toLowerCase().includes(searchLower) ||
      transaction.description?.toLowerCase().includes(searchLower) ||
      transaction.amount.toString().includes(searchLower)
    );
  });

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">No transactions found for this period</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Add your first transaction to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No transactions match your search</p>
          </div>
        ) : (
          filteredTransactions.map((transaction, index) => (
            <div
              key={transaction._id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-md animate-slide-up group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${transaction.type === 'income'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}
                >
                  {transaction.type === 'income' ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{transaction.category}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryClass(transaction.category)}`}>
                      {transaction.type}
                    </span>
                  </div>
                  {transaction.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{transaction.description}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className={`text-xl font-bold transition-transform duration-200 group-hover:scale-105 ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => onEdit(transaction)}
                  className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 transition-all duration-200 transform hover:scale-110"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(transaction._id)}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-all duration-200 transform hover:scale-110"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Results count */}
      {searchTerm && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </p>
      )}
    </div>
  );
};

export default TransactionList;
