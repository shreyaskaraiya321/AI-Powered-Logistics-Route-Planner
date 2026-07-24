const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  timeWindowStart: { type: Date },
  timeWindowEnd: { type: Date },
  loadDetails: { type: String },
  servicePriority: { type: String, enum: ['standard', 'express', 'overnight'], default: 'standard' },
  customerInstructions: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'dispatched', 'in-transit', 'delayed', 'delivered', 'failed', 'rescheduled'],
    default: 'pending'
  },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
