const db = require('../db/queries');

const getAllProducts = async (req, res) => {
	try {
		const products = await db.getAllProductsDB();
		console.log(products);
		res.render('products', { message: 'All Products', products });
	} catch (error) {
		res.status(500).json({ error: 'Database error' });
	}
};

const getProduct = async (req, res) => {
	try {
		const product = await db.getProductDB(req.params.id);

		if (!product) {
			res.status(404).json({ error: 'Product not found' });
			return;
		}
		console.log(product);
		res.render('product', { product });
	} catch (error) {
		res.status(500).json({ error: 'Database error retreiving single product' });
	}
};
const createProduct = async (req, res) => {};
const updateProduct = async (req, res) => {};
const deleteProduct = async (req, res) => {};

module.exports = {
	getAllProducts,
	getProduct,
	createProduct,
	updateProduct,
	deleteProduct,
};
