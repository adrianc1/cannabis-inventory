const pool = require('./pool');

const getProductWithInventoryDB = async (id) => {
	try {
		const { rows } = await pool.query(
			`
      SELECT 
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
        COALESCE(SUM(i.quantity),0) AS total_quantity,
        COALESCE(SUM(i.quantity * i.cost_price),0) AS total_valuation,
        CASE 
          WHEN SUM(i.quantity) > 0 THEN ROUND(SUM(i.quantity * i.cost_price) / SUM(i.quantity), 2)
          ELSE 0
        END AS average_cost
      FROM products p
      LEFT JOIN brands ON p.brand_id = brands.id
      LEFT JOIN categories ON p.category_id = categories.id
      LEFT JOIN strains ON p.strain_id = strains.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.id = $1
      GROUP BY p.id, p.name, p.sku, p.unit, p.brand_id, p.category_id, p.strain_id, brand_name, category_name, strain_name
      `,
			[id],
		);
		return rows[0];
	} catch (error) {
		throw error;
	}
};

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
        COALESCE(SUM(i.quantity),0) AS product_qty,
        COALESCE(SUM(i.quantity * COALESCE(i.cost_price,0)),0)::FLOAT AS total_valuation,
        CASE 
          WHEN SUM(i.quantity) > 0 THEN ROUND(SUM(i.quantity * COALESCE(i.cost_price,0)) / SUM(i.quantity), 2)
          ELSE 0
        END::FLOAT AS average_cost
      FROM products AS p
      LEFT JOIN brands ON p.brand_id = brands.id
      LEFT JOIN categories ON p.category_id = categories.id
      LEFT JOIN strains ON p.strain_id = strains.id
      LEFT JOIN inventory AS i ON p.id = i.product_id
      WHERE p.company_id=$1
      GROUP BY 
        p.id,
        p.name,
        p.description,
        p.unit,
        p.category_id,
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

const getProductDB = async (id, companyId) => {
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
			strains.name AS strain_name
			FROM products AS p
			LEFT JOIN brands ON p.brand_id = brands.id
			LEFT JOIN categories ON p.category_id = categories.id
			LEFT JOIN strains ON p.strain_id = strains.id
			WHERE p.id = $1
			AND p.company_id=$2`,
			[id, companyId],
		);
		return rows[0];
	} catch (error) {
		throw error;
	}
};

// NEED TO CREATED AND FINISH THE SPLIT TRANSACTION

const splitPackageTransaction = async (selectedBatch, splits, userId) => {
	const client = await pool.connect();

	try {
		await client.query('BEGIN');
		const lotNumber = selectedBatch.lot_number;
		// set parent batch
		const parentBatch = await client.query(
			`SELECT * FROM inventory WHERE lot_number=$1 FOR UPDATE`,
			[lotNumber],
		);

		if (parentBatch.rows.length === 0) {
			throw new Error('Package not found');
		}

		const parent = parentBatch.rows[0];
		//calc total weight used
		const totalUsed = splits.reduce(
			(sum, s) => sum + s.packageSize * s.quantity,
			0,
		);

		if (totalUsed > parent.quantity) {
			throw new Error('Split exceeds available inventory');
		}

		// create child packages
		for (const split of splits) {
			const childQty = split.packageSize * split.quantity;
			const childResult = await client.query(
				`INSERT INTO inventory
				(product_id, company_id, status, quantity, package_size, unit, parent_lot_id, lot_number, cost_price)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
				[
					parent.product_id,
					parent.company_id,
					parent.status,
					childQty,
					split.packageSize,
					'g',
					parent.id,
					split.childLotNumber,
					parent.cost_price,
				],
			);

			const childInventoryId = childResult.rows[0].id;

			await client.query(
				`INSERT INTO inventory_movements(inventory_id, user_id, movement_type, quantity, cost_per_unit) VALUES ($1,$2,$3,$4,$5)`,
				[childInventoryId, userId, 'split', childQty, parent.cost_price],
			);
		}

		//update parent remaining qty
		await client.query(
			`UPDATE inventory
			SET quantity = quantity - $1
			WHERE lot_number=$2`,
			[totalUsed, parent.lot_number],
		);

		console.log('selected', selectedBatch);
		console.log('parent', parent);

		await client.query('COMMIT');
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
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
	quantity = 0,
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
			[product.id, userCompanyId, quantity],
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
   WHERE id = $7
