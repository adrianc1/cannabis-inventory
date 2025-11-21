const getAllProducts = require('../../controllers/productsController');
const { getAllProductsDB } = require('../../db/queries');
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

		expect(res.render).toHaveBeenCalledWith('index', {
			message: 'All Products',
			products: fakeProducts,
		});
	});
});
