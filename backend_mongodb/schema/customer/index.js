import mongoose from 'mongoose';

/**
 * Customer Schema
 * Tracks customers for loyalty, history, and quick billing lookup
 */
const CustomerSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stores',
    required: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  // Loyalty & Financial
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  creditBalance: {
    type: Number,
    default: 0  // Positive = customer owes, Negative = store owes
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  visitCount: {
    type: Number,
    default: 0
  },
  // Last visit info
  lastVisit: {
    type: Date
  },
  // Notes (allergies, preferences, etc.)
  notes: {
    type: String,
    default: ''
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Compound index for store + phone uniqueness
CustomerSchema.index({ storeId: 1, phone: 1 }, { unique: true });

// Virtual for purchase history (will be calculated from billing)
CustomerSchema.virtual('memberSince').get(function() {
  return this.createdAt;
});

// Instance method to add loyalty points (1 point per $10 spent)
CustomerSchema.methods.addPurchase = function(amount) {
  this.totalSpent += amount;
  this.visitCount += 1;
  this.lastVisit = new Date();
  this.loyaltyPoints += Math.floor(amount / 10);
};

const Customer = mongoose.model('Customer', CustomerSchema);

export default Customer;
