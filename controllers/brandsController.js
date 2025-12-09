const db = require('../db/queries');

const getAllBrands = async (req, res) => {
	const brands = await db.getAllBrands();
	res.render('allBrands', { message: 'brands!', brands });
};

module.exports = { getAllBrands };
