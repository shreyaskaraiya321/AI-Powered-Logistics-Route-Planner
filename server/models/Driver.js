const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  status: { type: String, enum: ['active', 'inactive', 'on-route'], default: 'inactive' },
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
