const express = require('express');
const { createDriver, getDrivers, getDriverById, updateDriver, deleteDriver } = require('../controllers/driverController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All driver routes require auth

router.route('/')
  .get(restrictTo('admin', 'dispatcher'), getDrivers)
  .post(restrictTo('admin', 'dispatcher'), createDriver);

router.route('/:id')
  .get(restrictTo('admin', 'dispatcher'), getDriverById)
  .put(restrictTo('admin', 'dispatcher'), updateDriver)
  .delete(restrictTo('admin', 'dispatcher'), deleteDriver);

module.exports = router;