`,
			[name, description, unit, brandId, strainId, categoryId, id],
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
	const product = await pool.query(
		`DELETE FROM products 
		WHERE id = $1
		AND NOT EXISTS (
		SELECT 1 
		FROM inventory
		WHERE product_id=$1
		AND quantity > 0)
		RETURNING id;`,
		[productId],
	);
	return product;
};

// Brand Queries
const getAllBrands = async (companyId) => {
	const { rows } = await pool.query(
		'SELECT * FROM brands WHERE company_id=$1',
		[companyId],
	);
	return rows;
};

const getBrand = async (brandId, companyId) => {
	const { rows } = await pool.query(
		`SELECT * FROM brands WHERE id=$1 AND company_id=$2 `,
		[brandId, companyId],
	);
	return rows[0];
};

const insertBrand = async (name, companyId, description) => {
	try {
		const result = await pool.query(
			`INSERT INTO brands (name, company_id, description)
			VALUES ($1, $2, $3) RETURNING *`,
			[name, companyId, description],
		);
		return result.rows[0];
	} catch (error) {
		throw error;
	}
};

// Strain Queries
const getAllStrains = async (companyId) => {
	const { rows } = await pool.query(
		'SELECT * FROM strains WHERE company_id=$1',
		[companyId],
	);
	return rows;
};

const getStrain = async (id, companyId) => {
	try {
		const { rows } = await pool.query(
			`SELECT * FROM strains WHERE id=$1 AND company_id=$2`,
			[id, companyId],
		);
		return rows[0];
	} catch (error) {
		throw error;
	}
};

const insertStrain = async (name, companyId, description, type) => {
	try {
		const result = await pool.query(
			`INSERT INTO strains (name, company_id, description, type)
			VALUES ($1, $2, $3, $4) RETURNING *`,
			[name, companyId, description, type],
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
const getAllCategories = async (companyId) => {
	const { rows } = await pool.query(
		'SELECT * FROM categories WHERE company_id=$1',
		[companyId],
	);
	return rows;
};

const getCategory = async (id, companyId) => {
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
			AND p.company_id=$2
			ORDER BY p.name`,
			[id, companyId],
		);
		return rows;
	} catch (error) {
		throw error;
	}
};

const getSingleCategory = async (id, companyId) => {
	try {
		const { rows } = await pool.query(
			`
			SELECT id, name, description FROM categories WHERE id=$1 AND company_id=$2
			`,
			[id, companyId],
		);
		return rows[0];
	} catch (error) {
		console.error(error);
	}
};

