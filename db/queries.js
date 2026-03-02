const pool = require('./pool');

const getAuditTrail = async (productId) => {
	try {
		const { rows } = await pool.query(
			`SELECT 
    pk.id AS package_id,
    pk.package_tag,
    pk.quantity,
    pk.cost_price,
    pk.status,
    pk.location,
    pk.unit AS package_unit,
    pk.batch_id,
    pk.lot_number,
    pr.name AS product_name,
    pr.unit AS product_unit,
    b.name AS brand_name,
    s.name AS strain_name,
    c.name AS category_name,
    COALESCE(
      json_agg(
        json_build_object(
          'id', im.id,
          'movement_type', im.movement_type,
          'quantity', im.quantity,
		  'starting_quantity', im.starting_quantity,
		  'ending_quantity', im.ending_quantity,
          'cost_per_unit', im.cost_per_unit,
          'notes', im.notes,
          'user_id', im.user_id,
		  'user_name', u.first_name || ' ' || u.last_name,
          'created_at', im.created_at
        ) ORDER BY im.created_at DESC
      ) FILTER (WHERE im.id IS NOT NULL), '[]'
    ) AS movements
	FROM packages pk
	JOIN products pr ON pr.id = pk.product_id
	LEFT JOIN brands b ON b.id = pr.brand_id
	LEFT JOIN strains s ON s.id = pr.strain_id
	LEFT JOIN categories c ON c.id = pr.category_id
	LEFT JOIN inventory_movements im ON im.packages_id = pk.id
	LEFT JOIN users u ON u.id = im.user_id
	WHERE pk.product_id = $1
	GROUP BY pk.id, pr.name, pr.unit, b.name, s.name, c.name
	ORDER BY pk.id;
`,
			[productId],
		);

		return rows;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

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
      LEFT JOIN packages i ON p.id = i.product_id
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
      LEFT JOIN packages AS i ON p.id = i.product_id
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

const getAllPackages = async (company_id) => {
	try {
		const { rows } = await pool.query(
			`
            SELECT 
                pk.id,
                pk.package_tag,
				pk.product_id,
                pk.quantity,
                pk.unit,
                pk.location,
                pk.status,
                pk.cost_price,
                pk.lot_number,
                pk.created_at,
                -- Product Details
                p.name AS product_name,
                p.sku AS product_sku,
                c.name AS category_name,
				c.id AS category_id,
                b.name AS brand_name,
                s.name AS strain_name,
                -- Batch Details
                bt.batch_number,
                -- source Info 
                pk.parent_package_id,
                parent_pk.package_tag AS parent_package_tag
            FROM packages AS pk
            INNER JOIN products AS p ON pk.product_id = p.id
            LEFT JOIN categories AS c ON p.category_id = c.id
            LEFT JOIN brands AS b ON p.brand_id = b.id
            LEFT JOIN strains AS s ON p.strain_id = s.id
            LEFT JOIN batches AS bt ON pk.batch_id = bt.id
            LEFT JOIN packages AS parent_pk ON pk.parent_package_id = parent_pk.id
            WHERE pk.company_id = $1 
            ORDER BY pk.created_at DESC;
            `,
			[company_id],
		);
		return rows;
	} catch (error) {
		console.error('Database error fetching packages:', error);
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

const splitPackageTransaction = async (selectedPackage, splits, userId) => {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		// set source package
		const sourcePackage = await client.query(
			`SELECT * FROM packages WHERE id=$1 FOR UPDATE`,
			[selectedPackage.id],
		);

		if (sourcePackage.rows.length === 0) {
			throw new Error('Package not found');
		}

		const source = sourcePackage.rows[0];
		const parentStartingQty = parseFloat(source.quantity);

		const totalUsed = splits.reduce((sum, s) => sum + Number(s.totalWeight), 0);

		if (totalUsed > parentStartingQty) {
			throw new Error('Split exceeds available inventory');
		}
		const parentEndingQty = parentStartingQty - totalUsed;

		// create child packages
		for (const split of splits) {
			const childQty = split.totalWeight;

			const childResult = await client.query(
				`INSERT INTO packages
				(product_id, company_id, status, quantity, package_size, unit, parent_package_id, lot_number, cost_price, batch_id, package_tag)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
				[
					source.product_id,
					source.company_id,
					source.status,
					childQty,
					split.packageSize,
					source.unit,
					source.id,
					split.childLotNumber,
					source.cost_price,
					source.batch_id,
					split.package_tag,
				],
			);

			const childInventoryId = childResult.rows[0].id;

			await client.query(
				`INSERT INTO inventory_movements(packages_id, user_id, movement_type, quantity, cost_per_unit, starting_quantity, ending_quantity) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
				[
					childInventoryId,
					userId,
					'split',
					childQty,
					source.cost_price,
					0,
					childQty,
				],
			);
		}

		//update source remaining qty
		await client.query(
			`UPDATE packages
			SET quantity = $1
			WHERE id=$2`,
			[parentEndingQty, source.id],
		);

		await client.query(
			`INSERT INTO inventory_movements(packages_id, user_id, movement_type, quantity, cost_per_unit, starting_quantity, ending_quantity)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
			[
				source.id,
				userId,
				'split_deduct',
				-totalUsed,
				source.cost_price,
				parentStartingQty,
				parentEndingQty,
			],
		);

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
	// batchId,
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

		// await client.query(
		// 	`INSERT INTO packages (product_id, company_id, quantity, batch_id) VALUES ($1, $2, $3, $4)`,
		// 	[product.id, userCompanyId, quantity, batchId],
		// );
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
	company_id,
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
       category_id = $6,
	   company_id = $7
   WHERE id = $8
`,
			[name, description, unit, brandId, strainId, categoryId, company_id, id],
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
		FROM packages
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

const getCategoryById = async (id, companyId) => {
	const { rows } = await pool.query(
		`SELECT id, name FROM categories WHERE id=$1 AND company_id=$2`,
		[id, companyId],
	);
	return rows[0];
};

const getCategory = async (id, companyId) => {
	try {
		const { rows } = await pool.query(
			`SELECT 
            p.id,
            p.name,
            p.description,
            p.unit,
            p.category_id,
            p.sku,
            b.name AS brand_name,
            c.name AS category_name,
            s.name AS strain_name,
            SUM(pk.quantity) AS total_quantity  -- useful to show total stock per product
            FROM products AS p
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN strains s ON p.strain_id = s.id
            LEFT JOIN packages pk ON p.id = pk.product_id AND pk.status = 'active'
            WHERE p.category_id = $1
            AND p.company_id = $2
            GROUP BY p.id, b.name, c.name, s.name
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

const insertCategory = async (name, companyId, description) => {
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

// finish fixing applyinventorymovement blocks with starting and ending qty
const applyInventoryMovement = async ({
	package_tag,
	product_id,
	packages_id = null,
	batch_id,
	company_id,
	location = 'backroom',
	batch,
	targetQty,
	movement_type,
	notes,
	cost_per_unit = null,
	userId,
	status,
	package_size,
	unit,
}) => {
	const client = await pool.connect();
	let delta;
	try {
		await client.query('BEGIN');

		console.log('debug:', packages_id);

		let invId = packages_id;
		let newQty;
		let startingQty = 0;
		let endingQty = 0;
		delta = 0;
		let updateInventory;

		if (packages_id) {
			invId = packages_id;

			const { rows } = await client.query(
				`SELECT quantity FROM packages WHERE id=$1 FOR UPDATE`,
				[packages_id],
			);

			if (!rows.length) throw new Error('Inventory not found');

			startingQty = Number(rows[0].quantity);
			endingQty = Number(targetQty);
			delta = endingQty - startingQty;

			if (endingQty < 0) throw new Error('Inventory cannot be negative');

			newQty = endingQty;
			status = status || (newQty <= 0 ? 'inactive' : 'active');

			const { rows: updatedPackage } = await client.query(
				`UPDATE packages
				 SET quantity = $1,
				 unit = $2,
				 cost_price=COALESCE($3, cost_price),
				 status = $4
				 WHERE id=$5
				 RETURNING *;`,
				[endingQty, unit, cost_per_unit, status, packages_id],
			);

			await client.query(
				`INSERT INTO inventory_movements
     (packages_id, movement_type, quantity, cost_per_unit, notes, user_id, starting_quantity, ending_quantity)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
				[
					packages_id,
					movement_type,
					delta,
					cost_per_unit,
					notes,
					userId,
					startingQty,
					endingQty,
				],
			);
		} else {
			const { rows } = await client.query(
				`SELECT id, quantity FROM packages
         WHERE product_id=$1 AND location=$2 AND lot_number=$3 FOR UPDATE`,
				[product_id, location, batch],
			);

			if (rows.length) {
				invId = rows[0].id;
				const currentQty = parseFloat(rows[0].quantity);
				delta = targetQty - currentQty;
				newQty = Number(targetQty);

				if (!status) status = newQty <= 0 ? 'inactive' : 'active';

				const { rows: updated } = await client.query(
					`UPDATE packages
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
     (packages_id, movement_type, quantity, cost_per_unit, notes, user_id, starting_quantity, ending_quantity)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
					[
						invId,
						movement_type,
						delta,
						cost_per_unit,
						notes,
						userId,
						currentQty,
						newQty,
					],
				);
			} else {
				invId = null;
				delta = targetQty;
				const { rows: insertRows } = await client.query(
					`INSERT INTO packages
           ( product_id, package_tag, company_id, location, quantity, cost_price, package_size, lot_number, status, batch_id, unit)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, $11)
           RETURNING *`,
					[
						product_id,
						package_tag,
						company_id,
						location,
						targetQty,
						cost_per_unit,
						package_size,
						batch,
						status || (targetQty <= 0 ? 'inactive' : 'active'),
						batch_id,
						unit,
					],
				);
				updateInventory = insertRows[0];
				invId = insertRows[0].id;
				newQty = parseFloat(insertRows[0].quantity);

				// log movement
				await client.query(
					`INSERT INTO inventory_movements
     (packages_id, movement_type, quantity, cost_per_unit, notes, user_id, starting_quantity, ending_quantity)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
					[
						invId,
						movement_type,
						delta,
						cost_per_unit,
						notes,
						userId,
						startingQty,
						delta,
					],
				);
			}
		}

		await client.query('COMMIT');
		return {
			inventoryId: invId,
			startingQty,
			delta,
			endingQty: newQty,
			status: status,
		};
	} catch (err) {
		await client.query('ROLLBACK');
		throw err;
	} finally {
		client.release();
	}
};

const getBatchByNumber = async (product_id, batch_number) => {
	const { rows } = await pool.query(
		`SELECT * FROM batches WHERE product_id=$1 AND batch_number=$2`,
		[product_id, batch_number],
	);
	return rows[0] || null;
};

const createBatch = async ({
	product_id,
	company_id,
	batch_number,
	total_quantity,
	unit,
	cost_per_unit,
	supplier_name,
}) => {
	const { rows } = await pool.query(
		`INSERT INTO batches (product_id, company_id, batch_number, total_quantity, unit, cost_per_unit, supplier_name)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
		[
			product_id,
			company_id,
			batch_number,
			total_quantity,
			unit,
			cost_per_unit,
			supplier_name,
		],
	);
	return rows[0];
};

const getPackageByLot = async (productId, lotNumber) => {
	const { rows } = await pool.query(
		`SELECT * FROM packages WHERE product_id = $1 AND lot_number = $2`,
		[productId, lotNumber],
	);

	if (!rows || rows.length === 0) return null;

	return rows[0] || null;
};

const getPackage = async (packageId, companyId) => {
	const { rows } = await pool.query(
		`SELECT * FROM packages WHERE id=$1 AND company_id=$2`,
		[packageId, companyId],
	);
	return rows[0];
};

// const getAllPackages = async (companyId) => {
// 	const { rows } = await pool.query(
// 		`SELECT * FROM packages WHERE company_id=$1`,
// 		[companyId],
// 	);

// 	return rows || null;
// };

const adjustProductInventory = async (
	packages_id,
	movement_type,
	quantity,
	notes,
	userId,
) => {
	const client = await pool.connect();

	try {
		await client.query('BEGIN');

		const current = await client.query(
			`SELECT quantity FROM packages WHERE id=$1 FOR UPDATE`,
			[packages_id],
		);

		if (current.rows.length === 0) {
			throw new Error('Inventory record not found');
		}

		const startingQty = Number(current.rows[0].quantity);

		if (quantity < 0) {
			throw new Error('New quantity cannot be negative');
		}

		const endingQty = Number(quantity);
		const delta = endingQty - startingQty;

		const movementUpdate = await client.query(
			`
      INSERT INTO inventory_movements (
        packages_id,
        user_id,
        movement_type,
        starting_quantity,
        quantity,
        ending_quantity,
        notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
			[
				packages_id,
				userId,
				movement_type,
				startingQty,
				delta,
				endingQty,
				notes,
			],
		);

		const inventoryUpdate = await client.query(
			`UPDATE packages 
             SET quantity = $1 
             WHERE id = $2`,
			[endingQty, packages_id],
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
	packages_id,
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
			`SELECT quantity FROM packages WHERE id=$1`,
			[packages_id],
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
			`INSERT INTO inventory_movements (packages_id, movement_type, quantity, cost_per_unit, notes, user_id) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
			[packages_id, reason, delta, unit_price, notes, userId],
		);

		await client.query(
			`UPDATE packages 
     SET quantity = $1,
         cost_price = $2,
         supplier_name = $3,
         lot_number = $4,
		 batch_id = $5
     WHERE id = $6`,
			[newQty, unit_price, vendor, batch, packages_id, batchId],
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
		`SELECT * FROM packages WHERE product_id=$1`,
		[productId],
	);
	return rows;
};

const getProductInventory = async (productId) => {
	const { rows } = await pool.query(
		`
		SELECT *, COALESCE(cost_price, 0) AS cost_price
		FROM packages 
		WHERE product_id=$1
		  AND lot_number IS NOT NULL
		  AND lot_number <> ''
		ORDER BY created_at, location
		`,
		[productId],
	);

	const batchesMap = {};
	rows.forEach((pkg) => {
		if (!pkg.source_lot_id) {
			batchesMap[pkg.id] = { ...pkg, packages: [] };
		}
	});

	rows.forEach((pkg) => {
		if (pkg.source_lot_id) {
			const source = batchesMap[pkg.source_lot_id];
			if (source) {
				source.packages.push(pkg);
			} else {
				batchesMap[pkg.id] = { ...pkg, packages: [] };
			}
		}
	});

	return Object.values(batchesMap);
};

const getPackagesByProductId = async (productId) => {
	const { rows } = await pool.query(
		`SELECT * FROM packages WHERE product_id = $1 ORDER BY created_at`,
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
	signupAdmin,
	getUserByEmail,
	adjustProductInventory,
	getInventoryId,
	receiveInventory,
	getProductInventory,
	applyInventoryMovement,
	getPackageByLot,
	getProductWithInventoryDB,
	insertBrand,
	splitPackageTransaction,
	getPackagesByProductId,
	createBatch,
	getBatchByNumber,
	getAllPackages,
	getPackage,
	getAuditTrail,
	getCategoryById,
};
