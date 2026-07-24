const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, unique: true },
  capacity: { type: String, required: true },
  availability: { type: Boolean, default: true },
  operatingArea: { type: String },
  shift: { type: String },
  specialConstraints: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
