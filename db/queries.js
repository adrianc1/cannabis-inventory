const pool = require('./pool');

// Product Queries
const getAllProductsDB = async () => {
	try {
		const { rows } = await pool.query(`
			SELECT 
			p.id,
			p.name,
			p.description,
			p.price,
			p.unit,
			brands.name AS brand_name,
			categories.name AS category_name,
			strains.name AS strain_name
			FROM products AS p
			LEFT JOIN brands ON p.brand_id = brands.id
			LEFT JOIN categories ON p.category_id = categories.id
			LEFT JOIN strains ON p.strain_id = strains.id`);
		return rows;
	} catch (error) {
		console.error('Database error', error);
		throw error;
	}
};

const getProductDB = async (id) => {
	try {
		const { rows } = await pool.query(
			`SELECT 
			p.id,
			p.name,
			p.description,
			p.price,
			p.unit,
			brands.name AS brand_name,
			categories.name AS category_name,
			strains.name AS strain_name
			FROM products AS p
			LEFT JOIN brands ON p.brand_id = brands.id
			LEFT JOIN categories ON p.category_id = categories.id
			LEFT JOIN strains ON p.strain_id = strains.id
			WHERE p.id = $1`,
			[id]
		);
		return rows[0];
	} catch (error) {}
};

// Brand Queries
const getAllBrands = async () => {
	const { rows } = await pool.query('SELECT * FROM brands');
	return rows;
};

// Category Queries
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
