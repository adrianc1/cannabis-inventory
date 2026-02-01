const { adjustInventory } = require('../../controllers/inventoryController');
const db = require('../../db/queries');

jest.mock('../../db/queries');

describe('adjustInventory Controller', () => {
	test('adjusts inventory successfully', async () => {
		db.adjustProductInventory.mockResolvedValue(true);

		const req = {
			body: {
				inventory_id: 4,
				quantity: 25,
				movement_type: 'adjustment',
				notes: 'Cycle count',
			},
			session: { user: { id: 2, company_id: 1 } },
		};

		const res = {
			redirect: jest.fn(),
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};

		await adjustInventory(req, res);

		expect(db.adjustProductInventory).toHaveBeenCalled();

		expect(res.redirect).toHaveBeenCalledWith('/inventory');
	});

	test('returns 500 on error', async () => {
		db.adjustProductInventory.mockRejectedValue(new Error());

		const req = {
			body: { inventory_id: 1 },
			session: { user: { id: 1, company_id: 1 } },
		};

		const res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};

		await adjustInventory(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
	});
});
