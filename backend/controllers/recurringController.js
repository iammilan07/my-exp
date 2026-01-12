import RecurringTransaction from '../models/RecurringTransaction.js';
import Transaction from '../models/Transaction.js';

// @desc    Get all recurring transactions for user
// @route   GET /api/recurring
// @access  Private
export const getRecurringTransactions = async (req, res) => {
    try {
        const recurring = await RecurringTransaction.find({ user: req.user._id })
            .sort({ nextDueDate: 1 });

        res.json(recurring);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new recurring transaction
// @route   POST /api/recurring
// @access  Private
export const createRecurringTransaction = async (req, res) => {
    try {
        const { type, category, amount, description, frequency, startDate, endDate } = req.body;

        const recurring = await RecurringTransaction.create({
            user: req.user._id,
            type,
            category,
            amount,
            description,
            frequency,
            startDate: startDate || new Date(),
            nextDueDate: startDate || new Date(),
            endDate
        });

        res.status(201).json(recurring);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update recurring transaction
// @route   PUT /api/recurring/:id
// @access  Private
export const updateRecurringTransaction = async (req, res) => {
    try {
        const recurring = await RecurringTransaction.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!recurring) {
            return res.status(404).json({ message: 'Recurring transaction not found' });
        }

        const { type, category, amount, description, frequency, isActive, endDate } = req.body;

        if (type !== undefined) recurring.type = type;
        if (category !== undefined) recurring.category = category;
        if (amount !== undefined) recurring.amount = amount;
        if (description !== undefined) recurring.description = description;
        if (frequency !== undefined) recurring.frequency = frequency;
        if (isActive !== undefined) recurring.isActive = isActive;
        if (endDate !== undefined) recurring.endDate = endDate;

        const updated = await recurring.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete recurring transaction
// @route   DELETE /api/recurring/:id
// @access  Private
export const deleteRecurringTransaction = async (req, res) => {
    try {
        const recurring = await RecurringTransaction.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!recurring) {
            return res.status(404).json({ message: 'Recurring transaction not found' });
        }

        await recurring.deleteOne();
        res.json({ message: 'Recurring transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle recurring transaction active status
// @route   PATCH /api/recurring/:id/toggle
// @access  Private
export const toggleRecurringTransaction = async (req, res) => {
    try {
        const recurring = await RecurringTransaction.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!recurring) {
            return res.status(404).json({ message: 'Recurring transaction not found' });
        }

        recurring.isActive = !recurring.isActive;
        const updated = await recurring.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Process due recurring transactions
// @route   POST /api/recurring/process
// @access  Private
export const processRecurringTransactions = async (req, res) => {
    try {
        const now = new Date();

        // Find all active recurring transactions that are due
        const dueTransactions = await RecurringTransaction.find({
            user: req.user._id,
            isActive: true,
            nextDueDate: { $lte: now },
            $or: [
                { endDate: { $exists: false } },
                { endDate: null },
                { endDate: { $gte: now } }
            ]
        });

        const processed = [];

        for (const recurring of dueTransactions) {
            // Create the actual transaction
            const transaction = await Transaction.create({
                user: req.user._id,
                type: recurring.type,
                category: recurring.category,
                amount: recurring.amount,
                description: `${recurring.description || ''} (Recurring)`.trim(),
                date: recurring.nextDueDate
            });

            // Update the next due date
            recurring.nextDueDate = recurring.calculateNextDueDate();
            recurring.lastProcessed = now;
            await recurring.save();

            processed.push({
                recurring: recurring._id,
                transaction: transaction._id,
                category: recurring.category,
                amount: recurring.amount
            });
        }

        res.json({
            message: `Processed ${processed.length} recurring transactions`,
            processed
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
