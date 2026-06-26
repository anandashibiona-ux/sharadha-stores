const { Router } = require('express');
const { z } = require('zod');
const validate = require('../middleware/validateRequest');
const adminAuth = require('../middleware/adminAuth');
const ctrl = require('../controllers/admin.controller');
const multer = require('multer');

// Use memory storage to prevent Vercel filesystem crashes
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

// All admin routes require the admin key
router.use(adminAuth);

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELLED']),
});

const updatePaymentStatusSchema = z.object({
  paymentStatus: z.string().min(1),
});

const updateStockSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
});

router.get('/orders', ctrl.listOrders);
router.patch('/orders/:id/status', validate(updateStatusSchema), ctrl.updateOrderStatus);
router.patch('/orders/:id/payment', validate(updatePaymentStatusSchema), ctrl.updateOrderPaymentStatus);
router.get('/stock', ctrl.listStock);
router.patch('/stock/:productId', validate(updateStockSchema), ctrl.updateStock);
router.post('/products', upload.single('image'), ctrl.createProduct);
router.delete('/products/:id', ctrl.deleteProduct);

module.exports = router;
