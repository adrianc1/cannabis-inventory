const pool = require('./pool');

const getAllProducts = async () => {
	const { rows } = await pool.query('SELECT * FROM products');
	return rows;
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
	getAllProducts,
	getAllBrands,
	getAllCategories,
};
