import { Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-500 text-lg">No transactions found for this period</p>
        <p className="text-gray-400 text-sm mt-2">Add your first transaction to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction, index) => (
        <div
          key={transaction._id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-md animate-slide-up"
          style={{animationDelay: `${index * 0.05}s`}}
        >
          <div className="flex items-center gap-4 flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                transaction.type === 'income'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {transaction.type === 'income' ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">{transaction.category}</h4>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    transaction.type === 'income'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {transaction.type}
                </span>
              </div>
              {transaction.description && (
                <p className="text-sm text-gray-600 truncate">{transaction.description}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {format(new Date(transaction.date), 'MMM dd, yyyy')}
              </p>
            </div>

            <div className="text-right">
              <p
                className={`text-xl font-bold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => onEdit(transaction)}
              className="p-2 rounded-lg hover:bg-primary-100 text-primary-600 transition-all duration-200 transform hover:scale-110"
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(transaction._id)}
              className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-all duration-200 transform hover:scale-110"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
