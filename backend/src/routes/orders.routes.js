const { Router } = require('express');
const { z } = require('zod');
const validate = require('../middleware/validateRequest');
const ctrl = require('../controllers/orders.controller');

const router = Router();

const placeOrderSchema = z.object({
  sessionId: z.string().min(1, 'Session ID required'),
  customer: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
    email: z.string().email('Enter a valid email').nullish().or(z.literal('')),
    addressLine1: z.string().min(5, 'Address is required'),
    addressLine2: z.string().nullish(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
    deliveryNotes: z.string().max(300).nullish(),
  }),
  deliveryOption: z.enum(['standard', 'express', 'free']),
});

const updatePaymentSchema = z.object({
  paymentMethod: z.enum(['CREDIT_CARD', 'NET_BANKING', 'UPI', 'CASH_ON_DELIVERY']),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'CONFIRMED', 'VERIFICATION_PENDING']),
  transactionId: z.string().optional(),
});

const initiatePaymentSchema = z.object({
  paymentMethod: z.enum(['CREDIT_CARD', 'NET_BANKING', 'UPI', 'CASH_ON_DELIVERY'])
});

const verifyPaymentSchema = z.object({
  paymentMethod: z.enum(['CREDIT_CARD', 'NET_BANKING', 'UPI', 'CASH_ON_DELIVERY']),
  paymentData: z.any()
});

router.post('/', validate(placeOrderSchema), ctrl.placeOrder);
router.get('/', ctrl.getAllOrders);
router.post('/initiate-payment', ctrl.initiatePayment);
router.post('/verify-payment', ctrl.verifyPayment);
router.get('/customer/:phone', ctrl.getOrdersByPhone);
router.get('/:orderNumber', ctrl.getOrder);
router.patch('/:orderNumber/pay', validate(updatePaymentSchema), ctrl.updatePayment);
router.patch('/:orderNumber/address', validate(placeOrderSchema.shape.customer), ctrl.updateAddress);

module.exports = router;
