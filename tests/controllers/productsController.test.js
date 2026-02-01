const { getAllProducts } = require('../../controllers/productsController');
const db = require('../../db/queries');

jest.mock('../../db/queries');

describe('Products Controller', () => {
	test('getAllProducts renders the products page with data', async () => {
		const fakeProducts = [
			{ id: 1, name: 'Blue Dream 7g', price: 49.99 },
			{ id: 2, name: 'Sour Diesel 3.5g', price: 29.99 },
		];

		db.getAllProductsDB.mockResolvedValue(fakeProducts);

		const res = {
			render: jest.fn(),
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};

		const req = {};

		await getAllProducts(req, res);

		expect(db.getAllProductsDB).toHaveBeenCalledTimes(1);

		expect(res.render).toHaveBeenCalledWith('index', {
			message: 'All Products',
			products: fakeProducts,
		});
	});

	test('getAllProducts renders page with empty products array', async () => {
		db.getAllProductsDB.mockResolvedValue([]);

		const res = {
			render: jest.fn(),
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};

		const req = {};

		await getAllProducts(req, res);

		expect(res.render).toHaveBeenCalledWith('index', {
			message: 'All Products',
			products: [],
		});
	});

	test('getAllProducts returns 500 on database error', async () => {
		db.getAllProductsDB.mockRejectedValue(new Error('DB failure'));

		const res = {
			render: jest.fn(),
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};

		const req = {};

		await getAllProducts(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			error: 'Failed to fetch products',
		});
	});
});
