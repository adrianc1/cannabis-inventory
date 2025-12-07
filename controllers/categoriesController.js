const db = require('../db/queries');

const getAllCategories = async (req, res) => {
	try {
		const categories = await db.getAllCategories();
		res.render('categories', { categories });
	} catch (error) {
		res.status(500).json({ error: 'Database Error' });
	}
};

const createCategoryForm = async (req, res) => {
	try {
		res.render('createCategoryForm');
	} catch (error) {
		console.error(error);
	}
};

module.exports = {
	getAllCategories,
	createCategoryForm,
};
