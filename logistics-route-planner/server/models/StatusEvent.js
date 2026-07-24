const mongoose = require('mongoose');

const statusEventSchema = new mongoose.Schema({
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  type: { 
    type: String, 
    enum: ['pending', 'dispatched', 'in-transit', 'delayed', 'delivered', 'failed', 'rescheduled'],
    required: true 
  },
  reason: { type: String },
  proofOfDelivery: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StatusEvent', statusEventSchema);
