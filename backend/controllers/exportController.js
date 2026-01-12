import Transaction from '../models/Transaction.js';
import { format } from 'date-fns';

// @desc    Export transactions to CSV
// @route   GET /api/export/csv
// @access  Private
export const exportToCSV = async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;

        const query = { user: req.user._id };

        if (type) query.type = type;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(query).sort({ date: -1 });

        // Generate CSV content
        const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
        const csvRows = [headers.join(',')];

        transactions.forEach(t => {
            const row = [
                format(new Date(t.date), 'yyyy-MM-dd'),
                t.type,
                `"${t.category}"`,
                t.amount.toFixed(2),
                `"${(t.description || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(','));
        });

        // Add summary
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        csvRows.push('');
        csvRows.push(`Total Income,,,${totalIncome.toFixed(2)}`);
        csvRows.push(`Total Expenses,,,${totalExpense.toFixed(2)}`);
        csvRows.push(`Balance,,,${(totalIncome - totalExpense).toFixed(2)}`);

        const csvContent = csvRows.join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        res.send(csvContent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export transactions to JSON (for PDF generation on frontend)
// @route   GET /api/export/report
// @access  Private
export const getExportReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const query = { user: req.user._id };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(query).sort({ date: -1 });

        // Calculate summaries
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        // Group by category
        const categoryTotals = {};
        transactions.forEach(t => {
            if (t.type === 'expense') {
                if (!categoryTotals[t.category]) {
                    categoryTotals[t.category] = 0;
                }
                categoryTotals[t.category] += t.amount;
            }
        });

        const categoryBreakdown = Object.entries(categoryTotals)
            .map(([category, total]) => ({ category, total }))
            .sort((a, b) => b.total - a.total);

        // Group by date
        const dailyTotals = {};
        transactions.forEach(t => {
            const dateKey = format(new Date(t.date), 'yyyy-MM-dd');
            if (!dailyTotals[dateKey]) {
                dailyTotals[dateKey] = { date: dateKey, income: 0, expense: 0 };
            }
            if (t.type === 'income') {
                dailyTotals[dateKey].income += t.amount;
            } else {
                dailyTotals[dateKey].expense += t.amount;
            }
        });

        res.json({
            generatedAt: new Date().toISOString(),
            period: {
                start: startDate || 'All time',
                end: endDate || 'Present'
            },
            summary: {
                totalIncome,
                totalExpense,
                balance: totalIncome - totalExpense,
                transactionCount: transactions.length
            },
            categoryBreakdown,
            dailyBreakdown: Object.values(dailyTotals).sort((a, b) => b.date.localeCompare(a.date)),
            transactions: transactions.map(t => ({
                date: format(new Date(t.date), 'yyyy-MM-dd'),
                type: t.type,
                category: t.category,
                amount: t.amount,
                description: t.description
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
