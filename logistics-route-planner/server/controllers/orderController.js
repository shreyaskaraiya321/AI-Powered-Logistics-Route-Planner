const { z } = require('zod');
const Order = require('../models/Order');
const StatusEvent = require('../models/StatusEvent');
const geminiService = require('../services/geminiService');

const orderSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  timeWindowStart: z.string().datetime().optional(),
  timeWindowEnd: z.string().datetime().optional(),
  loadDetails: z.string().optional(),
  servicePriority: z.enum(['standard', 'express', 'overnight']).optional(),
  customerInstructions: z.string().optional(),
  status: z.enum(['pending', 'dispatched', 'in-transit', 'delayed', 'delivered', 'failed', 'rescheduled']).optional(),
  customerId: z.string().optional() // Optional because we can infer it from req.user for customers
});

const createOrder = async (req, res, next) => {
  try {
    const parsedData = orderSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Validation Error', errors: parsedData.error.errors });
    }

    // If customer creates it, force customerId to their own ID. 
    // If admin/dispatcher, use provided or their own.
    let customerId = req.user._id;
    if ((req.user.role === 'admin' || req.user.role === 'dispatcher') && parsedData.data.customerId) {
      customerId = parsedData.data.customerId;
    }

    const orderData = { ...parsedData.data, customerId };

    const order = await Order.create(orderData);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    let query = {};
    // If user is a customer, only show their orders
    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    }

    const orders = await Order.find(query).populate('customerId', 'name email');
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('customerId', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (req.user.role === 'customer' && order.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(order);
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const parsedData = orderSchema.partial().safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: 'Validation Error', errors: parsedData.error.errors });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, parsedData.data, { new: true, runValidators: true });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order removed' });
  } catch (error) {
    next(error);
  }
};

const getExceptionSummary = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Find the latest status event for this order that might be an exception
    // For simplicity, we just look for any event with 'failed', 'delayed', or 'rescheduled' that relates to this order.
    // However, StatusEvents point to routeId, not orderId. So we need to query based on that if we were strict,
    // but the prompt allows passing the status event. For this demo, let's just mock a status event if one isn't found easily,
    // or assume the client passes the statusEventId in the body.
    const { statusEventId } = req.body;
    let statusEvent = await StatusEvent.findById(statusEventId);
    if (!statusEvent) {
      statusEvent = { type: order.status, reason: 'System reported issue' }; // fallback mock
    }

    const result = await geminiService.generateExceptionSummary(statusEvent, order);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getCustomerUpdate = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    const { statusEventId } = req.body;
    let statusEvent = await StatusEvent.findById(statusEventId);
    if (!statusEvent) {
      statusEvent = { type: order.status, reason: 'Status changed' }; // fallback mock
    }

    const result = await geminiService.generateCustomerUpdate(order, statusEvent);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getExceptionSummary,
  getCustomerUpdate
};
