const express = require('express');
const categoriesController = require('../controllers/categoriesController.js');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/authMiddleware');

router.get('/', ensureAuthenticated, categoriesController.getAllCategories);
router.get(
	'/create-category',
	ensureAuthenticated,
	categoriesController.createCategoryForm,
);
router.post('/create-category', categoriesController.insertCategory);
router.get(
	'/:id/edit',
	ensureAuthenticated,
	categoriesController.editCategoryForm,
);
router.put('/:id', categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);
router.get('/:id', ensureAuthenticated, categoriesController.getCategory);

module.exports = router;
