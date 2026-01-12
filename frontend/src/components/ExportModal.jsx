import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import api from '../utils/api';

const ExportModal = ({ isOpen, onClose }) => {
    const [exportType, setExportType] = useState('csv');
    const [dateRange, setDateRange] = useState({
        startDate: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
    });
    const [loading, setLoading] = useState(false);

    const handleExportCSV = async () => {
        setLoading(true);
        try {
            const response = await api.get('/export/csv', {
                params: {
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate
                },
                responseType: 'blob'
            });

            // Create download link
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            onClose();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export transactions');
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        setLoading(true);
        try {
            const response = await api.get('/export/report', {
                params: {
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate
                }
            });

            const report = response.data;

            // Generate a printable HTML report
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Expense Report - ${format(new Date(), 'MMM dd, yyyy')}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1f2937; }
            h1 { font-size: 24px; margin-bottom: 8px; color: #0284c7; }
            h2 { font-size: 18px; margin: 24px 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
            .header { margin-bottom: 32px; }
            .period { color: #6b7280; font-size: 14px; }
            .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
            .summary-card { padding: 16px; border-radius: 8px; text-align: center; }
            .summary-card.income { background: #dcfce7; }
            .summary-card.expense { background: #fef2f2; }
            .summary-card.balance { background: #e0f2fe; }
            .summary-card .label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
            .summary-card .value { font-size: 24px; font-weight: bold; margin-top: 4px; }
            .summary-card.income .value { color: #16a34a; }
            .summary-card.expense .value { color: #dc2626; }
            .summary-card.balance .value { color: #0284c7; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background: #f9fafb; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #6b7280; }
            .amount-income { color: #16a34a; }
            .amount-expense { color: #dc2626; }
            .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Expense Report</h1>
            <p class="period">Period: ${report.period.start} to ${report.period.end}</p>
            <p class="period">Generated: ${format(new Date(report.generatedAt), 'MMM dd, yyyy h:mm a')}</p>
          </div>

          <div class="summary">
            <div class="summary-card income">
              <div class="label">Total Income</div>
              <div class="value">$${report.summary.totalIncome.toFixed(2)}</div>
            </div>
            <div class="summary-card expense">
              <div class="label">Total Expenses</div>
              <div class="value">$${report.summary.totalExpense.toFixed(2)}</div>
            </div>
            <div class="summary-card balance">
              <div class="label">Net Balance</div>
              <div class="value">$${report.summary.balance.toFixed(2)}</div>
            </div>
          </div>

          <h2>Spending by Category</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th style="text-align: right;">Amount</th>
                <th style="text-align: right;">% of Total</th>
              </tr>
            </thead>
            <tbody>
              ${report.categoryBreakdown.map(cat => `
                <tr>
                  <td>${cat.category}</td>
                  <td style="text-align: right;">$${cat.total.toFixed(2)}</td>
                  <td style="text-align: right;">${((cat.total / report.summary.totalExpense) * 100).toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>All Transactions (${report.transactions.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${report.transactions.map(t => `
                <tr>
                  <td>${t.date}</td>
                  <td>${t.category}</td>
                  <td>${t.description || '-'}</td>
                  <td style="text-align: right;" class="amount-${t.type}">
                    ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated by ExpenseTracker</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `);
            printWindow.document.close();

            onClose();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Download className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Export Transactions</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            Date Range
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                className="input"
                            />
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                min={dateRange.startDate}
                                className="input"
                            />
                        </div>
                    </div>

                    {/* Export Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Export Format
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setExportType('csv')}
                                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${exportType === 'csv'
                                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                <FileSpreadsheet className={`h-8 w-8 ${exportType === 'csv' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
                                    }`} />
                                <span className={`font-medium ${exportType === 'csv' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                    CSV
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Excel compatible</span>
                            </button>
                            <button
                                onClick={() => setExportType('pdf')}
                                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${exportType === 'pdf'
                                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                <FileText className={`h-8 w-8 ${exportType === 'pdf' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
                                    }`} />
                                <span className={`font-medium ${exportType === 'pdf' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                    PDF
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Printable report</span>
                            </button>
                        </div>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={exportType === 'csv' ? handleExportCSV : handleExportPDF}
                        disabled={loading}
                        className="w-full btn btn-primary py-3 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="h-5 w-5" />
                                Export {exportType.toUpperCase()}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
