const { body } = require('express-validator');
const { totalCount } = require('../db/pool');
const db = require('../db/queries');
const { convertQuantity } = require('../utils/conversion');

const getAllProducts = async (req, res) => {
	try {
		const userCompanyId = req.user.company_id;
		const packages = await db.getAllPackages(userCompanyId);
		res.render('products/products', { message: 'All Packages', packages });
	} catch (error) {
		res.status(500).json({ error: 'Database error' });
	}
};

const receiveNewPackageForm = async (req, res) => {
	const product = { unit: 'N/a' };
	const products = await db.getAllProductsDB(req.user.company_id);

	res.render('products/receiveAll.ejs', { products, product });
};

const receiveNewPackagesPOST = async (req, res) => {
	const userId = req.user.id;
	const company_id = req.user.company_id;

	const {
		quantity,
		unit,
		unit_price,
		reason,
		notes,
		vendor,
		batch,
		package_size,
		package_tag,
		product_id,
	} = await req.body;

	if (!product_id) {
		return res
			.status(400)
			.json({ error: 'Please select a product before submitting.' });
	}

	const normalizedQty = convertQuantity(quantity, unit, unit);

	let existingBatch = await db.getBatchByNumber(product_id, batch);

	let batch_id;

	if (existingBatch) {
		batch_id = existingBatch.id;
	} else {
		const newBatch = await db.createBatch({
			product_id,
			company_id,
			batch_number: batch,
			total_quantity: normalizedQty,
			unit,
			cost_per_unit: unit_price,
			supplier_name: vendor,
		});
	}

	await db.applyInventoryMovement({
		package_tag,
		product_id,
		packages_id: null,
		batch_id,
		company_id,
		location: 'backroom',
		batch,
		targetQty: Number(normalizedQty),
		movement_type: reason,
		notes,
		cost_per_unit: unit_price,
		userId,
		status: 'active',
		package_size: package_size || null,
		unit,
	});
	res.redirect(`/packages/${product_id}`);
};

