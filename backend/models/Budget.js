import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Budget amount is required'],
        min: [0.01, 'Amount must be greater than 0']
    },
    period: {
        type: String,
        enum: ['weekly', 'monthly'],
        default: 'monthly'
    },
    alertThreshold: {
        type: Number,
        default: 80, // Alert when spending reaches 80% of budget
        min: 0,
        max: 100
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
budgetSchema.index({ user: 1, category: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
