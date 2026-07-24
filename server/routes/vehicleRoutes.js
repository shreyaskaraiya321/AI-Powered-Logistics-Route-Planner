const express = require('express');
const { createVehicle, getVehicles, getVehicleById, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, restrictTo('admin', 'dispatcher', 'driver'), getVehicles)
  .post(protect, restrictTo('admin', 'dispatcher'), createVehicle);

router.route('/:id')
  .get(protect, restrictTo('admin', 'dispatcher', 'driver'), getVehicleById)
  .put(protect, restrictTo('admin', 'dispatcher'), updateVehicle)
  .delete(protect, restrictTo('admin', 'dispatcher'), deleteVehicle);

module.exports = router;
