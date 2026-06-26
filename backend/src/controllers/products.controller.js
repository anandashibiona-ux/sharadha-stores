const prisma = require('../db/prisma');
const { createError } = require('../utils/httpError');

/**
 * Attach a stock status label to each product.
 */
const withStockStatus = (product) => {
  let stockStatus;
  if (product.stockQuantity === 0) {
    stockStatus = 'out_of_stock';
  } else if (product.stockQuantity <= product.lowStockThreshold) {
    stockStatus = 'low_stock';
  } else {
    stockStatus = 'in_stock';
  }
  return { ...product, stockStatus };
};

// GET /api/products
const listProducts = async (req, res, next) => {
  try {
    const { category, search, inStock } = req.query;

    const where = { isActive: true };
    if (category) where.category = { name: category };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (inStock === 'true') where.stockQuantity = { gt: 0 };

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' },
    });

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    res.json({
      products: products.map(withStockStatus),
      categories: categories,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id  (accepts uuid OR slug)
const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Try slug first, then UUID
    const product = await prisma.product.findFirst({
      where: {
        isActive: true,
        OR: [{ slug: id }, { id }],
      },
    });

    if (!product) throw createError(404, 'Product not found');

    res.json(withStockStatus(product));
  } catch (err) {
    next(err);
  }
};

module.exports = { listProducts, getProduct };
