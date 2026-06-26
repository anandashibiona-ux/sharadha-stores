const prisma = require('../db/prisma');
const { createError } = require('../utils/httpError');

const DELIVERY_FEES = {
  standard: 50,
  express: 120,
  free: 0,
};
const FREE_DELIVERY_THRESHOLD = 500;

/**
 * Enrich cart items with full product data and compute subtotal.
 */
const buildCartResponse = (items) => {
  const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEES.standard;
  return {
    items: items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: Number(item.product.price),
        imageUrl: item.product.imageUrl,
        stockQuantity: item.product.stockQuantity,
        stockStatus:
          item.product.stockQuantity === 0
            ? 'out_of_stock'
            : item.product.stockQuantity <= item.product.lowStockThreshold
            ? 'low_stock'
            : 'in_stock',
      },
      lineTotal: Number(item.product.price) * item.quantity,
    })),
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  };
};

// GET /api/cart/:sessionId
const getCart = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const items = await prisma.cartItem.findMany({
      where: { sessionId },
      include: { product: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(buildCartResponse(items));
  } catch (err) {
    next(err);
  }
};

// POST /api/cart/:sessionId/items
const addItem = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { productId, quantity } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) throw createError(404, 'Product not found');
    if (product.stockQuantity < quantity) {
      throw createError(409, `Only ${product.stockQuantity} units available`);
    }

    // Upsert: if item already in cart, increment quantity
    const existing = await prisma.cartItem.findUnique({
      where: { sessionId_productId: { sessionId, productId } },
    });

    let cartItem;
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (product.stockQuantity < newQty) {
        throw createError(409, `Only ${product.stockQuantity} units available`);
      }
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
        include: { product: true },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: { sessionId, productId, quantity },
        include: { product: true },
      });
    }

    // Return full cart
    const items = await prisma.cartItem.findMany({
      where: { sessionId },
      include: { product: true },
      orderBy: { createdAt: 'asc' },
    });
    res.status(200).json(buildCartResponse(items));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/cart/:sessionId/items/:itemId
const updateItem = async (req, res, next) => {
  try {
    const { sessionId, itemId } = req.params;
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });
    if (!cartItem || cartItem.sessionId !== sessionId) throw createError(404, 'Cart item not found');
    if (cartItem.product.stockQuantity < quantity) {
      throw createError(409, `Only ${cartItem.product.stockQuantity} units available`);
    }

    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });

    const items = await prisma.cartItem.findMany({
      where: { sessionId },
      include: { product: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(buildCartResponse(items));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/:sessionId/items/:itemId
const removeItem = async (req, res, next) => {
  try {
    const { sessionId, itemId } = req.params;
    const cartItem = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!cartItem || cartItem.sessionId !== sessionId) throw createError(404, 'Cart item not found');

    await prisma.cartItem.delete({ where: { id: itemId } });

    const items = await prisma.cartItem.findMany({
      where: { sessionId },
      include: { product: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(buildCartResponse(items));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/:sessionId
const clearCart = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    await prisma.cartItem.deleteMany({ where: { sessionId } });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
