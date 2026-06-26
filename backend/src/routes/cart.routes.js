const { Router } = require('express');
const { z } = require('zod');
const validate = require('../middleware/validateRequest');
const ctrl = require('../controllers/cart.controller');

const router = Router();

const addItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100),
});

router.get('/:sessionId', ctrl.getCart);
router.post('/:sessionId/items', validate(addItemSchema), ctrl.addItem);
router.patch('/:sessionId/items/:itemId', validate(updateItemSchema), ctrl.updateItem);
router.delete('/:sessionId/items/:itemId', ctrl.removeItem);
router.delete('/:sessionId', ctrl.clearCart);

module.exports = router;
