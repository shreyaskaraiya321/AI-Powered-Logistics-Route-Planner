const { z } = require('zod');
const Vehicle = require('../models/Vehicle');

const vehicleSchema = z.object({
  plateNumber: z.string().min(1, 'Plate number is required'),
  capacity: z.string().min(1, 'Capacity is required'),
  availability: z.boolean().optional(),
  operatingArea: z.string().optional(),
  shift: z.string().optional(),
  specialConstraints: z.array(z.string()).optional()
});

const createVehicle = async (req, res, next) => {
  try {
    const parsedData = vehicleSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Validation Error', errors: parsedData.error.errors });
    }

    const exists = await Vehicle.findOne({ plateNumber: parsedData.data.plateNumber });
    if (exists) {
      return res.status(400).json({ message: 'Vehicle with this plate number already exists' });
    }

    const vehicle = await Vehicle.create(parsedData.data);
    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
};

const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({});
    res.json(vehicles);
  } catch (error) {
    next(error);
  }
};

const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    // allow partial updates
    const parsedData = vehicleSchema.partial().safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Validation Error', errors: parsedData.error.errors });
    }

    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, parsedData.data, { new: true, runValidators: true });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json({ message: 'Vehicle removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle
};
