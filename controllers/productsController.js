const db = require('../db/queries');

const getAllProducts = async (req, res) => {
	try {
		const products = await db.getAllProductsDB();
		res.render('products', { message: 'All Products', products });
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
		res.render('product', { product });
	} catch (error) {
		res.status(500).json({ error: 'Database error retreiving single product' });
	}
};
const createProductForm = async (req, res) => {
	try {
		const brands = await db.getAllBrands();
		const strains = await db.getAllStrains();
		const categories = await db.getAllCategories();

		if (!brands || !strains || !categories) {
			res.status(404).json({ error: 'No Brands Found' });
		}

		res.render('createProductForm', { brands, strains, categories });
	} catch (error) {
		console.error(error);
	}
};

const insertProduct = async (req, res) => {
	const { name, description, price, unit, brandId, strainId, categoryId } =
		req.body;
	const product = await db.insertProduct(
		name,
		description,
		price,
		unit,
		brandId,
		strainId,
		categoryId
	);
	res.redirect(`/products/${product.id}`);
};

const deleteProduct = async (req, res) => {
	await db.deleteProduct(req.params.id);
	res.status(200).json({ success: true });
};

const updateProduct = async (req, res) => {};

module.exports = {
	getAllProducts,
	getProduct,
	createProductForm,
	updateProduct,
	deleteProduct,
	insertProduct,
};
