const express = require('express');
const { createOrder, getOrders, getOrderById, updateOrder, deleteOrder, getExceptionSummary, getCustomerUpdate } = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(restrictTo('admin', 'dispatcher', 'driver', 'customer'), getOrders)
  .post(restrictTo('admin', 'dispatcher', 'customer'), createOrder);

router.route('/:id')
  .get(restrictTo('admin', 'dispatcher', 'driver', 'customer'), getOrderById)
  .put(restrictTo('admin', 'dispatcher'), updateOrder)
  .delete(restrictTo('admin', 'dispatcher'), deleteOrder);

router.route('/:id/exception-summary')
  .post(restrictTo('admin', 'dispatcher'), getExceptionSummary);

router.route('/:id/customer-update')
  .post(restrictTo('admin', 'dispatcher', 'customer'), getCustomerUpdate);

module.exports = router;
