const mongoose = require('mongoose');

const aiGenerationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['route-explanation', 'dispatcher-summary', 'driver-summary', 'exception-message', 'customer-update', 'constraint-question'],
    required: true
  },
  relatedRouteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  relatedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  promptUsed: { type: String, required: true },
  responseText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AiGeneration', aiGenerationSchema);
