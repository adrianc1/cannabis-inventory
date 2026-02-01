const { createProduct } = require('../../controllers/productsController');
const db = require('../../db/queries');

jest.mock('../../db/queries');

describe('createProduct Controller', () => {
	test('creates product and redirects', async () => {
		db.createProductDB.mockResolvedValue({ id: 1 });

		const req = {
			body: {
				name: 'Blue Dream',
				sku: 'BD-001',
				brand_id: 1,
				category_id: 2,
			},
			session: { user: { company_id: 5 } },
		};

		const res = {
			redirect: jest.fn(),
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};

		await createProduct(req, res);

		expect(db.createProductDB).toHaveBeenCalledWith({
			...req.body,
			company_id: 5,
		});

		expect(res.redirect).toHaveBeenCalledWith('/products');
	});

	test('returns 400 if name missing', async () => {
		const req = { body: {}, session: {} };

		const res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};

		await createProduct(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
	});

	test('returns 500 on db error', async () => {
		db.createProductDB.mockRejectedValue(new Error());

		const req = {
			body: { name: 'Test' },
			session: { user: { company_id: 1 } },
		};

		const res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};

		await createProduct(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
	});
});
