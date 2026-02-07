const db = require('../db/queries');

const getAllBrands = async (req, res) => {
	const brands = await db.getAllBrands(req.user.company_id);
	res.render('brands/allBrands', { message: 'brands!', brands });
};

module.exports = { getAllBrands };
