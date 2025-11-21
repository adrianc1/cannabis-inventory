const db = require('../db/queries');

const getAllProducts = async (req, res) => {
	try {
		const products = await db.getAllProductsDB();
		res.render('index', { message: 'All Products', products });
	} catch (error) {
		res.status(500).json({ error: 'Database error' });
	}
};

module.exports = getAllProducts;
