const db = require('../db/queries');

const getAllProducts = async (req, res) => {
	const products = await db.getAllProducts();
	console.log('products: ', products);
	res.json({ message: 'products!' });
};