const getProduct = async (req, res) => {
	try {
		const product = await db.getProductWithInventoryDB(req.params.id);
		const productInventory = await db.getProductInventory(req.params.id);
		const packages = await db.getAuditTrail(req.params.id);

		if (!product) {
			res.status(404).json({ error: 'Product not found' });
			return;
		}

		res.render('products/product', {
			product,
			productInventory,
			packages,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Database error retrieving single product' });
	}
};

const createProductForm = async (req, res) => {
	const units = ['mg', 'g', 'kg', 'oz', 'lb', 'ml', 'l', 'each'];
	try {
		const brands = await db.getAllBrands(req.user.company_id);
		const strains = await db.getAllStrains(req.user.company_id);
		const categories = await db.getAllCategories(req.user.company_id);

		if (!brands || !strains || !categories) {
			res.status(404).json({ error: 'No Brands Found' });
		}

		res.render('products/createProductForm', {
			brands,
			strains,
			categories,
			units,
		});
	} catch (error) {
		console.error(error);
	}
};

const splitPackageProductForm = async (req, res) => {
	const selectedPackage = await db.getPackage(
		req.params.id,
		req.user.company_id,
	);
	const product = await db.getProductDB(
		selectedPackage.product_id,
		selectedPackage.company_id,
	);
	const products = await db.getAllProductsDB(req.user.company_id);
	// const selectedPackage = await db.getPackageByLot(product.id, lotNumber);

	res.render('products/splitPackageProductForm', {
		product,
		products,
		selectedPackage,
	});
};

const splitPackagePost = async (req, res) => {
	const package_id = req.params.id;
	const userId = req.user.id;
	const selectedBatch = await db.getPackage(
		package_id,
		Number(req.user.company_id),
	);

	const { productId, packageSize, quantity, batch, packageTag } = req.body;

	const unit = selectedBatch.unit;
	let totalUsed = 0;
	let orignalPackageQty = parseFloat(selectedBatch.quantity);

	const packageSizes = packageSize || quantity.map(() => 1);

	const splits = productId.map((_, i) => {
		const qty = 1;
		const size = parseFloat(packageSizes[i]) || 1;

		const weight = unit === 'each' ? qty : size * qty;

		totalUsed += weight;

		return {
			productId: parseFloat(productId[i]),
			packageSize: unit === 'each' ? null : size,
			quantity: qty,
			totalWeight: weight,
			childLotNumber: batch[i],
			package_tag: packageTag[i],
		};
	});

	if (totalUsed > orignalPackageQty) {
		return res.status(400).send('Split exceeds available quantity');
	}

	await db.splitPackageTransaction(selectedBatch, splits, userId);
	res.redirect('/');
};

const insertProduct = async (req, res) => {
	const userCompanyId = req.user.company_id;
	const {
		name,
		description,
		unit,
		brandId,
		strainId,
		newStrainName,
		newBrandName,
		newCategoryName,
		categoryId,
		sku,
	} = req.body;

	let newStrain, newBrand, newCategory;

	if (newStrainName?.trim()) {
		newStrain = await db.insertStrain(newStrainName, req.user.company_id);
	} else {
		newStrain = null;
	}

	if (newBrandName?.trim()) {
		newBrand = await db.insertBrand(newBrandName, req.user.company_id);
	} else {
		newBrand = null;
	}
	if (newCategoryName?.trim()) {
		newCategory = await db.insertCategory(newCategoryName, req.user.company_id);
	} else {
		newCategory = null;
	}

	const strain_id = strainId || newStrain?.id || null;
	const brand_id = brandId || newBrand?.id || null;
	const category_id = categoryId || newCategory?.id || null;

	const product = await db.insertProduct(
		name,
		description,
		unit,
		brand_id,
		strain_id,
		category_id,
		userCompanyId,
		sku,
	);
	res.redirect(`/packages/${product.id}`);
};

const deleteProduct = async (req, res) => {
	const result = await db.deleteProduct(req.params.id);

	if (result.rowCount === 0) {
		return res.status(400).json({
			success: false,
			message: 'Cannot delete product with exisiting inventory quantity',
		});
	}
	res.status(200).json({ success: true });
};

const editProductForm = async (req, res) => {
	const units = ['mg', 'g', 'kg', 'oz', 'lb', 'ml', 'l', 'each'];

	try {
		const brands = await db.getAllBrands(req.user.company_id);
		const strains = await db.getAllStrains(req.user.company_id);
		const categories = await db.getAllCategories(req.user.company_id);
		const product = await db.getProductDB(req.params.id, req.user.company_id);

		if (!product) {
			res.status(404).json({ error: 'Product not found' });
			return;
		}
		if (!brands || !strains || !categories) {
			res.status(404).json({ error: 'No Brands Found' });
		}

		res.render('products/editProductForm', {
			product,
			brands,
			strains,
			categories,
			units,
		});
	} catch (error) {
		console.error(error);
	}
};

const updateProduct = async (req, res) => {
	const id = req.params.id;
	const company_id = req.user.company_id;
	const { name, description, unit, brandId, strainId, categoryId, status } =
		req.body;
	await db.updateProduct(
		name,
		description,
		unit,
		company_id,
		brandId,
		strainId,
		categoryId,
		id,
	);
	res.json({ success: true });
};

const receiveInventoryPut = async (req, res) => {
	const userId = req.user.id;
	const company_id = req.user.company_id;
	const product_id = req.params.id;

	const {
		quantity,
		unit,
		unit_price,
		reason,
		notes,
		vendor,
		batch,
		package_size,
		package_tag,
	} = req.body;

	const product = await db.getProductDB(product_id, req.user.company_id);
	const existingInventory = await db.getPackageByLot(product_id, batch);
	const newBatch = await db.createBatch({
		product_id,
		company_id,
		batch_number: batch,
		total_quantity: quantity,
		unit,
		cost_per_unit: unit_price,
		supplier_name: vendor,
	});

	const batch_id = newBatch.id;

	const package_id = existingInventory ? existingInventory.id : null;

	const normalizedQty = convertQuantity(quantity, unit, product.unit);

	await db.applyInventoryMovement({
		package_tag,
		product_id,
		packages_id: package_id,
		batch_id,
		company_id,
		location: 'backroom',
		batch,
		targetQty: Number(normalizedQty),
		movement_type: reason,
		notes,
		cost_per_unit: unit_price,
		userId,
		status: 'active',
		package_size: package_size || null,
		unit,
	});
	res.redirect(`/packages/${product_id}`);
};

const adjustInventoryGet = async (req, res) => {
	const units = ['mg', 'g', 'kg', 'oz', 'lb', 'ml', 'l', 'each'];

	const statusOptions = [
		'active',
		'inactive',
		'quarantine',
		'damaged',
		'expired',
		'reserved',
	];

	try {
		const lotNumber = req.params.lotNumber;
		const package = await db.getPackage(
			Number(req.params.id),
			Number(req.user.company_id),
		);

		const product = await db.getProductDB(
			package.product_id,
			req.user.company_id,
		);

		if (!product) {
			res.status(404).json({ error: 'Product not found' });
			return;
		}
		const brand = product.brand_id
			? await db.getBrand(product.brand_id, req.user.company_id)
			: null;
		const strain = product.strain_id
			? await db.getStrain(product.strain_id, req.user.company_id)
			: null;
		const category = product.category_id
			? await db.getSingleCategory(product.category_id, req.user.company_id)
			: null;

		const adjustmentReasons = [
			'Audit/Cycle Count',
			'Drying/Moisture Loss',
			'Laboratory Testing',
			'Damaged Goods',
			'Expired Product',
			'Waste/Spoilage',
			'Internal Quality Control',
			'Theft/Loss',
			'Data Entry Error',
			'Promotional/Sample',
			'Return to Vendor',
			'Seizure/Legal Compliance',
		];

		res.render('products/adjustInventory', {
			product,
			brand,
			strain,
			category,
			units,
			adjustmentReasons,
			statusOptions,
			package,
		});
	} catch (error) {
		console.error(error);
	}
};

const updateInventory = async (req, res) => {
	const id = req.params.id;
	const lotNumber = req.params.lotNumber;
	const userId = req.user.id;

	const selectedBatch = await db.getPackage(id, req.user.company_id);

	const { quantity, movement_type, notes, cost_price_unit, status } = req.body;

	console.log('the real STATUS===', req.body);

	try {
		await db.applyInventoryMovement({
			package_tag: selectedBatch.package_tag,
			product_id: id,
			packages_id: selectedBatch.id,
			batch_id: selectedBatch.batch_id,
			company_id: selectedBatch.company_id,
			location: selectedBatch.location,
			batch: lotNumber,
			targetQty: Number(quantity),
			movement_type,
			notes,
			cost_per_unit: cost_price_unit || null,
			userId,
			status,
		});

		res.json({ success: true });
	} catch (err) {
		console.error('update inventory error:', err);
		res.status(500).json({ success: true, error: err.message });
	}
};

const receiveInventoryGet = async (req, res) => {
	const units = ['mg', 'g', 'kg', 'oz', 'lb', 'ml', 'l', 'each'];

	try {
		const id = req.params.id;
		const product = await db.getProductDB(req.params.id, req.user.company_id);
		const brand = product.brand_id
			? await db.getBrand(product.brand_id, req.user.company_id)
			: null;
		const strain = product.strain_id
			? await db.getStrain(product.strain_id, req.user.company_id)
			: null;
		const category = product.category_id
			? await db.getSingleCategory(product.category_id, req.user.company_id)
			: null;

		const adjustmentReason = 'Receive';
		res.render('products/receiveInventory', {
			product,
			brand,
			strain,
			category,
			units,
			adjustmentReason,
		});
	} catch (error) {
		console.error(error);
	}
};

module.exports = {
	getAllProducts,
	getProduct,
	createProductForm,
	updateProduct,
	deleteProduct,
	insertProduct,
	editProductForm,
	adjustInventoryGet,
	updateInventory,
	receiveInventoryGet,
	receiveInventoryPut,
	splitPackageProductForm,
	splitPackagePost,
	receiveNewPackageForm,
	receiveNewPackagesPOST,
};
