const db = require('../db/queries');

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

		if (!product) {
			res.status(404).json({ error: 'Product not found' });
			return;
		}
		console.log('the product you want=====', product);
		res.render('products/product', { product });
	} catch (error) {
		res.status(500).json({ error: 'Database error retreiving single product' });
	}
};

const createProductForm = async (req, res) => {
	const units = ['g', 'mg', 'oz', 'each'];
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
	const { name, description, unit, brandId, strainId, categoryId } = req.body;
	const product = await db.insertProduct(
		name,
		description,
		unit,
		brandId,
		strainId,
		categoryId,
		userCompanyId,
	);
	res.redirect(`/products/${product.id}`);
};

const deleteProduct = async (req, res) => {
	await db.deleteProduct(req.params.id);
	res.status(200).json({ success: true });
};

const editProductForm = async (req, res) => {
	const units = ['g', 'mg', 'oz', 'each'];

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
	console.log(req.params.id, 'ITS THE ID!', req.body);
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

const adjustInventoryGet = async (req, res) => {
	const units = ['g', 'mg', 'oz', 'each'];

	try {
		const product = await db.getProductDB(req.params.id);
		const brand = await db.getBrand(product.brand_id);
		const strain = await db.getStrain(product.strain_id);
		const category = await db.getSingleCategory(product.category_id);

		console.log('current selected product==', brand);

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
};
