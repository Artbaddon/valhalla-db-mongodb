import mongoose from 'mongoose';

// Payment Status Schema (Simple lookup)
const paymentStatusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Payment status name is required'],
    trim: true,
    maxlength: [30, 'Payment status name cannot exceed 30 characters'],
    unique: true,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'payment_statuses'
});

// Payment Schema
const paymentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
    index: true
  },
  
  // Payment details
  totalAmount: {
    type: Number,
    required: [true, 'Total payment amount is required'],
    min: [0, 'Payment amount cannot be negative'],
    validate: {
      validator: function(value) {
        return Number.isFinite(value) && value >= 0;
      },
      message: 'Total amount must be a valid positive number'
    }
  },
  
  paymentStatus: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    trim: true,
    maxlength: [30, 'Payment method cannot exceed 30 characters'],
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'online', 'check'],
    index: true
  },
  
  referenceNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Reference number cannot exceed 50 characters'],
    sparse: true, // Allows null values but ensures uniqueness when present
    index: true
  },
  
  // Payment breakdown (for complex payments)
  items: [{
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Item description cannot exceed 100 characters']
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Item amount cannot be negative']
    },
    category: {
      type: String,
      required: true,
      enum: ['maintenance', 'parking', 'amenities', 'fine', 'deposit', 'other'],
      index: true
    }
  }],
  
  // Payment dates
  paymentDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  dueDate: {
    type: Date,
    index: true
  },
  
  // Additional information
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  
  // Receipt/invoice information
  receiptNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  
  // Related entities
  apartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Apartment',
    index: true
  },
  
  tower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tower',
    index: true
  }
}, {
  timestamps: true,
  collection: 'payments'
});

// Indexes for performance
paymentSchema.index({ owner: 1, paymentDate: -1 });
paymentSchema.index({ paymentStatus: 1, paymentDate: -1 });
paymentSchema.index({ paymentMethod: 1, createdAt: -1 });
paymentSchema.index({ 'items.category': 1, paymentDate: -1 });

// Virtuals
paymentSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.paymentStatus === 'completed') return false;
  return new Date() > this.dueDate;
});

paymentSchema.virtual('daysSinceDue').get(function() {
  if (!this.dueDate || this.paymentStatus === 'completed') return 0;
  const now = new Date();
  const diffTime = now - this.dueDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

paymentSchema.virtual('totalItemsAmount').get(function() {
  return this.items.reduce((total, item) => total + item.amount, 0);
});

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  // Generate receipt number if payment is completed and no receipt exists
  if (this.paymentStatus === 'completed' && !this.receiptNumber) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.receiptNumber = `REC-${date}-${random}`;
  }
  
  // Validate total amount matches items sum if items exist
  if (this.items && this.items.length > 0) {
    const itemsTotal = this.totalItemsAmount;
    if (Math.abs(this.totalAmount - itemsTotal) > 0.01) {
      return next(new Error('Total amount must match sum of items'));
    }
  }
  
  next();
});

// Static methods
paymentSchema.statics.findByOwner = function(ownerId, options = {}) {
  const query = this.find({ owner: ownerId });
  
  if (options.status) {
    query.where('paymentStatus').equals(options.status);
  }
  
  if (options.method) {
    query.where('paymentMethod').equals(options.method);
  }
  
  if (options.dateFrom) {
    query.where('paymentDate').gte(options.dateFrom);
  }
  
  if (options.dateTo) {
    query.where('paymentDate').lte(options.dateTo);
  }
  
  return query.populate('owner', 'name email')
              .populate('apartment', 'number')
              .populate('tower', 'name')
              .sort({ paymentDate: -1 });
};

paymentSchema.statics.getPaymentSummary = function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        avgAmount: { $avg: '$totalAmount' }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        totalAmount: { $round: ['$totalAmount', 2] },
        avgAmount: { $round: ['$avgAmount', 2] }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

paymentSchema.statics.getOverduePayments = function() {
  const today = new Date();
  return this.find({
    dueDate: { $lt: today },
    paymentStatus: { $in: ['pending', 'failed'] }
  })
  .populate('owner', 'name email phone')
  .populate('apartment', 'number')
  .populate('tower', 'name')
  .sort({ dueDate: 1 });
};

// Instance methods
paymentSchema.methods.markAsCompleted = function() {
  this.paymentStatus = 'completed';
  this.paymentDate = new Date();
  return this.save();
};

paymentSchema.methods.addPaymentItem = function(description, amount, category) {
  this.items.push({ description, amount, category });
  this.totalAmount = this.totalItemsAmount;
  return this.save();
};

paymentSchema.methods.generateReceiptData = function() {
  return {
    receiptNumber: this.receiptNumber,
    paymentDate: this.paymentDate,
    owner: this.owner,
    totalAmount: this.totalAmount,
    paymentMethod: this.paymentMethod,
    items: this.items,
    apartment: this.apartment,
    tower: this.tower
  };
};

// Payment Status Model
export const PaymentStatus = mongoose.model('PaymentStatus', paymentStatusSchema);

// Payment Model
export const Payment = mongoose.model('Payment', paymentSchema);

// Default export
export default { Payment, PaymentStatus };
