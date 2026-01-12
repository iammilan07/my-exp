import mongoose from 'mongoose';

const recurringTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: [true, 'Transaction type is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be greater than 0']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly', 'yearly'],
        required: [true, 'Frequency is required']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
        default: Date.now
    },
    nextDueDate: {
        type: Date,
        required: true,
        index: true
    },
    endDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastProcessed: {
        type: Date
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
recurringTransactionSchema.index({ user: 1, isActive: 1, nextDueDate: 1 });

// Method to calculate next due date
recurringTransactionSchema.methods.calculateNextDueDate = function () {
    const current = new Date(this.nextDueDate);

    switch (this.frequency) {
        case 'daily':
            current.setDate(current.getDate() + 1);
            break;
        case 'weekly':
            current.setDate(current.getDate() + 7);
            break;
        case 'biweekly':
            current.setDate(current.getDate() + 14);
            break;
        case 'monthly':
            current.setMonth(current.getMonth() + 1);
            break;
        case 'yearly':
            current.setFullYear(current.getFullYear() + 1);
            break;
    }

    return current;
};

const RecurringTransaction = mongoose.model('RecurringTransaction', recurringTransactionSchema);

export default RecurringTransaction;
