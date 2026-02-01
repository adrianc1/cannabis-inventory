const express = require('express');
const productsController = require('../controllers/productsController');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/authMiddleware');

router.get('/', ensureAuthenticated, productsController.getAllProducts);
router.get(
	'/create-product',
	ensureAuthenticated,
	productsController.createProductForm,
);
router.post('/create-product', productsController.insertProduct);

router.get('/:id/receive', productsController.receiveInventoryGet);
router.get(
	'/:id/edit',
	ensureAuthenticated,
	productsController.editProductForm,
);

router.get(
	'/:id/adjust',
	ensureAuthenticated,
	productsController.adjustInventoryGet,
);

router.put('/:id/adjust', productsController.updateInventory);
router.put('/:id/receive', productsController.receiveInventoryPut);

router.put('/:id', productsController.updateProduct);

router.delete('/:id', productsController.deleteProduct);
router.get('/:id', ensureAuthenticated, productsController.getProduct);

module.exports = router;
