const express = require('express');
const categoriesController = require('../controllers/categoriesController');
const router = express.Router();

router.get('/', categoriesController.getAllCategories);
router.get('/create-category', categoriesController.createCategoryForm);
router.post('/create-category', categoriesController.insertCategory);
router.get('/:id/edit', categoriesController.editCategoryForm);
router.put('/:id', categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);
router.get('/:id', categoriesController.getCategory);

module.exports = router;
