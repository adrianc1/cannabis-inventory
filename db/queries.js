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

const getProductDB = async (id) => {
	try {
		const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [
			id,
		]);
		return rows;
	} catch (error) {}
};

const getAllBrands = async () => {
	const { rows } = await pool.query('SELECT * FROM brands');
	return rows;
};

const getAllCategories = async () => {
	const { rows } = await pool.query('SELECT * FROM categories');
	return rows;
};
module.exports = {
	getAllProductsDB,
	getProductDB,
	getAllBrands,
	getAllCategories,
};
