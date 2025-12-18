const pool = require('./pool');

// Product Queries
const getAllProductsDB = async () => {
	try {
		const { rows } = await pool.query(`
			SELECT 
			p.id,
			p.name,
			p.description,
			p.unit,
			p.category_id,
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
			p.unit,
			brand_name,
			category_name,
			strain_name
			`);
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
			p.unit,
			p.brand_id,
			p.category_id,
			p.strain_id,
			brands.name AS brand_name,
			categories.name AS category_name,
			strains.name AS strain_name,
			inventory.quantity
			FROM products AS p
			LEFT JOIN brands ON p.brand_id = brands.id
			LEFT JOIN categories ON p.category_id = categories.id
			LEFT JOIN strains ON p.strain_id = strains.id
			LEFT JOIN inventory ON p.id = inventory.product_id
			WHERE p.id = $1`,
			[id]
		);
		return rows[0];
	} catch (error) {
		throw error;
	}
};

const insertProduct = async (
	name,
	description,
	unit,
	brandId,
	strainId,
	categoryId
) => {
	try {
		const result = await pool.query(
			`INSERT INTO products (name, description, unit, brand_id, strain_id, category_id)
			VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
			[name, description, unit, brandId, strainId, categoryId]
		);
		return result.rows[0];
	} catch (error) {
		throw error;
	}
};

// Update Product
const updateProduct = async (
	name,
	description,
	unit,
	brandId,
	strainId,
	categoryId,
	id
) => {
	console.log('starting product update...');
	const product = await pool.query(
		`UPDATE products 
   SET name = $1, 
       description = $2, 
       unit = $3, 
       brand_id = $4, 
       strain_id = $5, 
       category_id = $6
   WHERE id = $7`,
		[name, description, unit, brandId, strainId, categoryId, id]
	);

	return product;
};

// Delete Product
const deleteProduct = async (productId) => {
	const product = await pool.query('DELETE FROM products WHERE id = $1', [
		productId,
	]);
	return product;
};

// Brand Queries
const getAllBrands = async () => {
	const { rows } = await pool.query('SELECT * FROM brands');
	return rows;
};

const getBrand = async (brandId) => {
	const { rows } = await pool.query(
		`SELECT 
		p.id,
			p.name,
			p.description,
			p.unit,
			p.category_id,
			categories.name AS category_name,
			strains.name AS strain_name
			FROM products AS p
			LEFT JOIN strains ON p.strain_id = strains.id
			LEFT JOIN categories ON p.category_id = categories.id
			WHERE p.brand_id = $1
		
		`,
		[brandId]
	);
};

// Strain Queries
const getAllStrains = async () => {
	const { rows } = await pool.query('SELECT * FROM strains');
	return rows;
};

const getStrain = async (id) => {
	try {
		const { rows } = await pool.query(`SELECT * FROM strains WHERE id=$1`, [
			id,
		]);
		return rows[0];
	} catch (error) {
		throw error;
	}
};

const insertStrain = async (name, description, type) => {
	try {
		const result = await pool.query(
			`INSERT INTO strains (name, description, type)
			VALUES ($1, $2, $3) RETURNING *`,
			[name, description, type]
		);
		return result.rows[0];
	} catch (error) {
		throw error;
	}
};

const updateStrain = async (name, description, id) => {
	const strain = await pool.query(
		`UPDATE strains
		SET name = $1,
    	description = $2
		WHERE id = $3`,
		[name, description, id]
	);
};

const deleteStrain = async (id) => {
	const strain = await pool.query('DELETE FROM strains WHERE id = $1', [id]);
	return strain;
};

// Category Queries
const getAllCategories = async () => {
	const { rows } = await pool.query('SELECT * FROM categories');
	return rows;
};

const getCategory = async (id) => {
	try {
		const { rows } = await pool.query(
			`SELECT 
			p.name,
			p.description,
			p.unit,
			p.category_id,
			brands.name AS brand_name,
			categories.name AS category_name,
			strains.name AS strain_name,
			inventory.quantity
			FROM products AS p
			LEFT JOIN brands ON p.brand_id = brands.id
			LEFT JOIN categories ON p.category_id = categories.id
			LEFT JOIN strains ON p.strain_id = strains.id
			LEFT JOIN inventory ON p.id = inventory.product_id
			WHERE p.category_id = $1
			ORDER BY p.name`,
			[id]
		);
		return rows;
	} catch (error) {
		throw error;
	}
};

const getSingleCategory = async (id) => {
	try {
		const { rows } = await pool.query(
			`
			SELECT id, name, description FROM categories WHERE id=$1
			`,
			[id]
		);
		return rows[0];
	} catch (error) {
		console.error(error);
	}
};

const insertCategory = async (name, description) => {
	try {
		const result = await pool.query(
			`INSERT INTO categories (name, description)
			VALUES ($1, $2) RETURNING *`,
			[name, description]
		);
		return result.rows[0];
	} catch (error) {
		throw error;
	}
};

const updateCategory = async (name, description, id) => {
	const category = await pool.query(
		`UPDATE categories 
		SET name = $1,
    	description = $2
		WHERE id = $3`,
		[name, description, id]
	);
};

const deleteCategory = async (categoryId) => {
	const category = await pool.query('DELETE FROM categories WHERE id = $1', [
		categoryId,
	]);
	return category;
};

const createProductInventory = async (
	inventory_id,
	movement_type,
	quantity,
	notes
) => {
	const insert = await pool.query(
		'INSERT INTO inventory (product_id, location, quantity, cost_price, supplier_name) VALUES $1, $2, $3, $4, $5',
		[product_id, location, quantity, cost_price, supplier_name]
	);
};

const adjustProductInventory = async (
	inventory_id,
	movement_type,
	quantity,
	notes
) => {
	const adjust = await pool.querty(
		'INSERT INTO inventory_movements (inventory_id, movement_type, quantity, notes) VALUES $1, $2, $3, $4',
		[inventory_id, movement_type, quantity, notes]
	);
};
module.exports = {
	getAllProductsDB,
	getProductDB,
	getAllBrands,
	getAllStrains,
	getAllCategories,
	insertProduct,
	deleteProduct,
	updateProduct,
	getCategory,
	insertCategory,
	deleteCategory,
	insertStrain,
	getStrain,
	deleteStrain,
	getBrand,
	getSingleCategory,
	updateCategory,
	updateStrain,
	createProductInventory,
};
