const db = require('../db/queries');

const getAllCategories = async (req, res) => {
	try {
		const categories = await db.getAllCategories();
		res.render('categories/categories', { categories });
	} catch (error) {
		res.status(500).json({ error: 'Database Error' });
	}
};

const getCategory = async (req, res) => {
	try {
		console.log('Fetching category...');

		const categoryId = req.params.id;
		const category = await db.getCategory(req.params.id);

		if (!category) {
			res.status(404).json({ error: 'Category not found' });
			return;
		}

		console.log(category);
		res.render('categories/categoryProducts', { category, categoryId });
	} catch (error) {}
};

const createCategoryForm = async (req, res) => {
	try {
		res.render('categories/createCategoryForm');
	} catch (error) {
		res.status(500).json({ error: 'Database Error' });
	}
};

const editCategoryForm = async (req, res) => {
	let cat = await db.getCategory(req.params.id);
	const category = cat[0];
	console.log(category);

	res.render('categories/editCategoryForm', { category });
};

const insertCategory = async (req, res) => {
	try {
		const { name, description } = req.body;

		console.log(req.body);
		const result = await db.insertCategory(name, description);
		res.redirect(`/categories/${result.id}`);
	} catch (error) {}
};

const updateCategory = async (req, res) => {
	const id = req.params.id;
	const { name, description } = req.body;
	await db.updateCategory(name, description, id);
	res.status(200).json({ success: true });
};

const deleteCategory = async (req, res) => {
	try {
		console.log('deleting', req.params);
		await db.deleteCategory(req.params.id);
		res.render();
	} catch (error) {
		res.json({ error: 'there is an error.' });
	}
};

module.exports = {
	getAllCategories,
	createCategoryForm,
	getCategory,
	insertCategory,
	deleteCategory,
	updateCategory,
	editCategoryForm,
};
