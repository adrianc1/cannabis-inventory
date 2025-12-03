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
			strains.name AS strain_name,
			COALESCE(SUM(i.quantity), 0) AS product_qty
			FROM products AS p
			LEFT JOIN brands ON p.brand_id = brands.id
			LEFT JOIN categories ON p.category_id = categories.id
			LEFT JOIN strains ON p.strain_id = strains.id
			LEFT JOIN inventory AS i ON p.id = i.product_id
			GROUP BY p.id,
			p.name,
			p.description,
			p.price,
			p.unit,
			brand_name,
			category_name,
			strain_name
			`);
		console.log(rows);
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
			strains.name AS strain_name,
			inventory.quantity
			FROM products AS p
			LEFT JOIN brands ON p.brand_id = brands.id
			LEFT JOIN categories ON p.category_id = categories.id
			LEFT JOIN strains ON p.strain_id = strains.id
			RIGHT JOIN inventory ON p.id = inventory.product_id
			WHERE p.id = $1`,
			[id]
		);
		console.log(rows[0]);
		return rows[0];
	} catch (error) {
		throw error;
	}
};

const insertProduct = async (name, description, price, unit) => {
	try {
		await pool.query(
			`INSERT INTO products (name, description, price, unit)
			VALUES ($1, $2, $3, $4) RETURNING *`,
			[name, description, price, unit]
		);
	} catch (error) {
		throw error;
	}
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
	insertProduct,
};
