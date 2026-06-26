const prisma = require('../db/prisma');
const { createError } = require('../utils/httpError');

/**
 * Decrement stock for a list of order items within a Prisma transaction.
 * Throws a 409 error if any product has insufficient stock.
 *
 * @param {import('@prisma/client').Prisma.TransactionClient} tx - Prisma transaction client
 * @param {Array<{ productId: string, quantity: number }>} items
 */
const decrementStock = async (tx, items) => {
  for (const item of items) {
    const product = await tx.product.findUnique({
      where: { id: item.productId },
      select: { id: true, name: true, stockQuantity: true },
    });

    if (!product) {
      throw createError(404, `Product not found: ${item.productId}`);
    }

    if (product.stockQuantity < item.quantity) {
      throw createError(
        409,
        `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, requested: ${item.quantity}.`
      );
    }

    await tx.product.update({
      where: { id: item.productId },
      data: { stockQuantity: { decrement: item.quantity } },
    });
  }
};

/**
 * Restore stock for order items (e.g., on cancellation).
 *
 * @param {Array<{ productId: string, quantity: number }>} items
 */
const restoreStock = async (items) => {
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stockQuantity: { increment: item.quantity } },
    });
  }
};

module.exports = { decrementStock, restoreStock };
