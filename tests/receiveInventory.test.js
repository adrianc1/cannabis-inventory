const { receiveInventory } = require('../../controllers/inventoryController');
const db = require('../../db/queries');

jest.mock('../../db/queries');

describe('receiveInventory Controller', () => {
	test('receives inventory successfully', async () => {
		db.receiveInventoryDB.mockResolvedValue(true);

		const req = {
			body: {
				inventory_id: 10,
				quantity: 50,
				cost_per_unit: 4.25,
				notes: 'Initial stock',
			},
			session: { user: { id: 3, company_id: 1 } },
		};

		const res = {
			redirect: jest.fn(),
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};

		await receiveInventory(req, res);

		expect(db.receiveInventoryDB).toHaveBeenCalled();

		expect(res.redirect).toHaveBeenCalledWith('/inventory');
	});

	test('returns 500 on error', async () => {
		db.receiveInventoryDB.mockRejectedValue(new Error());

		const req = {
			body: { inventory_id: 1 },
			session: { user: { id: 1, company_id: 1 } },
		};

		const res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};

		await receiveInventory(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
	});
});
