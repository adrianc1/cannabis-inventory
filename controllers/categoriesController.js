const db = require('../db/queries');

const getAllCategories = async (req, res) => {
	try {
		const categories = await db.getAllCategories();
		res.render('categories', { categories });
	} catch (error) {
		res.status(500).json({ error: 'Database Error' });
	}
};

const getCategory = async (req, res) => {
	try {
		console.log('Fetching category...');

		const category = await db.getCategory(req.params.id);

		if (!category) {
			res.status(404).json({ error: 'Category not foud' });
			return;
		}

		console.log(category);
		res.render('categoryProducts', { category });
	} catch (error) {}
};

const createCategoryForm = async (req, res) => {
	try {
		res.render('createCategoryForm');
	} catch (error) {
		res.status(500).json({ error: 'Database Error' });
	}
};

module.exports = {
	getAllCategories,
	createCategoryForm,
	getCategory,
};
