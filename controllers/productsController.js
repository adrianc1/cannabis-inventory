const db = require('../db/queries');
const { convertQuantity } = require('../utils/conversion');

const getAllProducts = async (req, res) => {
	try {
		const userCompanyId = req.user.company_id;
		const products = await db.getAllProductsDB(userCompanyId);
		res.render('products/products', { message: 'All Products', products });
	} catch (error) {
		res.status(500).json({ error: 'Database error' });
	}
};

const getProduct = async (req, res) => {
	try {
		console.log('Fetching product with id:', req.params.id);

		const product = await db.getProductDB(req.params.id);
		const productInventory = await db.getProductInventory(req.params.id);

		if (!product) {
			res.status(404).json({ error: 'Product not found' });
			return;
		}

		let totalInventory = 0;

		if (productInventory.length > 0) {
			totalInventory = productInventory.reduce(
				(sum, batch) => sum + Number(batch.quantity),
				0,
			);
		}

		totalInventory = Number(totalInventory.toFixed(2));

		let totalValuation = 0;
		let totalQuantity = 0;

		productInventory.forEach((batch) => {
			const qty = Number(batch.quantity);
			const cost = Number(batch.cost_price);

			totalValuation += qty * cost;
			totalQuantity += qty;
		});

		totalValuation = Number(totalValuation.toFixed(2));

		const averageCost =
			totalQuantity > 0
				? Number((totalValuation / totalQuantity).toFixed(2))
				: 0;

		console.log('productInventory:', productInventory);
		console.log('valuation:', totalValuation);
		console.log('quantity sum:', totalQuantity);

		res.render('products/product', {
			product,
			productInventory,
			totalValuation,
			totalInventory,
			averageCost,
		});
	} catch (error) {
		res.status(500).json({ error: 'Database error retreiving single product' });
	}
};

const createProductForm = async (req, res) => {
	const units = ['mg', 'g', 'kg', 'oz', 'lb', 'ml', 'l', 'each'];
	try {
		const brands = await db.getAllBrands();
		const strains = await db.getAllStrains();
		const categories = await db.getAllCategories();

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

const insertProduct = async (req, res) => {
	const userCompanyId = req.user.company_id;
	const { name, description, unit, brandId, strainId, categoryId, sku } =
		req.body;
	const product = await db.insertProduct(
		name,
		description,
		unit,
		brandId,
		strainId,
		categoryId,
		userCompanyId,
		sku,
	);
	res.redirect(`/products/${product.id}`);
};

const deleteProduct = async (req, res) => {
	await db.deleteProduct(req.params.id);
	res.status(200).json({ success: true });
};

const editProductForm = async (req, res) => {
	const units = ['mg', 'g', 'kg', 'oz', 'lb', 'ml', 'l', 'each'];

	try {
		const brands = await db.getAllBrands();
		const strains = await db.getAllStrains();
		const categories = await db.getAllCategories();
		const product = await db.getProductDB(req.params.id);

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
	const { name, description, unit, brandId, strainId, categoryId } = req.body;
	await db.updateProduct(
		name,
		description,
		unit,
		brandId,
		strainId,
		categoryId,
		id,
	);
	res.status(200).json({ success: true });
};

const receiveInventoryPut = async (req, res) => {
	const product_id = req.params.id;
	const product = await db.getProductDB(product_id);
	const userId = req.user.id;
	const company_id = req.user.company_id;
	const { quantity, unit, unit_price, reason, notes, vendor, batch } = req.body;
	const existingInventory = await db.getInventoryByBatch(
		product_id,
		'backroom',
		batch,
	);
	const inventory_id = existingInventory ? existingInventory.id : null;

	const normalizedQty = convertQuantity(quantity, unit, product.unit);

	await db.applyInventoryMovement({
		product_id,
		inventory_id,
		company_id,
		location: 'backroom',
		batch,
		delta: Number(normalizedQty),
		movement_type: reason,
		notes,
		cost_per_unit: unit_price,
		userId,
	});
	res.status(200).json({ success: true });
};

const adjustInventoryGet = async (req, res) => {
	const units = ['mg', 'g', 'kg', 'oz', 'lb', 'ml', 'l', 'each'];

	try {
		const lotNumber = req.params.lotNumber;
		const product = await db.getProductDB(req.params.id);
		const brand = await db.getBrand(product.brand_id);
		const strain = await db.getStrain(product.strain_id);
		const category = await db.getSingleCategory(product.category_id);
		const selectedBatch = await db.getInventoryByLot(product.id, lotNumber);

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

		if (!product) {
			res.status(404).json({ error: 'Product not found' });
			return;
		}
		if (!brand || !strain || !category) {
			res.status(404).json({ error: 'No Brands, Strain, or Category Found' });
		}

		res.render('products/adjustInventory', {
			product,
			brand,
			strain,
			category,
			units,
			adjustmentReasons,
			selectedBatch,
		});
	} catch (error) {
		console.error(error);
	}
};

const updateInventory = async (req, res) => {
	const id = req.params.id;
	const lotNumber = req.params.lotNumber;
	const userId = req.user.id;

	const selectedBatch = await db.getInventoryByLot(id, lotNumber);

	const { quantity, movement_type, notes } = req.body;
	await db.applyInventoryMovement({
		product_id: id,
		inventory_id: selectedBatch.id,
		company_id: selectedBatch.company_id,
		location: selectedBatch.location,
		delta: Number(quantity),
		movement_type,
		notes,
		cost_per_unit: selectedBatch.cost_price || null,
		userId,
	});

	res.status(200).json({ success: true });
};

const receiveInventoryGet = async (req, res) => {
	const units = ['mg', 'g', 'kg', 'oz', 'lb', 'ml', 'l', 'each'];

	try {
		const id = req.params.id;
		const product = await db.getProductDB(req.params.id);
		const brand = await db.getBrand(product.brand_id);
		const strain = await db.getStrain(product.strain_id);
		const category = await db.getSingleCategory(product.category_id);
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
};
