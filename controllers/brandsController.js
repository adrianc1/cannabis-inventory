const db = require('../db/queries');

const getAllBrands = async (req, res) => {
	const brands = await db.getAllBrands();
	console.log('brands: ', brands);
	res.json({ message: 'brands!' });
};
