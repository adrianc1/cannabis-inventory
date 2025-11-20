const db = require('../db/queries');

const getAllCategories = async (req, res) => {
	const categories = await db.getAllCategories();
	console.log('Category: ', categories);
	res.json({ message: 'categories!' });
};
