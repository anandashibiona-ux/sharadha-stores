const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } }
      },
      orderBy: { name: 'asc' }
    });
    const formatted = categories.map(c => ({
      id: c.id,
      name: c.name,
      product_count: c._count.products
    }));
    res.json(formatted);
  } catch (err) {
    console.error('[GET /api/categories]', err.message);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Category name is required' });
  try {
    const category = await prisma.category.create({ data: { name } });
    res.status(201).json({ ...category, product_count: 0 });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: `"${name}" already exists` });
    }
    console.error('[POST /api/categories]', err.message);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return res.status(400).json({
        error: `Cannot delete — ${count} product(s) use this category. Reassign them first.`
      });
    }
    await prisma.category.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/categories/:id]', err.message);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

module.exports = { getAllCategories, createCategory, deleteCategory };
