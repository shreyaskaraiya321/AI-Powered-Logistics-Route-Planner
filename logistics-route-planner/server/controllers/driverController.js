const { z } = require('zod');
const Driver = require('../models/Driver');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

const driverSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  vehicleId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'on-route']).optional()
});

const createDriver = async (req, res, next) => {
  try {
    const parsedData = driverSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Validation Error', errors: parsedData.error.errors });
    }

    // Verify user exists and is a driver
    const user = await User.findById(parsedData.data.userId);
    if (!user || user.role !== 'driver') {
       return res.status(400).json({ message: 'Valid user with driver role is required' });
    }
    
    const exists = await Driver.findOne({ userId: parsedData.data.userId });
    if (exists) {
      return res.status(400).json({ message: 'Driver profile already exists for this user' });
    }

    const driver = await Driver.create(parsedData.data);
    res.status(201).json(driver);
  } catch (error) {
    next(error);
  }
};

const getDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find({}).populate('userId', 'name email').populate('vehicleId');
    res.json(drivers);
  } catch (error) {
    next(error);
  }
};

const getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id).populate('userId', 'name email').populate('vehicleId');
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    next(error);
  }
};

const updateDriver = async (req, res, next) => {
  try {
    const parsedData = driverSchema.partial().safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Validation Error', errors: parsedData.error.errors });
    }

    const driver = await Driver.findByIdAndUpdate(req.params.id, parsedData.data, { new: true, runValidators: true });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    next(error);
  }
};

const deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json({ message: 'Driver removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver
};