const insertCategory = async (name, companyId) => {
	try {
		const result = await pool.query(
			`INSERT INTO categories (name, company_id)
			VALUES ($1, $2) RETURNING *`,
			[name, companyId],
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
	targetQty,
	movement_type,
	notes,
	cost_per_unit = null,
	userId,
	status,
}) => {
	const client = await pool.connect();
	let delta;
	console.log('LIVE FROM HE DB', status);
	try {
		await client.query('BEGIN');

		let newQty, updateInventory;
		let invId = inventory_id;

		if (inventory_id) {
			invId = inventory_id;
			const { rows } = await client.query(
				`SELECT quantity FROM inventory WHERE id=$1 FOR UPDATE`,
				[inventory_id],
			);

			if (!rows.length) throw new Error('Inventory not found');

			const currentQty = parseFloat(rows[0].quantity);

			delta = targetQty - currentQty;
			newQty = targetQty;

			if (newQty < 0) throw new Error('Inventory cannot be negative');

			if (!status) {
				status = newQty <= 0 ? 'inactive' : 'active';
			}

			console.log('updating inventory with:', status);

			const { rows: updated } = await client.query(
				`UPDATE inventory
         SET quantity = $1,
             cost_price = COALESCE($2, cost_price),
             supplier_name = COALESCE($3, supplier_name),
			 status = $4,
             updated_at = NOW()
         WHERE id = $5
		 RETURNING *`,
				[newQty, cost_per_unit, null, status, invId],
			);

			updateInventory = updated[0];
			console.log('currentqty:', currentQty);
			console.log('newQty:', newQty);
			console.log('delta:', delta);
			console.log(updateInventory);

			await client.query(
				`INSERT INTO inventory_movements (inventory_id, movement_type, quantity, cost_per_unit, notes, user_id) VALUES ($1,$2,$3,$4,$5,$6)`,
				[invId, movement_type, delta, cost_per_unit, notes, userId],
			);
		} else {
			const { rows } = await client.query(
				`SELECT id, quantity FROM inventory
         WHERE product_id=$1 AND location=$2 AND lot_number=$3 FOR UPDATE`,
				[product_id, location, batch],
			);

			if (rows.length) {
				invId = rows[0].id;
				const currentQty = parseFloat(rows[0].quantity);
				const delta = targetQty - currentQty;
				newQty = targetQty;

				if (!status) status = newQty <= 0 ? 'inactive' : 'active';

				const { rows: updated } = await client.query(
					`UPDATE inventory
           SET quantity=$1,
               cost_price=COALESCE($2, cost_price),
               supplier_name=COALESCE($3, supplier_name),
			   status = $4,
               updated_at=NOW()
           WHERE id=$5
		   RETURNING *;`,
					[newQty, cost_per_unit, null, status, invId],
				);
				updateInventory = updated[0];

				await client.query(
					`INSERT INTO inventory_movements
           (inventory_id, movement_type, quantity, cost_per_unit, notes, user_id)
           VALUES ($1,$2,$3,$4,$5,$6)`,
					[invId, movement_type, delta, cost_per_unit, notes, userId],
				);
			} else {
				invId = null;
				const { rows: insertRows } = await client.query(
					`INSERT INTO inventory
           (product_id, company_id, location, quantity, cost_price, supplier_name, lot_number, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           RETURNING *`,
					[
						product_id,
						company_id,
						location,
						delta,
						cost_per_unit,
						null,
						batch,
						status || (targetQty <= 0 ? 'inactive' : 'active'),
					],
				);
				updateInventory = insertRows[0];
				invId = insertRows[0].id;
				newQty = parseFloat(insertRows[0].quantity);
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

		console.log(
			'update Inventory!!! this is the current status',
			updateInventory.status,
		);
		return {
			inventoryId: invId,
			newQty,
			status: updateInventory.status,
		};
	} catch (err) {
		await client.query('ROLLBACK');
		throw err;
	} finally {
		client.release();
	}
};

const getInventoryByBatch = async (product_id, location, batch) => {
	const { rows } = await pool.query(
		`SELECT * FROM inventory WHERE product_id=$1 AND location=$2 AND lot_number=$3`,
		[product_id, location, batch],
	);

	return rows[0] || null;
};

const getInventoryByLot = async (productId, lotNumber) => {
	const { rows } = await pool.query(
		`SELECT * FROM inventory WHERE product_id = $1 AND lot_number = $2`,
		[productId, lotNumber],
	);

	if (!rows || rows.length === 0) return null;

	return rows[0];
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
		currentStatus = rows[0].status;
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
		  AND lot_number IS NOT NULL
		  AND lot_number <> ''
		ORDER BY created_at, location
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
	getInventoryByLot,
	getProductWithInventoryDB,
	insertBrand,
	splitPackageTransaction,
};
