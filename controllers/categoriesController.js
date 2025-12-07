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

const insertCategory = async (req, res) => {
	try {
		const { name, description } = req.body;

		console.log(req.body);
		const result = await db.insertCategory(name, description);
		res.redirect(`/categories/${result.id}`);
	} catch (error) {}
};

module.exports = {
	getAllCategories,
	createCategoryForm,
	getCategory,
	insertCategory,
};
