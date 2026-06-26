const prisma = require('../db/prisma');
const { restoreStock } = require('../services/stock.service');
const { createError } = require('../utils/httpError');

// GET /api/admin/orders?status=PENDING&date=2024-06-01
const listOrders = async (req, res, next) => {
  try {
    const { status, date, page = '1', limit = '20' } = req.query;

    const where = {};
    if (status) where.status = status;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.createdAt = { gte: start, lt: end };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          orderItems: { include: { product: { select: { imageUrl: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });
    if (!order) throw createError(404, 'Order not found');

    // If cancelling, restore stock
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      await restoreStock(order.orderItems.map((i) => ({ productId: i.productId, quantity: i.quantity })));
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: { customer: true, orderItems: true },
    });

    console.log(`[ADMIN] Order ${updated.orderNumber} status → ${status}`);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/orders/:id/payment
const updateOrderPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw createError(404, 'Order not found');

    const updated = await prisma.order.update({
      where: { id },
      data: { paymentStatus },
      include: { customer: true, orderItems: true },
    });

    console.log(`[ADMIN] Order ${updated.orderNumber} payment status → ${paymentStatus}`);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/stock
const listStock = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { category: { name: 'asc' } },
      select: {
        id: true,
        name: true,
        category: { select: { name: true } },
        stockQuantity: true,
        lowStockThreshold: true,
        isActive: true,
        price: true,
        imageUrl: true,
      },
    });

    const withStatus = products.map((p) => ({
      ...p,
      category: p.category?.name || 'Uncategorized',
      stockStatus:
        p.stockQuantity === 0
          ? 'out_of_stock'
          : p.stockQuantity <= p.lowStockThreshold
          ? 'low_stock'
          : 'in_stock',
    }));

    res.json({ products: withStatus });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/stock/:productId
const updateStock = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw createError(404, 'Product not found');

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { stockQuantity: quantity },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/products
const createProduct = async (req, res, next) => {
  try {
    const { name, categoryName, shortDescription, description, itemPrice, price, stockQuantity, imageType, imageUrl } = req.body;
    
    // Find category to link
    const category = await prisma.category.findUnique({ where: { name: categoryName } });
    if (!category) throw createError(400, 'Category not found');

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let finalImageUrl = imageType === 'url' ? imageUrl : '';
    
    if (imageType === 'upload' && req.file) {
      finalImageUrl = `/images/${req.file.filename}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        categoryId: category.id,
        shortDescription,
        description,
        price: parseFloat(price),
        itemPrice: itemPrice ? parseFloat(itemPrice) : null,
        stockQuantity: parseInt(stockQuantity, 10),
        imageUrl: finalImageUrl,
      }
    });

    res.status(201).json(product);
  } catch (err) {
    if (err.code === 'P2002') return next(createError(409, 'A product with this name/slug already exists'));
    next(err);
  }
};

// DELETE /api/admin/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { listOrders, updateOrderStatus, updateOrderPaymentStatus, listStock, updateStock, createProduct, deleteProduct };
