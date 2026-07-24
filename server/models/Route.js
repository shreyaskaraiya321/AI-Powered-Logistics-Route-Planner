const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  orderIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  stopOrder: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }], // Ordering of orders to visit
  estimatedDistance: { type: Number }, // in km or miles
  estimatedDuration: { type: Number }, // in minutes
  status: { type: String, enum: ['planned', 'in-progress', 'completed', 'cancelled'], default: 'planned' },
  dispatcherApproved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);
