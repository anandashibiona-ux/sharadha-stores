const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');

router.get('/', categoriesController.getAllCategories);
router.post('/', categoriesController.createCategory);
router.delete('/:id', categoriesController.deleteCategory);

module.exports = router;
