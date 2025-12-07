const express = require('express');
const categoriesController = require('../controllers/categoriesController.js');
const router = express.Router();

router.get('/', categoriesController.getAllCategories);
router.get('/create-category', categoriesController.createCategoryForm);
// router.post('/create-category', categoriesController.insertProduct);
// router.get('/:id/edit', categoriesController.editProductForm);
// router.put('/:id', categoriesController.updateProduct);
// router.delete('/:id', categoriesController.deleteProduct);
// router.get('/:id', categoriesController.getProduct);

module.exports = router;
