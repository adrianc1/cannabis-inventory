const pool = require('./pool');

// Product Queries
const getAllProductsDB = async (user_id) => {
	try {
		const { rows } = await pool.query(
			`
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
			WHERE p.company_id=$1
			GROUP BY p.id,
			p.name,
			p.description,
			p.unit,
			brand_name,
			category_name,
			strain_name
			`,
			[user_id],
		);
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
			p.sku,
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
			[id],
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
	categoryId,
	userCompanyId,
	sku,
	quanity = 0,
) => {
	const client = await pool.connect();

	try {
		await client.query('BEGIN');
		const result = await client.query(
			`INSERT INTO products (name, description, unit, brand_id, strain_id, category_id, company_id, sku)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
			[
				name,
				description,
				unit,
				brandId,
				strainId,
				categoryId,
				userCompanyId,
				sku,
			],
		);
		const product = result.rows[0];

		await client.query(
			`INSERT INTO inventory (product_id, company_id, quantity) VALUES ($1, $2, $3)`,
			[product.id, userCompanyId, quanity],
		);
		await client.query('COMMIT');
		return product;
	} catch (error) {
		throw error;
	} finally {
		client.release();
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
	id,
	quantity = 0,
) => {
	const client = await pool.connect();

	console.log('starting product update...');

	try {
		await client.query('BEGIN');
		const product = await client.query(
			`UPDATE products 
   SET name = $1, 
       description = $2, 
       unit = $3, 
       brand_id = $4, 
       strain_id = $5, 
       category_id = $6
   WHERE id = $7`,
			[name, description, unit, brandId, strainId, categoryId, id],
		);

		await client.query(
			`UPDATE inventory 
            SET quantity = $1 
			WHERE product_id = $2
`,
			[quantity, id],
		);

		await client.query('COMMIT');
		return product;
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
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
	const { rows } = await pool.query(`SELECT * FROM brands WHERE id=$1 `, [
		brandId,
	]);
	return rows[0];
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
			[name, description, type],
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
		[name, description, id],
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
			[id],
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
			[id],
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
			[name, description],
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
		[name, description, id],
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
	notes,
) => {
	const insert = await pool.query(
		'INSERT INTO inventory (product_id, location, quantity, cost_price, supplier_name) VALUES $1, $2, $3, $4, $5',
		[product_id, location, quantity, cost_price, supplier_name],
	);
};

const applyInventoryMovement = async ({
	product_id,
	inventory_id = null,
	company_id,
	location = 'backroom',
	batch,
	delta,
	movement_type,
	notes,
	cost_per_unit = null,
	userId,
}) => {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');

		let invId, newQty;

		if (inventory_id) {
			// existing row → update
			const { rows } = await client.query(
				`SELECT quantity FROM inventory WHERE id=$1 FOR UPDATE`,
				[inventory_id],
			);

			if (!rows.length) throw new Error('Inventory not found');

			newQty = rows[0].quantity + delta;
			if (newQty < 0) throw new Error('Inventory cannot be negative');

			await client.query(
				`UPDATE inventory
         SET quantity = $1,
             cost_price = COALESCE($2, cost_price),
             supplier_name = COALESCE($3, supplier_name),
             last_updated = NOW()
         WHERE id = $4`,
				[newQty, cost_per_unit, null, inventory_id],
			);

			invId = inventory_id;
		} else {
			// find batch row by product + location + batch
			const { rows } = await client.query(
				`SELECT id, quantity FROM inventory
         WHERE product_id=$1 AND location=$2 AND lot_number=$3 FOR UPDATE`,
				[product_id, location, batch],
			);

			if (rows.length) {
				// batch exists → update quantity
				invId = rows[0].id;
				newQty = rows[0].quantity + delta;

				await client.query(
					`UPDATE inventory
           SET quantity=$1,
               cost_price=COALESCE($2, cost_price),
               supplier_name=COALESCE($3, supplier_name),
               last_updated=NOW()
           WHERE id=$4`,
					[newQty, cost_per_unit, null, invId],
				);
			} else {
				// new batch → insert row
				const { rows: insertRows } = await client.query(
					`INSERT INTO inventory
           (product_id, company_id, location, quantity, cost_price, supplier_name, lot_number)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           RETURNING id, quantity`,
					[product_id, company_id, location, delta, cost_per_unit, null, batch],
				);
				invId = insertRows[0].id;
				newQty = insertRows[0].quantity;
			}
		}

		// log movement
		await client.query(
			`INSERT INTO inventory_movements
       (inventory_id, movement_type, quantity, cost_per_unit, notes, user_id)
       VALUES ($1,$2,$3,$4,$5,$6)`,
			[invId, movement_type, delta, cost_per_unit, notes, userId],
		);

		await client.query('COMMIT');
		return { inventoryId: invId, newQty };
	} catch (err) {
		await client.query('ROLLBACK');
		throw err;
	} finally {
		client.release();
	}
};

const getInventoryByBatch = async (product_id, location, batch) => {
	const { rows } = pool.query(
		`SELECT * FROM inventory WHERE product_id=$1 AND location=$2 AND lot_number=$3`,
		[product_id, location, batch],
	);
	return rows[0] || null;
};

const adjustProductInventory = async (
	inventory_id,
	movement_type,
	quantity,
	notes,
	userId,
) => {
	const client = await pool.connect();

	try {
		await client.query('BEGIN');

		const current = await client.query(
			`SELECT quantity FROM inventory WHERE id=$1`,
			[inventory_id],
		);

		if (current.rows.length === 0) {
			throw new Error('Inventory record not found');
		}

		if (quantity < 0) {
			throw new Error('New quantity cannot be negative');
		}

		const currentQty = current.rows[0].quantity;
		const delta = quantity - currentQty;

		const movementUpdate = await client.query(
			`INSERT INTO inventory_movements (inventory_id, movement_type, quantity, notes, user_id) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
			[inventory_id, movement_type, delta, notes, userId],
		);

		const inventoryUpdate = await client.query(
			`UPDATE inventory 
             SET quantity = $1 
             WHERE id = $2`,
			[quantity, inventory_id],
		);

		await client.query('COMMIT');
		return movementUpdate.rows[0];
	} catch (e) {
		await client.query('ROLLBACK');
		throw e;
	} finally {
		client.release();
	}
};

const receiveInventory = async (
	inventory_id,
	quantity,
	batch,
	unit_price,
	vendor,
	reason = 'Receive',
	notes,
	userId,
) => {
	const client = await pool.connect();

	try {
		await client.query('BEGIN');

		const current = await client.query(
			`SELECT quantity FROM inventory WHERE id=$1`,
			[inventory_id],
		);

		if (current.rows.length === 0) {
			throw new Error('Inventory record not found');
		}

		if (quantity < 0) {
			throw new Error('Inventory cannot be negative');
		}

		const currentQty = current.rows[0].quantity;
		const delta = Number(quantity);
		const newQty = Number(currentQty) + delta;

		await client.query(
			`INSERT INTO inventory_movements (inventory_id, movement_type, quantity, cost_per_unit, notes, user_id) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
			[inventory_id, reason, delta, unit_price, notes, userId],
		);

		await client.query(
			`UPDATE inventory 
     SET quantity = $1,
         cost_price = $2,
         supplier_name = $3,
         lot_number = $4
     WHERE id = $5`,
			[newQty, unit_price, vendor, batch, inventory_id],
		);

		await client.query('COMMIT');
		return { newQty, delta };
	} catch (e) {
		await client.query('ROLLBACK');
		throw e;
	} finally {
		client.release();
	}
};

const getInventoryId = async (productId) => {
	const { rows } = await pool.query(
		`SELECT * FROM inventory WHERE product_id=$1`,
		[productId],
	);
	return rows;
};

const getProductInventory = async (productId) => {
	const { rows } = await pool.query(
		`
		SELECT *, COALESCE(cost_price, 0) AS cost_price
		FROM inventory 
		WHERE product_id=$1
		ORDER BY (location, lot_number)
		`,
		[productId],
	);

	return rows;
};

const createCompany = async (companyName, licenseNumber) => {
	const { rows } = await pool.query(
		`INSERT INTO companies(name, license_number) VALUES ($1, $2) `,
		[companyName, licenseNumber],
	);

	return rows[0];
};

const insertUser = async (firstName, lastName, email, password_hash) => {
	const { rows } = await pool.query(
		`
		INSERT INTO companies (first_name, last_name, email, password_hash ) VALUES $1, $2, $3, $4 
		`,
		[firstName, lastName, email, password_hash],
	);
	return rows[0];
};

const signupAdmin = async (
	firstName,
	lastName,
	email,
	password_hash,
	companyName,
	licenseNumber,
	role = 'admin',
) => {
	const client = await pool.connect();

	try {
		await client.query('BEGIN');

		const companyResult = await client.query(
			`INSERT INTO companies(name, license_number) VALUES ($1, $2) RETURNING id `,
			[companyName, licenseNumber],
		);

		const companyId = companyResult.rows[0].id;

		const { rows } = await client.query(
			`
		INSERT INTO users (first_name, last_name, email, password_hash, company_id, role) VALUES ($1, $2, $3, $4, $5, $6) 
		`,
			[firstName, lastName, email, password_hash, companyId, role],
		);

		await client.query('COMMIT');
		return rows[0];
	} catch (error) {
		throw error;
	} finally {
		client.release();
	}
};

const getUserByEmail = async (email) => {
	const { rows } = await pool.query(`SELECT * FROM users WHERE email=$1`, [
		email,
	]);
	return rows[0];
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
	signupAdmin,
	getUserByEmail,
	adjustProductInventory,
	getInventoryId,
	receiveInventory,
	getProductInventory,
	applyInventoryMovement,
	getInventoryByBatch,
};
