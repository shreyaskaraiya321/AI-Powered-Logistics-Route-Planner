const express = require('express');
const { 
  planRoute, 
  approveRoute, 
  updateRouteStatus, 
  getRoutes, 
  getRouteById, 
  deleteRoute,
  getRouteExplanation,
  getRouteSummary,
  getDriverInstructions
} = require('../controllers/routeController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getRoutes); // Access filtered in controller based on role

router.route('/plan')
  .post(restrictTo('admin', 'dispatcher'), planRoute);

router.route('/:id')
  .get(getRouteById) // Assuming list gives them everything they need, GET by ID is fine.
  .delete(restrictTo('admin', 'dispatcher'), deleteRoute);

router.route('/:id/approve')
  .post(restrictTo('admin', 'dispatcher'), approveRoute);

router.route('/:id/status')
  .post(restrictTo('admin', 'dispatcher', 'driver'), updateRouteStatus);

router.route('/:id/explain')
  .post(restrictTo('admin', 'dispatcher'), getRouteExplanation);

router.route('/:id/summary')
  .post(restrictTo('admin', 'dispatcher'), getRouteSummary);

router.route('/:id/driver-instructions')
  .post(restrictTo('admin', 'dispatcher', 'driver'), getDriverInstructions);

module.exports = router;
