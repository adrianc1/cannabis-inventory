const pool = require('./pool');

const getAllProductsDB = async () => {
	try {
		const { rows } = await pool.query('SELECT * FROM products');
		return rows;
	} catch (error) {
		console.error('Database error', error);
		throw error;
	}
};

const getAllBrands = async () => {
	const { rows } = await pool.query('SELECT * FROM products');
	return rows;
};

const getAllCategories = async () => {
	const { rows } = await pool.query('SELECT * FROM products');
	return rows;
};
module.exports = {
	getAllProductsDB,
	getAllBrands,
	getAllCategories,
};
